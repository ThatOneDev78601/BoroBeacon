import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import MapView, { Marker, Region, Circle, Callout, CalloutSubview } from 'react-native-maps';
import * as Location from 'expo-location';
import { LocationObject, LocationSubscription } from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { Box } from '@/components/ui/box';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserIcon, CheckIcon, Settings2Icon, Settings, HandHelping, Hand, UserRoundCheck, X, FileClock, AlertTriangle, XCircle, CheckCircleIcon } from 'lucide-react-native';
import { FlatList } from 'react-native';
import { Spinner } from '@/components/ui/spinner';
import { Badge, BadgeText, BadgeIcon } from '@/components/ui/badge';
import { query, where, orderBy, limit, collection } from "firebase/firestore";
import { Menu, MenuItem, MenuItemLabel } from '@/components/ui/menu';
import { Gesture, GestureDetector, GestureHandlerRootView, TapGestureHandler } from 'react-native-gesture-handler';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from '@/components/ui/actionsheet';
import {
  Drawer,
  DrawerBackdrop,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerCloseButton,
} from '@/components/ui/drawer';
import { Button, ButtonText } from '@/components/ui/button';
import {
  Icon,
  AddIcon,
  GlobeIcon,
  PlayIcon,
  SettingsIcon,
  CloseIcon
} from '@/components/ui/icon';
import { Heading } from '@/components/ui/heading';
import { Pressable } from 'react-native'
import { Switch } from '@/components/ui/switch';
import { HStack } from '@/components/ui/hstack';
import { HelloWave } from '@/components/hello-wave';
import { VStack } from '@/components/ui/vstack';
import { LinearGradient } from 'expo-linear-gradient'; 
import { BlurView } from 'expo-blur'; 
import Toast from 'react-native-toast-message';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  SharedValue,
  withTiming,
  withDelay,
  interpolate,
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';
import { useAuth } from '@/hooks/useAuth';
import { db, rtdb, firebase } from '@/firebaseConfig';
import { GeoFire } from 'geofire';
import { doc, onSnapshot, Unsubscribe, getDoc, DocumentData, getDocs } from "firebase/firestore"
import { Divider } from '@/components/ui/divider';
import { sendPasswordResetEmail, signOut } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { Input, InputField } from '@/components/ui/input';
import { updateProfile } from 'firebase/auth';
import { updateDoc } from "firebase/firestore";
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { Alert } from 'react-native';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@/components/ui/modal';
import { functions } from '@/firebaseConfig';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface TaskData extends DocumentData {
  title?: string;
  details?: string;
  requesterId?: string;
  status?: string;
  location?: firebase.firestore.GeoPoint; 
  helperInfo?: { uid: string; displayName?: string; email?: string };
}

interface NearbyTaskInfo {
  location: number[];
  distance: number;
  data: TaskData | null;
  isLoading: boolean;
}


interface NearbyTaskInfo {
    location: number[];
    distance: number;
    isLoading: boolean
    data: TaskData | null; 
    error?: string; 
}

interface GeoQuery {
  on: (eventType: string, callback: (...args: any[]) => void) => void;
  updateCriteria: (newCriteria: { center?: number[]; radius?: number }) => void;
  cancel: () => void;
}


interface Coordinate {
  latitude: number;
  longitude: number;
}




const ONE_MILE_IN_METERS = 1609.34 * 1; 
const liquidGlassColors = {
  acceptor:{

  pinkLight: 'rgba(255, 192, 203, 0.34)', 
  pinkMedium: 'rgba(255, 105, 180, 0.31)', 
  pinkDark: 'rgba(255, 20, 147, 0.4)', 
  borderPink: 'rgba(255, 255, 255, 0.4)',
  shadowPink: 'rgba(0, 0, 0, 0.2)', 
  },
  requester: {
    orangeLight: 'rgba(255, 165, 0, 0.34)',
    orangeMedium: 'rgba(255, 140, 0, 0.31)',
    orangeDark: 'rgba(255, 69, 0, 0.4)',
    borderOrange: 'rgba(255, 255, 255, 0.4)',
    shadowOrange: 'rgba(0, 0, 0, 0.2)',
  },
  available: {
    greenLight: 'rgba(0, 255, 0, 0.34)',
    greenMedium: 'rgba(0, 255, 0, 0.31)',
    greenDark: 'rgba(0, 255, 0, 0.4)',
    borderGreen: 'rgba(255, 255, 255, 0.4)',
    shadowGreen: 'rgba(0, 0, 0, 0.2)',
  },
  unavailable: {
    redLight: 'rgba(255, 0, 0, 0.34)',
    redMedium: 'rgba(255, 0, 0, 0.31)',
    redDark: 'rgba(255, 0, 0, 0.4)',
    borderRed: 'rgba(255, 255, 255, 0.4)',
    shadowRed: 'rgba(0, 0, 0, 0.2)',
  },
  taskHistory: {
    blueLight: 'rgba(0, 0, 255, 0.34)',
    blueMedium: 'rgba(0, 0, 255, 0.31)',
    blueDark: 'rgba(0, 0, 255, 0.4)',
    borderBlue: 'rgba(255, 255, 255, 0.4)',
    shadowBlue: 'rgba(0, 0, 0, 0.2)',
  }, 
  settings: {
    grayLight: 'rgba(128, 128, 128, 0.34)',
    grayMedium: 'rgba(128, 128, 128, 0.31)',
    grayDark: 'rgba(128, 128, 128, 0.4)',
    borderGray: 'rgba(255, 255, 255, 0.4)',
    shadowGray: 'rgba(0, 0, 0, 0.2)',
  }
};

const AnimatedIcon = ({ index, isMenuOpen, children }: { index: number; isMenuOpen: SharedValue<boolean>; children: React.ReactNode }) => {
    
  const animatedStyle = useAnimatedStyle(() => {
  const delay = isMenuOpen.value ? index * 50 : (3 - index) * 50;
    
    const progress = withDelay(
      delay,
      withSpring(isMenuOpen.value ? 1 : 0, {
        damping: 40,       
        stiffness: 210,   
      })
    );

    return {
      opacity: progress,
      
    
    };
  });

  return (
    <Animated.View style={[animatedStyle, {
    
    }]}>
      {children}
    </Animated.View>
  );
};

export default function HomeScreen() {
  const [newDisplayName, setNewDisplayName] = useState(''); 
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const mapRef = useRef<MapView | null>(null);
  const [heading, setHeading] = useState(0);
  const [dots, setDots] = useState<string>(""); 
  const [isNewNotification, setIsNewNotification] = useState<boolean>(true); 
  const [userRole, setUserRole] = useState<string>('task_acceptor'); 
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [showDrawer, setShowDrawer] = React.useState(false);
  const { user } = useAuth();
  const isMenuOpen = useSharedValue(false);
  const [nearbyTasks, setNearbyTasks] = useState<{ [key: string]: NearbyTaskInfo }>({});
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isAcceptingTask, setIsAcceptingTask] = useState<string | null>(null);
const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false);
const [isCreateTaskModalVisible, setIsCreateTaskModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDetails, setNewTaskDetails] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

const [activeTaskId, setActiveTaskId] = useState(null);
  const [activeTaskDetails, setActiveTaskDetails] = useState<any>(null);
const [requesterTask, setRequesterTask] = useState<TaskData | null>(null);
  const functions = getFunctions();
  const abandonTaskCallable = httpsCallable(functions, 'abandonTask');
const createTaskCallable = httpsCallable(functions, 'createTask');
const cancelTaskCallable = httpsCallable(functions, 'cancelTask');
const completeTaskCallable = httpsCallable(functions, 'completeTask');
    const dbRef = rtdb.ref("/task_locations");
    const geoFireInstance = new GeoFire(dbRef as any);
  const geoQueryRef = useRef<GeoQuery | null>(null);
  const [isEditNameModalVisible, setIsEditNameModalVisible] = useState(false);
  const [modalDisplayName, setModalDisplayName] = useState('');
  const badgeScale = useSharedValue(1);

  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<TaskData[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);



const blurOverlayStyle = useAnimatedStyle(() => {
    const opacity = withTiming(isMenuOpen.value ? 1 : 0, { duration: 250 }); 

    return {
      opacity: opacity,
      pointerEvents: isMenuOpen.value ? 'auto' : 'none',
    };
  });

  const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
    if (isNewNotification) {
      setIsNewNotification(false);
    }
  };


const handleCompleteTask = async () => {
    if (!requesterTask || requesterTask.status !== 'claimed') {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Task cannot be completed.' });
      return;
    }
    const taskId = requesterTask.id;

    console.log(`Attempting to complete task: ${taskId}`);
    try {
      const result = await completeTaskCallable({ taskId });
      console.log('Task completed successfully', result.data);
      Toast.show({
        type: 'success',
        text1: 'Task Completed!',
        text2: 'Thank you for using the app.',
      });
    } catch (error: any) {
      console.error('Error completing task:', error);
      Toast.show({
        type: 'error',
        text1: 'Completion Failed',
        text2: error.message,
      });
    }
  };

  const fetchCompletedTasks = async () => {
    if (!user) return;

    console.log("Fetching completed tasks for helper:", user.uid);
    setIsHistoryLoading(true);
    setCompletedTasks([]); 

    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        where('helperInfo.uid', '==', user.uid),
        where('status', '==', 'completed'),
        orderBy('completedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const tasks: TaskData[] = [];
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() } as TaskData);
      });

      setCompletedTasks(tasks);
      console.log(`Found ${tasks.length} completed tasks.`);
    } catch (error) {
      console.error("Error fetching completed tasks:", error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not load task history.' });
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const renderTaskHistoryItem = ({ item }: { item: TaskData }) => (
    <Box style={styles.historyItem}>
      <VStack>
        <Text style={styles.historyItemTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.historyItemDate}>
          Completed on: {item.completedAt ? new Date(item.completedAt.seconds * 1000).toLocaleDateString() : 'N/A'}
        </Text>
    
      </VStack>
    </Box>
  );
const handleCancelTask = async () => {
    if (!requesterTask) return;
    const taskId = requesterTask.id;

    console.log(`Attempting to cancel task: ${taskId}`);
    try {
      const result = await cancelTaskCallable({ taskId });
      console.log('Task cancelled successfully', result.data);
      Toast.show({
        type: 'success',
        text1: 'Task Cancelled',
      });
    } catch (error: any) {
      console.error('Error cancelling task:', error);
      Toast.show({
        type: 'error',
        text1: 'Cancel Failed',
        text2: error.message,
      });
    }
  };

const handleCreateTask = async () => {
    if (!user) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'You must be logged in.' });
      return;
    }
    if (!location) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Cannot determine your location.' });
      return;
    }
    if (newTaskTitle.trim() === '') {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter a task title.' });
      return;
    }

    setIsSubmittingTask(true);
    try {
      const taskData = {
        title: newTaskTitle,
        details: newTaskDetails,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      };

      const result = await createTaskCallable(taskData);
      // @ts-ignore
      if (result.data.success) {
        Toast.show({ type: 'success', text1: 'Task Created!', text2: 'Nearby helpers have been notified.' });
        setIsCreateTaskModalVisible(false); 
        setNewTaskTitle('');
        setNewTaskDetails('');
      } else {
        // @ts-ignore
        throw new Error(result.data.message || "Failed to create task");
      }
    } catch (error: any) {
      console.error("Error creating task:", error);
      Toast.show({ type: 'error', text1: 'Create Failed', text2: error.message });
    } finally {
      setIsSubmittingTask(false);
    }
  };
const handlePasswordReset = () => {
    if (user && user.email) {
      sendPasswordResetEmail(auth, user.email)
        .then(() => {
          Toast.show({
            type: 'success',
            text1: 'Password Reset Email Sent',
            text2: `Check your inbox at ${user.email}`,
          });
          setShowDrawer(false); 
        })
        .catch((error) => {
          console.error("Password reset error:", error);
          Toast.show({
            type: 'error',
            text1: 'Password Reset Failed',
            text2: error.message || 'Could not send reset email.',
          });
        });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not find user email for password reset.',
      });
    }
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log('User signed out successfully');
        setShowDrawer(false);
      })
      .catch((error) => {
        console.error("Sign out error:", error);
        Toast.show({
          type: 'error',
          text1: 'Logout Failed',
          text2: error.message || 'Could not sign out.',
        });
      });
  };

const fetchTaskDetails = async (taskId: string) => {
      try {
          const taskDocRef = doc(db, 'tasks', taskId);
          const docSnap = await getDoc(taskDocRef);

          if (docSnap.exists()) {
              const taskData = docSnap.data() as TaskData; 
              setNearbyTasks(prevTasks => ({
                  ...prevTasks,
                  [taskId]: {
                      ...prevTasks[taskId],  
                      isLoading: false,
                      data: taskData,
                  },
              }));
          } else {
              console.warn(`Task document ${taskId} not found in Firestore.`);
              setNearbyTasks(prevTasks => {
                 const newTasks = {...prevTasks};
                 delete newTasks[taskId]; 
                 return newTasks;
              });
          }
      } catch (error) {
          console.error(`Error fetching task details for ${taskId}:`, error);
          setNearbyTasks(prevTasks => ({
              ...prevTasks,
              [taskId]: {
                  ...prevTasks[taskId],
                  isLoading: false,
                  error: 'Failed to load details',
              },
          }));
      }
  };
const handleAcceptTask = async (taskId: string) => {
      if (!taskId || isAcceptingTask) return; 

      console.log("Attempting to accept task:", taskId);
      setIsAcceptingTask(taskId); 

      try {
          const acceptTaskFunction = httpsCallable(functions, 'acceptTask'); 
          const result = await acceptTaskFunction({ taskId: taskId });

          console.log("acceptTask result:", result.data);
          Toast.show({ type: 'success', text1: 'Task Accepted!', text2: 'You claimed the task.' });
          setIsTaskSheetOpen(false); 

      } catch (error: any) {
          console.error("Error accepting task:", error);
          let message = error.message || 'Could not accept the task.';
          if (error.code === 'functions/not-found' || error.details?.code === 'not-found') {
              message = 'Task not found or already claimed.';
          } else if (error.code === 'functions/permission-denied' || error.details?.code === 'permission-denied') {
             message = 'Permission denied.';
          } else if (error.code === 'functions/failed-precondition' || error.details?.code === 'failed-precondition') {
             message = error.details?.message || 'Task already claimed or cannot accept own task.';
          }
          Toast.show({ type: 'error', text1: 'Accept Failed', text2: message });
      } finally {
          setIsAcceptingTask(null); 
      }
  };

const handleAbandonTask = async () => {
    if (!activeTaskDetails) return;
    const taskId = activeTaskDetails.id;

    console.log(`Attempting to abandon task: ${taskId}`);
    try {
      const result = await abandonTaskCallable({ taskId });
      console.log('Task abandoned successfully', result.data);
      Toast.show({
        type: 'success',
        text1: 'Task Abandoned',
        text2: 'The task is now available for others.',
      });
    } catch (error : any) {
      console.error('Error abandoning task:', error);
      Toast.show({
        type: 'error',
        text1: 'Abandon Failed',
        text2: error.message,
      });
    }
  };


  const panGesture = Gesture.Pan()
    .onEnd((event) => {
      const { translationY, velocityY } = event;
const swipeThreshold = 50;   
const velocityThreshold = 800; 

if (translationY > swipeThreshold && velocityY > velocityThreshold) {
  console.log('Detected Top-to-Bottom Swipe!');
isMenuOpen.value = true
}
else if (translationY < -swipeThreshold && velocityY < -velocityThreshold) {
  console.log('Detected Bottom-to-Top Swipe!');
isMenuOpen.value = false
}
    });

useEffect(() => {
    if (!user) {
      setUserRole('helper');
      setIsAvailable(false);
      setActiveTaskId(null);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUserRole(userData.userRole || 'helper');
        setIsAvailable(userData.isAcceptingTasks || false);
        setActiveTaskId(userData.activeTaskId || null); 
      }
    });

    return () => unsubscribeUser();
  }, [user]);

  useEffect(() => {
    let unsubscribeTask: Unsubscribe;
    if (activeTaskId) {
      console.log(`User has active task: ${activeTaskId}. Fetching details...`);
      const taskDocRef = doc(db, 'tasks', activeTaskId);
      unsubscribeTask = onSnapshot(taskDocRef, (docSnap) => {
        if (docSnap.exists()) {
         const taskData = { id: docSnap.id, ...docSnap.data() } as TaskData;
          setActiveTaskDetails(taskData);
          if (mapRef.current && taskData.location) {
            console.log("Animating map to active task...");
            mapRef.current.animateToRegion(
              {
                latitude: taskData.location.latitude,
                longitude: taskData.location.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              },
              1000 
            );
          }
        } else {
          console.log("Active task details not found, clearing.");
          setActiveTaskDetails(null);
        }
      });
    } else {
      setActiveTaskDetails(null);
    }

    return () => {
      if (unsubscribeTask) {
        unsubscribeTask();
      }
    };
  }, [activeTaskId]);

  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined = undefined;

    if (user && userRole === 'requester') {
      console.log("User is requester, listening for active tasks...");

      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        where('requesterId', '==', user.uid),
        where('status', 'in', ['pending', 'claimed']),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (querySnapshot.empty) {
          setRequesterTask(null);
        } else {
          const taskDoc = querySnapshot.docs[0];
          const taskData = { id: taskDoc.id, ...taskDoc.data() } as TaskData;
          setRequesterTask(taskData);
        }
      });
    } else {
      setRequesterTask(null);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, userRole]);

  useEffect(() => {
    if (requesterTask && requesterTask.location && mapRef.current) {
      console.log("Animating map to requester's active task...");
      mapRef.current.animateToRegion(
        {
          latitude: requesterTask.location.latitude,
          longitude: requesterTask.location.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        1000
      );
    }
  }, [requesterTask]);

  useEffect(() => {
    if (userRole !== 'helper' || !location || !rtdb) {
      if (geoQueryRef.current) {
        console.log("User is requester or no location. Cancelling active GeoQuery.");
        geoQueryRef.current.cancel(); 
        geoQueryRef.current = null;
      }
      setNearbyTasks({}); 
      return; 
    }

    const currentLatitude = location.coords.latitude;
    const currentLongitude = location.coords.longitude;
    const radiusKm = 1.60934; 

    if (geoQueryRef.current) {
      geoQueryRef.current.updateCriteria({
        center: [currentLatitude, currentLongitude],
      });
    } else {
      console.log("User is helper. Creating new GeoQuery.");
      geoQueryRef.current = geoFireInstance.query({
        center: [currentLatitude, currentLongitude],
        radius: radiusKm,
      });

      geoQueryRef.current.on("key_entered", (key: string, location: number[], distance: number) => {
        console.log(`Task Entered GeoQuery: ${key}`);
        setNearbyTasks(prevTasks => ({
          ...prevTasks,
          [key]: { location, distance, data: null, isLoading: true },
        }));
        fetchTaskDetails(key);
      });

      geoQueryRef.current.on("key_exited", (key: string, location: number[], distance: number) => {
        console.log(`Task Exited: ${key}`);
        setNearbyTasks(prevTasks => {
          const newTasks = { ...prevTasks };
          delete newTasks[key];
          return newTasks;
        });

        if (selectedTaskId === key) {
          setSelectedTaskId(null); 
        }
      });
    }
  }, [location, userRole, rtdb, selectedTaskId]);

  useEffect(() => {
      return () => {
          if (geoQueryRef.current) {
              console.log("HomeScreen unmounting. Cancelling GeoQuery.");
              geoQueryRef.current.cancel();
              geoQueryRef.current = null;
          }
      }
  }, []);

    useEffect(() => {
    const subscription = Magnetometer.addListener(({ x, y }) => {
      let angle = Math.atan2(y, x) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      
      setHeading(prev => {
        const diff = (angle - prev + 360) % 360;
        if (diff >= 30) {
          return angle;
        }
        return prev;
      });
    });

    Magnetometer.setUpdateInterval(500); 
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (user?.displayName) {
      setNewDisplayName(user.displayName);
    } else {
      setNewDisplayName('');
    }
  }, [user, showDrawer])

  useEffect(() => {
    if (mapRef.current && location) {
      mapRef.current.animateCamera({
        center: {
          latitude: location?.coords.latitude,
          longitude: location?.coords.longitude,
        },
        pitch: 0,
        heading: heading-120, 
      }, { duration: 500 }); 
    }
  }, [heading, location]); 

  useEffect(() => {
    let subscriber: LocationSubscription | undefined;
    
    
    const startWatching = async () => {
      setIsLoading(true);
      let dotInterval = setInterval(() => {
        setDots(prev => prev.length < 3 ? prev + "." : "");
      }, 500); 
      let { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        setErrorMsg('Permission to access location was denied. Please enable it in your device settings.');
        setIsLoading(false);
        clearInterval(dotInterval); 
        return;
      }

      let { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        console.warn('Background location permission was not granted. Location updates will only work when the app is in the foreground.');
      }

      subscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 2000, 
          distanceInterval: 0,
        },
        (newLocation: LocationObject) => {
          const { latitude, longitude } = newLocation.coords;
          setLocation(newLocation);
          
          if (!mapRegion) {
            setMapRegion({
              latitude,
              longitude,
              latitudeDelta: 0.005, 
              longitudeDelta: 0.005,
            });
          }
          setIsLoading(false);
          clearInterval(dotInterval);
        }
      );
    };

    startWatching();
    
    let firestoreUnsubscribe: Unsubscribe | undefined; 

    if (user?.email) { 
      const userDocRef = doc(db, 'users', user.uid); 

      console.log(`Setting up Firestore listener for user: ${user.uid}`);
      firestoreUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          console.log("Firestore User Data:", userData);

          const acceptingTasks = userData.isAcceptingTasks === true; 
          setIsAvailable(acceptingTasks);
            console.log("User availability set to:", acceptingTasks);
          const role = userData.userRole || 'helper'; 
          setUserRole(role);
          console.log("User role set to:", role)

        } else {
          console.warn(`Firestore document for user ${user.uid} does not exist.`);
        }
      }, (error) => {
          console.error("Error listening to Firestore user document:", error);
          setErrorMsg("Could not load user profile. Please check connection.");
      });

    } else {
       console.log("No user logged in, skipping Firestore listener setup.");
    }
    return () => {
      console.log("Cleaning up listeners in HomeScreen useEffect...");
      if (subscriber) {
        console.log("Removing location subscriber.");
        subscriber.remove();
      }
      if (firestoreUnsubscribe) {
        console.log("Unsubscribing from Firestore.");
        firestoreUnsubscribe();
      }
    };
    
  }, []); 

  let content;

  if (isLoading) {
    content = (
      <View style={styles.infoContainer}>
        <Spinner  size="large" color="orange" />
        <Text style={styles.infoText}>Finding your location{dots}</Text>
      </View>
    );
  } else if (errorMsg) {
    content = (
      <View style={styles.infoContainer}>
        <Text style={[styles.infoText, styles.errorText]}>{errorMsg}</Text>
      </View>
    );
  } else if (mapRegion) {
    content = (
      <MapView
        ref={mapRef}
        style={styles.map}
        customMapStyle={mapStyle} 
        
        initialRegion={mapRegion}
        showsUserLocation={true} 
        followsUserLocation={true} 
        scrollEnabled={true}
        zoomEnabled={true}
        rotateEnabled={true}
      >
  
        {location && userRole === 'helper' && (
          <>
         
            <Circle
              center={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              radius={ONE_MILE_IN_METERS}
              strokeWidth={2}
              strokeColor="rgba(0, 150, 255, 0.5)"
              fillColor="rgba(0, 150, 255, 0.1)"
            />
          </>
      )}
{activeTaskDetails && activeTaskDetails.location && (
          <Marker
            coordinate={{
              latitude: activeTaskDetails.location.latitude,
              longitude: activeTaskDetails.location.longitude,
            }}
            title={activeTaskDetails.title}
            description="Your active task"
            pinColor="blue" 
          />
        )}

        {requesterTask && requesterTask.location && userRole === 'requester' && (
          <Marker
            coordinate={{
              latitude: requesterTask.location.latitude,
              longitude: requesterTask.location.longitude,
            }}
            title={requesterTask.title}
            description={`Status: ${requesterTask.status}`}
            pinColor="green" 
          />
        )}
{userRole === 'helper' && Object.entries(nearbyTasks).map(([taskId, taskInfo]) => {
          if (!taskInfo.location) return null;

          return (
            <Marker
              coordinate={{
                latitude: taskInfo.location[0],
                longitude: taskInfo.location[1],
              }}
              stopPropagation={true}
              pinColor={taskInfo.isLoading ? "purple" : "orange"} 
              key={`${taskId}-${taskInfo.isLoading ? 'active' : 'inactive'}`}

   onPress={() => {
              if (!taskInfo.data && !taskInfo.isLoading) {
                  fetchTaskDetails(taskId);
              }
              console.log("Marker pressed, opening Actionsheet for:", taskId);
              setSelectedTaskId(taskId);
              setIsTaskSheetOpen(true); 
            }}
            >
            
            </Marker>
          );
        })}
      </MapView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <>
    <Modal
          isOpen={isHistoryModalVisible}
          onClose={() => setIsHistoryModalVisible(false)}
        >
          <ModalBackdrop />
          <ModalContent style={styles.historyModalContent}>
            <ModalHeader>
              <Heading size="lg" style={{ color: '#fff' }}>Completed Tasks</Heading>
              <ModalCloseButton onPress={() => setIsHistoryModalVisible(false)}>
                <Icon as={CloseIcon} style={{ color: '#fff' }} />
              </ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              {isHistoryLoading ? (
                <Spinner size="large" color="white" />
              ) : completedTasks.length === 0 ? (
                <Text style={{ color: '#adb5bf', textAlign: 'center', marginTop: 20 }}>
                  You haven't completed any tasks yet.
                </Text>
              ) : (
                <FlatList
                  data={completedTasks}
                  renderItem={renderTaskHistoryItem}
                  keyExtractor={(item) => item.id}
                  ItemSeparatorComponent={() => <Divider style={{ marginVertical: 2, backgroundColor: "#444" }} />}
                />
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
<Modal
          isOpen={isCreateTaskModalVisible}
          onClose={() => setIsCreateTaskModalVisible(false)}
        >
          <ModalBackdrop />
          <ModalContent style={{ backgroundColor: '#1f1f1f' }}>
            <ModalHeader>
              <Heading size="lg" style={{ color: '#fff' }}>Create a New Task</Heading>
              <ModalCloseButton onPress={() => setIsCreateTaskModalVisible(false)}>
                <Icon as={CloseIcon} style={{ color: '#fff' }} />
              </ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              <VStack space="lg">
                <FormControl isRequired={true}>
                  <FormControlLabel>
                    <FormControlLabelText style={{ color: '#fff' }}>Task Title</FormControlLabelText>
                  </FormControlLabel>
                  <Input>
                    <InputField
                      placeholder="e.g., Need help moving a couch"
                      value={newTaskTitle}
                      onChangeText={setNewTaskTitle}
                      placeholderTextColor={"#adb5bf"}
                      style={{ color: "#fff" }}
                    />
                  </Input>
                </FormControl>
                <FormControl>
                  <FormControlLabel>
                    <FormControlLabelText style={{ color: '#fff' }}>Details (Optional)</FormControlLabelText>
                  </FormControlLabel>
                  <Textarea>
                    <TextareaInput
                      placeholder="e.g., In apartment 3B, need 2 people."
                      value={newTaskDetails}
                      onChangeText={setNewTaskDetails}
                      placeholderTextColor={"#adb5bf"}
                      style={{ color: "#fff", height: 100 }}
                      multiline={true}
                    />
                  </Textarea>
                </FormControl>
                <Text size="sm" style={{ color: '#adb5bf' }}>
                  Your current location will be used for the task.
                </Text>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="outline"
                action="secondary"
                style={{ marginRight: 12 }}
                onPress={() => setIsCreateTaskModalVisible(false)}
                disabled={isSubmittingTask}
              >
                <ButtonText>Cancel</ButtonText>
              </Button>
              <Button
                action="positive"
                style={{width: 100}}
                onPress={handleCreateTask}
                disabled={isSubmittingTask}
              >
                {isSubmittingTask ? (
                  <Spinner size="small" color="white" />
                ) : (
                  <ButtonText>Submitt</ButtonText>
                )}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

    <Actionsheet
          isOpen={isTaskSheetOpen}
          onClose={() => {
            setIsTaskSheetOpen(false);
            setSelectedTaskId(null);
          }}
        >
          <ActionsheetBackdrop />
          <ActionsheetContent style={{ backgroundColor: '#2a2a2a' }}>
            <ActionsheetDragIndicatorWrapper>
              <ActionsheetDragIndicator />
            </ActionsheetDragIndicatorWrapper>

            {selectedTaskId && nearbyTasks[selectedTaskId]?.isLoading ? (
              <ActionsheetItem disabled={true}>
                 <Spinner size="small" style={{ marginRight: 8 }} />
                 <ActionsheetItemText style={{ color: "#fff" }}>Loading task details...</ActionsheetItemText>
              </ActionsheetItem>
            ) : selectedTaskId && (nearbyTasks[selectedTaskId]?.error || !nearbyTasks[selectedTaskId]?.data) ? (
               <ActionsheetItem disabled={true}>
                 <ActionsheetItemText style={{ color: "#d41818ff" }}>
                    {nearbyTasks[selectedTaskId]?.error || "Could not load details."}
                 </ActionsheetItemText>
               </ActionsheetItem>
            ) : selectedTaskId && nearbyTasks[selectedTaskId]?.data ? (
              <>
                <Box style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
                    <Heading size="md" style={{ color: "#fff" }}>
                        {nearbyTasks[selectedTaskId].data.title}
                    </Heading>
                    {nearbyTasks[selectedTaskId].data.details && (
                        <Text size="sm" style={{ color: "#fff", marginTop: 4 }}>
                            {nearbyTasks[selectedTaskId].data.details}
                        </Text>
                    )}
                     <Text size="xs" style={{ color: "#fff", marginTop: 8 }}>
                        Distance: {nearbyTasks[selectedTaskId].distance.toFixed(2)} km
                    </Text>
                </Box>

                <Divider style={{ marginVertical: 8, backgroundColor: "#444" }} />

                <ActionsheetItem
                  style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginLeft:30
                  
             }}
                    onPress={() => handleAcceptTask(selectedTaskId)}
                    disabled={isAcceptingTask === selectedTaskId} 
                >
                    {isAcceptingTask === selectedTaskId ? (
                        <Spinner size="small" style={{ marginRight: 8 }} />
                    ) : (
                        <Icon as={CheckIcon} size="md" style={{ marginRight: 8 }} color="#00ff00" /> 
                    )}
                    <ActionsheetItemText style={{ color: isAcceptingTask === selectedTaskId ? "#00ff00" : "#fff" }}>
                       {isAcceptingTask === selectedTaskId ? "Accepting..." : "Accept Task"}
                    </ActionsheetItemText>
                </ActionsheetItem>


              </>
            ) : (
               <ActionsheetItem disabled={true}>
                 <ActionsheetItemText style={{ color: "#fff" }}>Select a task marker</ActionsheetItemText>
               </ActionsheetItem>
            )}

             <Divider style={{ marginVertical: 8,backgroundColor: "#444"  }} />
             <ActionsheetItem
               style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  
             }}
                 onPress={() => {
                     setIsTaskSheetOpen(false);
                     setSelectedTaskId(null);
                 }}
             >
                <Icon as={CloseIcon} size="md" style={{ marginRight: 8 }} color="#ff0000ff" />
                <ActionsheetItemText>
                    Cancel
                </ActionsheetItemText>
             </ActionsheetItem>

          </ActionsheetContent>
        </Actionsheet>
<Drawer
        isOpen={showDrawer}
        size="md" 
        anchor="bottom" 
        onClose={() => {
          setShowDrawer(false);
        }}
      >
        <DrawerBackdrop />
        <DrawerContent style={{ backgroundColor: '#1f1f1f' }}> 
          <DrawerHeader>
            <Heading size="lg" style={{ color: "#fff" }}>Settings</Heading>
            <DrawerCloseButton onPress={() => setShowDrawer(false)}>
              <Icon as={CloseIcon} />
            </DrawerCloseButton>
          </DrawerHeader>

          <DrawerBody>
            <VStack space="lg"> 

              {user && (
                 <VStack space="xs" style={{ paddingBottom: 8 }}>
                   <Text size='lg'  style={{ color: "#fff" }}>Logged in as:</Text>
                <HStack style={{ alignItems: "center" }}>
              <Badge size='lg' action='info' style={{ alignSelf: 'flex-start' }}>
                <BadgeText style={{ fontSize: 18, paddingVertical: 5, paddingHorizontal: 8, textTransform: 'none' }}>
                
                  {user.displayName || user.email?.split('@')[0] || 'User'}
                </BadgeText>
              </Badge>
    
          {user.displayName && (
            <Badge size='sm' 
              action='success'
              style={{ alignSelf: 'center', marginLeft: 8 }} 
            >
              <BadgeText style={{ fontSize: 10, paddingVertical: 2, paddingHorizontal: 6, textTransform: 'none' }}>
                {user.email}
              </BadgeText>
            </Badge>
          )}
        </HStack>
                   
                 </VStack>
              )}
        



               <Divider style={{ marginVertical: 8 }}/>


              <Button
                  variant="solid"
                  action="secondary" 
                  onPress={handlePasswordReset}
              >
                  <ButtonText style={{ color: "#fff" }}>Reset Password</ButtonText>
              </Button>

              <Button
                  action="negative" 
                  onPress={handleLogout}
                  style={{ marginTop: 16 }} 
              >
                  <ButtonText>Log Out</ButtonText>
              </Button>

            </VStack>
          </DrawerBody>

      <DrawerFooter>
              <Text size="xs" style={{ color: "#fff" }}>App Version 1.0.0</Text>
          </DrawerFooter> 

        </DrawerContent>
      </Drawer>
      <SafeAreaView style={styles.uiContainer}>
      {isNewNotification && (
         <HelloWave style={{}} />
      )}

      {activeTaskDetails && userRole === 'helper' &&(
        <View style={styles.topLeftContainer}>
          <BlurView intensity={20} tint="dark" style={styles.taskBox}>
            <Box>
              <Text style={styles.taskTitle}>
                {activeTaskDetails.title || 'Active Task'}
              </Text>
              <Text style={styles.taskDetails}>
                Status: {activeTaskDetails.status}
              </Text>

              <Pressable
                style={styles.abandonButton}
                onPress={handleAbandonTask}
              >
                <AlertTriangle size={14} color="white" />
                <Text style={styles.abandonButtonText}>Abandon Task</Text>
              </Pressable>
            </Box>
          </BlurView>
        </View>
      )}

      {requesterTask && userRole === 'requester' && (
            <View style={styles.topLeftContainer}>
              <BlurView intensity={20} tint="dark" style={styles.taskBox}>
                <Box>
                  <Text style={styles.taskTitle} numberOfLines={1}>
                    {requesterTask.title || 'Your Task'}
                  </Text>
                  <Text style={styles.taskDetails}>
                    Status: {requesterTask.status}
                  </Text>
                  {requesterTask.status === 'claimed' && (
                    <>
                    <Text style={styles.taskDetails} numberOfLines={1}>
                      Helper: {requesterTask.helperInfo?.displayName || 'On the way'}
                    </Text>
                          <Pressable
                  style={styles.completeButton}
                  onPress={handleCompleteTask}
                >
                  <CheckCircleIcon size={14} color="white" />
                  <Text style={styles.completeButtonText}>Mark as Complete</Text>
                </Pressable>
</>
                  )}
            
                  <Pressable
                    style={styles.cancelButton}
                    onPress={handleCancelTask}
                  >
                    <XCircle size={14} color="white" />
                    <Text style={styles.cancelButtonText}>Cancel Task</Text>
                  </Pressable>
                </Box>
              </BlurView>
            </View>
          )}
        <View style={styles.topRightContainer}>
          <GestureDetector gesture={panGesture}>
          <Pressable
        
            onPress={toggleMenu} 
            style={styles.userIconPressable}
          >
            <Box
              style={{
             
                backgroundColor: '#181818',
                borderRadius: 20,
              }}
            >
              <UserIcon size={30} color="#cccccc" />
            </Box>
          </Pressable>
</GestureDetector>
          <VStack>
            <AnimatedIcon index={0} isMenuOpen={isMenuOpen}>
              <Pressable
                style={{ backgroundColor: 'transparent' }}
       onPress={async () => {
                  if (!user) {
                    Toast.show({ type: 'error', text1: 'Error', text2: 'Please log in.' });
                    return;
                  }
                  const newRole = userRole === 'helper' ? 'requester' : 'helper';
                  console.log(`Role switch pressed. Setting role to: ${newRole}`);
                   setUserRole(newRole);

                  try {
                    const userDocRef = doc(db, 'users', user.uid);
                    await updateDoc(userDocRef, {
                      userRole: newRole 
                    });
                    console.log('Firestore userRole updated successfully.');;
                  } catch (error) {
                    console.error("Error updating user role:", error);
                    Toast.show({ type: 'error', text1: 'Update Failed', text2: 'Could not switch role.' });
                     setUserRole(userRole); 
                  }
                }}
              >
                <BlurView intensity={20} tint="light" style={styles.liquidGlassContainer}>
                  <Box style={styles.liquidGlassBox}>
                    <LinearGradient
                      colors={[userRole === 'helper' ? liquidGlassColors.acceptor.pinkLight : liquidGlassColors.requester.orangeLight, userRole === 'helper' ? liquidGlassColors.acceptor.pinkMedium : liquidGlassColors.requester.orangeMedium, userRole === 'helper' ? liquidGlassColors.acceptor.pinkDark : liquidGlassColors.requester.orangeDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                    {userRole === 'helper' ? (
                      <HandHelping size={30} color="rgba(241, 198, 205, 1)" />
                    ) : (
                      <Hand size={30} color="rgba(241, 222, 198, 1)" />
                    )}
                  </Box>
                </BlurView>
              </Pressable>
            </AnimatedIcon>

            <AnimatedIcon index={1} isMenuOpen={isMenuOpen}>
              <Pressable
            onPress={async () => { 
                  if (!user) {
                    Toast.show({ type: 'error', text1: 'Error', text2: 'Please log in.' });
                    return;
                  }
                  const newAvailability = !isAvailable; 
                  console.log(`Availability toggle pressed. Setting to: ${newAvailability}`);
                   setIsAvailable(newAvailability);

                  try {
                    const userDocRef = doc(db, 'users', user.uid);
                    await updateDoc(userDocRef, {
                      isAcceptingTasks: newAvailability
                    });
                    console.log('Firestore isAcceptingTasks updated successfully.');
                  } catch (error) {
                    console.error("Error updating availability:", error);
                    Toast.show({ type: 'error', text1: 'Update Failed', text2: 'Could not update availability.' });
                    setIsAvailable(!newAvailability);
                  }
                }}
              >
                <BlurView intensity={20} tint="light" style={styles.liquidGlassContainer}>
                  <Box style={styles.liquidGlassBox}>
                    <LinearGradient
                      colors={[isAvailable ? liquidGlassColors.available.greenLight : liquidGlassColors.unavailable.redLight, isAvailable ? liquidGlassColors.available.greenMedium : liquidGlassColors.unavailable.redMedium, isAvailable ? liquidGlassColors.available.greenDark : liquidGlassColors.unavailable.redDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                    {isAvailable ? (
                      <CheckIcon size={30} color="#cccccc" />
                    ) : (
                      <X size={30} color="#cccccc" />
                    )}
                  </Box>
                </BlurView>
              </Pressable>
            </AnimatedIcon>

            <AnimatedIcon index={2} isMenuOpen={isMenuOpen}>
              <Pressable
            onPress={() => {
                
                  if (userRole === 'helper') {
                    console.log('Task History pressed (Helper)');
                    fetchCompletedTasks(); 
                    setIsHistoryModalVisible(true); 
                  } else {
                    console.log('Task History pressed (Requester)');
                    
                    Toast.show({ type: 'info', text1: 'Feature coming soon!' });
                  }
                  
                }}
              >
                <BlurView intensity={20} tint="light" style={styles.liquidGlassContainer}>
                  <Box style={styles.liquidGlassBox}>
                    <LinearGradient
                      colors={[liquidGlassColors.taskHistory.blueLight, liquidGlassColors.taskHistory.blueMedium, liquidGlassColors.taskHistory.blueDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <FileClock size={30} color="#cccccc" />
                  </Box>
                </BlurView>
              </Pressable>
            </AnimatedIcon>

            <AnimatedIcon index={3} isMenuOpen={isMenuOpen}>
              <Pressable
                onPress={() => {
                  console.log('Settings pressed');
                  setShowDrawer(true);
                }}
              >
                <BlurView intensity={20} tint="light" style={styles.liquidGlassContainer}>
                  <Box style={styles.liquidGlassBox}>
                    <LinearGradient
                      colors={[liquidGlassColors.settings.grayLight, liquidGlassColors.settings.grayMedium, liquidGlassColors.settings.grayDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <Settings size={30} color="#cccccc" />
                  </Box>
                </BlurView>
              </Pressable>
            </AnimatedIcon>
          </VStack>
        </View>
      </SafeAreaView>

      <View style={styles.container}>
        {content}
      </View>


{userRole === 'requester' && (
          <Pressable
            style={styles.createTaskButton}
            
            onPress={() => setIsCreateTaskModalVisible(true)}
          >
            <BlurView intensity={30} tint="dark" style={styles.createTaskBlur}>
              <AddIcon color="rgba(255, 145, 0, 0.62)"/>
            </BlurView>
          </Pressable>
        )}

<TapGestureHandler
          onEnded={() => {
            'worklet'; 
            if (isMenuOpen.value) {
              console.log("Blur overlay tapped, closing menu.");
              isMenuOpen.value = false;
            }
          }}
        >
      <Animated.View style={[styles.blurOverlayBase, blurOverlayStyle]}>
          <BlurView
            intensity={80} 
            tint="dark"    
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </TapGestureHandler>
    </>
    </GestureHandlerRootView>
  );
}
const styles = StyleSheet.create({
completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15, 
    backgroundColor: 'rgba(40, 167, 69, 0.7)', 
    paddingVertical: 8,
    borderRadius: 10,
  },
  completeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },

  historyModalContent: {
    backgroundColor: '#1f1f1f',
    maxHeight: '60%', 
  },
  historyItem: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  historyItemTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyItemDate: {
    color: '#adb5bf',
    fontSize: 12,
    marginTop: 4,
  },
cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    backgroundColor: 'rgba(255, 80, 80, 0.7)', 
    paddingVertical: 8,
    borderRadius: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  createTaskButton: {
    position: 'absolute',
    bottom: 40,
    right: 30,
    zIndex: 10,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    pointerEvents: 'auto',
  },
  createTaskBlur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 145, 0, 0.31)', 
  },
  topLeftContainer: {
    position: 'absolute',
    top: 30, 
    left: 20,
    zIndex: 10,
    width: '60%', 
  },
  taskBox: {
    borderRadius: 16,
    overflow: 'hidden',
    padding: 15,
  },
  taskTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskDetails: {
    color: '#e0e0e0',
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  abandonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    backgroundColor: 'rgba(255, 80, 80, 0.7)', 
    paddingVertical: 8,
    borderRadius: 10,
  },
  abandonButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  calloutContainer: {
        backgroundColor: '#333333', 
        borderRadius: 8,
        width: 200, 
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
taskMarker: {
    padding: 5,
    backgroundColor: 'red',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'white',
    borderWidth: 1,
  },
  taskMarkerText: {
    color: 'white',
    fontWeight: 'bold',
  },
  blurOverlayBase: {

    ...StyleSheet.absoluteFillObject, 
    zIndex: 2,
    backgroundColor: 'rgba(44, 34, 7, 0.3)', 
  },
  uiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 3,
    padding: 12,
    marginTop: 10,
  },
  topRightContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 30 : 10, 
    right: 6,
    alignItems: 'flex-end',
  },
  userIconPressable: {
    zIndex: 10, 
    backgroundColor: '#181818',
    borderRadius: 20,
    padding: 12,
  },
  liquidGlassContainer: {
    borderRadius: 20,
    overflow: 'hidden', 
    marginTop: 10,
    marginRight: 6,
    width: 50, 
    height: 50,
    backgroundColor:'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liquidGlassBox: {
    padding: 12,
    borderColor: liquidGlassColors.acceptor.borderPink, 
    borderWidth: 1,
    borderRadius: 20,
    marginTop: 0,
    marginRight: 0,
    overflow: 'hidden',
    justifyContent: 'center', 
    alignItems: 'center',  
    height: 60,
    shadowColor: liquidGlassColors.acceptor.shadowPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8, 
  },
  iconShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
customPin: {
    width: 20, 
    height: 20,
    transform: [{ translateX: -15 }, { translateY: -15 }], 
    rotation: 0, 
    backgroundColor: 'rgba(0,122,255,0.8)',
    borderRadius: 20,
  },
  container: {

    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1, 
    bottom: 0,
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#181818', 
  },
  map: {
    width: '100%',
    height: '115%', 
  },
  infoContainer: {
    backgroundColor: "#181818",
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoText: {
    color: '#cccccc',
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
  }
});



var mapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
]