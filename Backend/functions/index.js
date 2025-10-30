
/**
 * This is the full backend for the Hybrid (Firestore + Realtime Database) app.
 *
 * FUNCTIONS:
 * - onUserCreate (Firestore Trigger): Creates a user profile in Firestore.
 * - onTaskCreate (Firestore Trigger):
 * 1. Syncs the new task's location to the Realtime Database (RTDB) for GeoFire.
 * 2. Sends push notifications to all nearby helpers.
 * - onTaskUpdate (Firestore Trigger):
 * 1. Detects when a task is "claimed", "completed", or "cancelled".
 * 2. Deletes the task's location from RTDB to remove it from all live maps.
 * - acceptTask (Callable): Allows a helper to securely accept a task (limit 1).
 * - completeTask (Callable): Allows a requester to securely mark a task as done.
 * - cancelTask (Callable): Allows a requester to securely cancel their task.
 */


const { initializeApp } = require("firebase-admin/app");
const {
  getFirestore,
  FieldValue,
  GeoPoint,
} = require("firebase-admin/firestore");
const { getDatabase } = require("firebase-admin/database");
const { getMessaging } = require("firebase-admin/messaging");
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const { GeoFire } = require("geofire");

const { distanceBetween } = require("geofire-common");

initializeApp();
const db = getFirestore();
const rtdb = getDatabase();
const messaging = getMessaging();

const geoFire = new GeoFire(rtdb.ref("/task_locations"));

const MILES_TO_KM = 1.60934;
const NOTIFICATION_RADIUS_KM = 5 * MILES_TO_KM;

exports.onUserCreate = functions.auth.user().onCreate((user) => {
  console.log(`i onUserCreate: Creating profile for UID: ${user.uid}`);
  const userProfile = {
    email: user.email,
    displayName: user.displayName || "New User",
    createdAt: FieldValue.serverTimestamp(),
    isAcceptingTasks: false,
    location: null,
    pushToken: null,
    userRole: "helper",
    activeTaskId: null,
  };

  return db.collection("users").doc(user.uid).set(userProfile);
});

exports.createTask = functions.https.onCall(async (data, context) => {
  const { auth } = context;
  const { title, details, location } = data;

  if (!auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to create a task."
    );
  }

  if (!title || title.trim() === "") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Task must have a title."
    );
  }
  if (!location || !location.latitude || !location.longitude) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Task must have a valid location."
    );
  }

  let requesterInfo = {
    uid: auth.uid,
    displayName: "User",
    email: auth.token.email || null,
  };

  try {
    const userDoc = await db.collection("users").doc(auth.uid).get();
    if (userDoc.exists) {
      requesterInfo.displayName = userDoc.data().displayName || "User";
    }
  } catch (error) {
    console.warn(
      `e createTask: Could not fetch user profile for ${auth.uid}`,
      error
    );
  }

  const newTask = {
    title: title,
    details: details || null,
    requesterId: auth.uid,
    requesterInfo: requesterInfo,
    status: "pending",
    location: new GeoPoint(location.latitude, location.longitude),
    createdAt: FieldValue.serverTimestamp(),
    helperInfo: null,
    claimedAt: null,
    completedAt: null,
  };

  try {
    const taskRef = await db.collection("tasks").add(newTask);
    console.log(`i createTask: Task ${taskRef.id} created by ${auth.uid}`);
    return { success: true, taskId: taskRef.id };
  } catch (error) {
    console.error("e createTask: Failed to create task in Firestore.", error);
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while creating the task."
    );
  }
});

exports.onTaskCreate = functions.firestore
  .document("tasks/{taskId}")
  .onCreate(async (snap, context) => {
    const { taskId } = context.params;
    const taskData = snap.data();

    const { location, title, requesterId, status } = taskData;

    if (status !== "pending") {
      console.log(
        `i onTaskCreate: Task ${taskId} created with status '${status}', not adding to RTDB or notifying.`
      );
      return null;
    }
    if (!location) {
      console.log(
        `i onTaskCreate: Task ${taskId} is pending but has no location. Skipping.`
      );
      return null;
    }

    console.log(`i onTaskCreate: New pending task ${taskId}. Proceeding...`);
    const taskLocation = [location.latitude, location.longitude];

    try {
      await geoFire.set(taskId, taskLocation);
      console.log(
        `i onTaskCreate: Synced location for task ${taskId} to RTDB.`
      );
    } catch (error) {
      console.error(
        `e onTaskCreate: Failed to sync location for ${taskId}.`,
        error
      );
    }

    console.log(`i onTaskCreate: Finding nearby users for task ${taskId}...`);
    const allUsersSnap = await db.collection("users").get();
    const notificationTokens = [];

    allUsersSnap.forEach((userDoc) => {
      const userData = userDoc.data();
      const {
        location: userLocation,
        pushToken,
        isAcceptingTasks,
        activeTaskId,
      } = userData;
      console.log(
        "Checking user:",
        userDoc.id,
        "with location:",
        userLocation,
        "and pushToken:",
        pushToken,
        "isAcceptingTasks:",
        isAcceptingTasks
      );

      if (
        userDoc.id !== requesterId &&
        userLocation &&
        pushToken &&
        isAcceptingTasks === true &&
        !activeTaskId
      ) {
        const userLoc = [userLocation.latitude, userLocation.longitude];
        console.log("user location:", userLoc, "task location:", taskLocation);
        const distance = distanceBetween(userLoc, taskLocation);

        if (distance <= NOTIFICATION_RADIUS_KM) {
          notificationTokens.push(pushToken);
          console.log(`- Found nearby user: ${userDoc.id}`);
        }
      }
    });

    if (notificationTokens.length === 0) {
      console.log("i onTaskCreate: No nearby users found to notify.");
      return null;
    }

    console.log(
      `i onTaskCreate: Sending ${notificationTokens.length} notifications.`
    );
    const message = {
      notification: {
        title: "New Task Available Nearby!",
        body: title || "A new task is available in your area.",
      },
      tokens: notificationTokens,
      data: {
        taskId: taskId,
        type: "NEW_TASK",
      },
    };

    try {
      const response = await messaging.sendEachForMulticast(message);
      console.log(
        `i onTaskCreate: Successfully sent ${response.successCount} messages.`
      );
      if (response.failureCount > 0) {
        console.warn(
          `i onTaskCreate: Failed to send ${response.failureCount} messages.`
        );
      }
    } catch (error) {
      console.error("e onTaskCreate: Error sending multicast message:", error);
    }

    return null;
  });

exports.onTaskUpdate = functions.firestore
  .document("tasks/{taskId}")
  .onUpdate(async (change, context) => {
    const { taskId } = context.params;
    const beforeData = change.before.data();
    const afterData = change.after.data();

    const wasPending = beforeData.status === "pending";
    const isNowFinished =
      afterData.status === "claimed" ||
      afterData.status === "completed" ||
      afterData.status === "cancelled";

    if (wasPending && isNowFinished) {
      console.log(
        `i onTaskUpdate: Task ${taskId} is no longer pending (status: ${afterData.status}). Removing from RTDB.`
      );
      try {
        await geoFire.remove(taskId);
        console.log(
          `i onTaskUpdate: Successfully removed ${taskId} from RTDB.`
        );
      } catch (error) {
        console.error(
          `e onTaskUpdate: Failed to remove ${taskId} from RTDB.`,
          error
        );
      }
      return null;
    }

    const wasNotPending = beforeData.status !== "pending";
    const isNowPending = afterData.status === "pending";

    if (wasNotPending && isNowPending) {
      console.log(
        `i onTaskUpdate: Task ${taskId} is now pending (was ${beforeData.status}). Re-adding to RTDB.`
      );
      const { location } = afterData;

      if (location) {
        try {
          const taskLocation = [location.latitude, location.longitude];
          await geoFire.set(taskId, taskLocation);
          console.log(
            `i onTaskUpdate: Successfully re-added ${taskId} to RTDB.`
          );
        } catch (error) {
          console.error(
            `e onTaskUpdate: Failed to re-add ${taskId} to RTDB.`,
            error
          );
        }
      } else {
        console.warn(
          `i onTaskUpdate: Task ${taskId} re-became pending, but has no location. Skipping RTDB add.`
        );
      }
      return null;
    }

    console.log(
      `i onTaskUpdate: No RTDB change needed for task ${taskId} (status ${beforeData.status} -> ${afterData.status}).`
    );
    return null;
  });

exports.acceptTask = functions.https.onCall(async (data, context) => {
  const { auth } = context;
  const { taskId } = data;

  if (!auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to accept a task."
    );
  }

  if (!taskId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a 'taskId'."
    );
  }

  const taskRef = db.collection("tasks").doc(taskId);
  const helperRef = db.collection("users").doc(auth.uid);

  try {
    return await db.runTransaction(async (t) => {
      const taskDoc = await t.get(taskRef);
      const helperDoc = await t.get(helperRef);

      if (!taskDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "This task no longer exists."
        );
      }
      if (!helperDoc.exists) {
        throw new functions.https.HttpsError(
          "internal",
          "Could not find your user profile."
        );
      }

      const taskData = taskDoc.data();
      const helperData = helperDoc.data();

      if (helperData.activeTaskId) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "You already have an active task. Please complete it before accepting a new one."
        );
      }

      if (taskData.status !== "pending") {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "This task has already been claimed."
        );
      }

      if (taskData.requesterId === auth.uid) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "You cannot accept your own task."
        );
      }

      const helperInfo = {
        uid: auth.uid,
        displayName: helperData.displayName,
        email: helperData.email,
      };

      t.update(taskRef, {
        status: "claimed",
        helperInfo: helperInfo,
        claimedAt: FieldValue.serverTimestamp(),
      });

      t.update(helperRef, {
        activeTaskId: taskId,
      });

      return { success: true, message: "Task successfully claimed!" };
    });
  } catch (error) {
    console.error("e acceptTask: Transaction failed.", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while accepting the task."
    );
  }
});

exports.completeTask = functions.https.onCall(async (data, context) => {
  const { auth } = context;
  const { taskId } = data;

  if (!auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in."
    );
  }

  if (!taskId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a 'taskId'."
    );
  }

  const taskRef = db.collection("tasks").doc(taskId);

  try {
    return await db.runTransaction(async (t) => {
      const taskDoc = await t.get(taskRef);
      if (!taskDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Task not found.");
      }

      const taskData = taskDoc.data();

      if (taskData.requesterId !== auth.uid) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "You are not the creator of this task."
        );
      }

      if (taskData.status === "completed") {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "This task is already marked as completed."
        );
      }

      t.update(taskRef, {
        status: "completed",
        completedAt: FieldValue.serverTimestamp(),
      });

      if (
        taskData.status === "claimed" &&
        taskData.helperInfo &&
        taskData.helperInfo.uid
      ) {
        const helperRef = db.collection("users").doc(taskData.helperInfo.uid);
        t.update(helperRef, {
          activeTaskId: null,
        });
      }

      return { success: true, message: "Task marked as complete." };
    });
  } catch (error) {
    console.error("e completeTask: Transaction failed.", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "An error occurred.");
  }
});

exports.cancelTask = functions.https.onCall(async (data, context) => {
  const { auth } = context;
  const { taskId } = data;

  if (!auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in."
    );
  }

  if (!taskId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a 'taskId'."
    );
  }

  const taskRef = db.collection("tasks").doc(taskId);

  try {
    return await db.runTransaction(async (t) => {
      const taskDoc = await t.get(taskRef);
      if (!taskDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Task not found.");
      }

      const taskData = taskDoc.data();

      if (taskData.requesterId !== auth.uid) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "You are not the creator of this task."
        );
      }

      if (taskData.status === "completed" || taskData.status === "cancelled") {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `This task is already ${taskData.status}.`
        );
      }

      t.update(taskRef, {
        status: "cancelled",
        cancelledAt: FieldValue.serverTimestamp(),
      });

      if (
        taskData.status === "claimed" &&
        taskData.helperInfo &&
        taskData.helperInfo.uid
      ) {
        const helperRef = db.collection("users").doc(taskData.helperInfo.uid);
        t.update(helperRef, {
          activeTaskId: null,
        });
        console.log(
          `i cancelTask: Task ${taskId} cancelled. Helper ${taskData.helperInfo.uid} has been freed.`
        );
      }

      return { success: true, message: "Task successfully cancelled." };
    });
  } catch (error) {
    console.error("e cancelTask: Transaction failed.", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while cancelling the task."
    );
  }
});

exports.abandonTask = functions.https.onCall(async (data, context) => {
  const { auth } = context;
  const { taskId } = data;

  if (!auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in."
    );
  }

  if (!taskId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a 'taskId'."
    );
  }

  const taskRef = db.collection("tasks").doc(taskId);
  const helperRef = db.collection("users").doc(auth.uid);

  try {
    return await db.runTransaction(async (t) => {
      const taskDoc = await t.get(taskRef);
      const helperDoc = await t.get(helperRef);

      if (!taskDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Task not found.");
      }
      if (!helperDoc.exists) {
        throw new functions.https.HttpsError(
          "internal",
          "Could not find your user profile."
        );
      }

      const taskData = taskDoc.data();
      const helperData = helperDoc.data();

      if (taskData.status !== "claimed") {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "This task is not in a 'claimed' state."
        );
      }
      if (taskData.helperInfo?.uid !== auth.uid) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "You are not the helper for this task."
        );
      }
      if (helperData.activeTaskId !== taskId) {
        throw new functions.https.HttpsError(
          "internal",
          "Your active task ID does not match this task."
        );
      }

      t.update(taskRef, {
        status: "pending",
        helperInfo: null,
        claimedAt: null,
      });

      t.update(helperRef, {
        activeTaskId: null,
      });

      return { success: true, message: "Task successfully abandoned." };
    });
  } catch (error) {
    console.error("e abandonTask: Transaction failed.", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while abandoning the task."
    );
  }
});
