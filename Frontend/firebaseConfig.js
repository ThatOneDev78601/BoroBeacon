
import firebase from 'firebase/compat/app'; 
import 'firebase/compat/auth';       
import 'firebase/compat/firestore';  
import 'firebase/compat/database';  
import 'firebase/compat/functions';   
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth, getReactNativePersistence, connectAuthEmulator } from 'firebase/auth';
import Constants from 'expo-constants'; 
import { Platform } from 'react-native'; 

const firebaseConfig = /*
FIREBASE CONFIG HERE
*/
let app = firebase.initializeApp(firebaseConfig); 




const origin = Constants.expoConfig.hostUri?.split(":").shift() || "localhost";
console.log(`Firebase initialized with origin: ${origin}`);


let auth= initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });


const db = firebase.firestore();
const rtdb = firebase.database();
const functions = firebase.functions(); 

const GeoPoint = firebase.firestore.GeoPoint;



if (__DEV__) {
  console.log('--- Development Mode: Connecting to Firebase Emulators ---');

  
  
  



  try {
    
    

    
    
    if (!auth.emulatorConfig) { 
     connectAuthEmulator(auth, `http://${origin}:9099`);
      console.log(`Auth Emulator connected to http://${origin}:9099`);
    } else {
      console.log('Auth Emulator ALREADY connected.');
    }


    
    
    
    
    
     db.useEmulator(origin, 8080);
     console.log(`Firestore Emulator connected to ${origin}:8080`);


    
    
     rtdb.useEmulator(origin, 9000);
     console.log(`RTDB Emulator connected to ${origin}:9000`);

     functions.useEmulator(origin, 5001);
      console.log(`Functions Emulator connected to ${origin}:5001`);


    
    
    
    
    


  } catch (e) {
    console.error("!!! Error connecting to Firebase Emulators:", e);
  }
} else {
   console.log('--- Production Mode: Connecting to LIVE Firebase ---');
}



export { auth, db, rtdb, GeoPoint, firebase, functions };

