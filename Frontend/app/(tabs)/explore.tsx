import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, StyleSheet, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Spinner } from '@/components/ui/spinner';
import { Divider } from '@/components/ui/divider';
import { db } from '@/firebaseConfig';
import { collection, query, orderBy, limit, Timestamp, DocumentData, getDocs, GeoPoint } from "firebase/firestore";
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@/components/ui/modal'; 
import { Icon } from '@/components/ui/icon'; 
import { CloseIcon } from '@/components/ui/icon';
import MapView, { Marker } from 'react-native-maps'; 
import { Button, ButtonText } from '@/components/ui/button'; 


interface TaskData extends DocumentData {
  id: string;
  title?: string;
  details?: string;
  requesterInfo?: {
    displayName?: string;
  };
  createdAt?: Timestamp;
  location?: GeoPoint; 
}


function timeAgo(timestamp: Timestamp | undefined): string {
  if (!timestamp) return '...';
  const now = Date.now();
  const seconds = Math.floor((now - timestamp.toDate().getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const TaskActivityCard = ({ task, onPress }: { task: TaskData, onPress: (task: TaskData) => void }) => {
  return (
    <Pressable onPress={() => onPress(task)}>
      <Box style={styles.taskCard}>
        <VStack>
          <Heading size="md" style={styles.cardTitle} numberOfLines={1}>
            {task.title || "Untitled Task"}
          </Heading>
          <Text style={styles.cardDetails} numberOfLines={2}>
            {task.details || "No details provided."}
          </Text>
          <Text style={styles.cardMeta}>
            Posted by {task.requesterInfo?.displayName || "a user"}
            {' · '}
            {timeAgo(task.createdAt)}
          </Text>
        </VStack>
      </Box>
    </Pressable>
  );
};

export default function ActivityScreen() {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchTasks = useCallback(async () => {
    console.log("Fetching tasks...");
    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const querySnapshot = await getDocs(q);
      const tasksList: TaskData[] = [];
      querySnapshot.forEach((doc) => {
        tasksList.push({ id: doc.id, ...doc.data() } as TaskData);
      });
      setTasks(tasksList);
    } catch (error) {
      console.error("Error fetching activity feed:", error);
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await fetchTasks();
      setIsLoading(false);
    };
    loadInitialData();
  }, [fetchTasks]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchTasks();
    setIsRefreshing(false);
  }, [fetchTasks]);

  const handleTaskPress = (task: TaskData) => {
    if (!task.location) {
        console.warn("Task has no location, cannot show on map.");
    }
    setSelectedTask(task);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedTask(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Heading size="2xl" style={styles.pageTitle}>
        Activity
      </Heading>
      
      {isLoading ? (
        <Box style={styles.centered}>
          <Spinner size="large" color="white" />
        </Box>
      ) : (
        <FlatList
          data={tasks}
          renderItem={({ item }) => (
            <TaskActivityCard task={item} onPress={handleTaskPress} />
          )}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() =><View style={{ height: 8 }} />}
          ListEmptyComponent={
            <Box style={styles.centered}>
              <Text style={styles.cardMeta}>No tasks have been posted yet.</Text>
            </Box>
          }
          onRefresh={onRefresh}
          refreshing={isRefreshing}
        />
      )}

      <Modal
        isOpen={isModalVisible && selectedTask !== null}
        onClose={closeModal}
      >
        <ModalBackdrop />
        <ModalContent style={styles.modalContent}>
          <ModalHeader>
            <Heading size="lg" style={{ color: '#fff', flex: 1 }} numberOfLines={1}>
              {selectedTask?.title || "Task Details"}
            </Heading>
            <ModalCloseButton onPress={closeModal}>
              <Icon as={CloseIcon} style={{ color: '#fff' }} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <VStack space="lg">
              {selectedTask?.location ? (
                <MapView
                  style={styles.minimap}
                  initialRegion={{
                    latitude: selectedTask.location.latitude,
                    longitude: selectedTask.location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  pitchEnabled={false}
                  rotateEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude: selectedTask.location.latitude,
                      longitude: selectedTask.location.longitude,
                    }}
                    pinColor="orange"
                  />
                </MapView>
              ) : (
                <Box style={styles.minimapPlaceholder}>
                    <Text style={styles.cardMeta}>No location provided for this task.</Text>
                </Box>
              )}
              
              <VStack space="sm">
                <Text style={styles.modalDetails}>
                  {selectedTask?.details || "No details provided."}
                </Text>
                <Divider  />
                <Text style={styles.modalMeta}>
                  Posted by: {selectedTask?.requesterInfo?.displayName || "a user"}
                </Text>
                <Text style={styles.modalMeta}>
                  When: {timeAgo(selectedTask?.createdAt)}
                </Text>
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              action="secondary"
              onPress={closeModal}
            >
              <ButtonText>Close</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  pageTitle: {
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  taskCard: {
    backgroundColor: '#1f1f1f',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardTitle: {
    color: '#fff',
  },
  cardDetails: {
    color: '#adb5bf',
    fontSize: 14,
    marginTop: 4,
  },
  cardMeta: {
    color: '#888',
    fontSize: 12,
    marginTop: 8,
  },
  modalContent: {
    backgroundColor: '#1f1f1f',
  },
  minimap: {
    width: '100%',
    height: 200,
    borderRadius: 80,
    
  },
  minimapPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalDetails: {
    color: '#fff',
    fontSize: 16,
  },
  modalMeta: {
    color: '#adb5bf',
    fontSize: 14,
  }
});

