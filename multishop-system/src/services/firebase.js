import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/functions';
import Constants from 'expo-constants';

// Firebase configuration
// Replace with your own Firebase project configuration
const firebaseConfig = {
  apiKey: Constants.manifest.extra?.firebaseApiKey || "YOUR_API_KEY",
  authDomain: Constants.manifest.extra?.firebaseAuthDomain || "YOUR_AUTH_DOMAIN",
  projectId: Constants.manifest.extra?.firebaseProjectId || "YOUR_PROJECT_ID",
  storageBucket: Constants.manifest.extra?.firebaseStorageBucket || "YOUR_STORAGE_BUCKET",
  messagingSenderId: Constants.manifest.extra?.firebaseMessagingSenderId || "YOUR_MESSAGING_SENDER_ID",
  appId: Constants.manifest.extra?.firebaseAppId || "YOUR_APP_ID",
  measurementId: Constants.manifest.extra?.firebaseMeasurementId || "YOUR_MEASUREMENT_ID",
};

// Initialize Firebase if it hasn't been initialized already
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Firestore and get a reference to the service
const db = firebase.firestore();

// Initialize Storage and get a reference to the service
const storage = firebase.storage();

// Initialize Functions and get a reference to the service
const functions = firebase.functions();

// Initialize Auth and get a reference to the service
const auth = firebase.auth();

// Timestamp utility
const timestamp = firebase.firestore.FieldValue.serverTimestamp;

// Export the services
export { firebase, db, auth, storage, functions, timestamp };

// Helper functions for Firestore operations

// Add a document to a collection
export const addDocument = async (collection, data) => {
  const docRef = await db.collection(collection).add({
    ...data,
    createdAt: timestamp(),
  });
  return docRef;
};

// Get a document by ID
export const getDocument = async (collection, id) => {
  const doc = await db.collection(collection).doc(id).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() };
};

// Update a document
export const updateDocument = async (collection, id, data) => {
  await db.collection(collection).doc(id).update({
    ...data,
    updatedAt: timestamp(),
  });
  return true;
};

// Delete a document
export const deleteDocument = async (collection, id) => {
  await db.collection(collection).doc(id).delete();
  return true;
};

// Query documents
export const queryDocuments = async (collection, constraints = []) => {
  let query = db.collection(collection);

  constraints.forEach((constraint) => {
    const [field, operator, value] = constraint;
    query = query.where(field, operator, value);
  });

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Query documents with order and limit
export const queryDocumentsWithOptions = async (
  collection,
  constraints = [],
  orderBy = null,
  limit = null
) => {
  let query = db.collection(collection);

  constraints.forEach((constraint) => {
    const [field, operator, value] = constraint;
    query = query.where(field, operator, value);
  });

  if (orderBy) {
    const [field, direction = 'asc'] = orderBy;
    query = query.orderBy(field, direction);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Upload a file to Firebase Storage
export const uploadFile = async (path, file, metadata = {}) => {
  const storageRef = storage.ref().child(path);
  const snapshot = await storageRef.put(file, metadata);
  const downloadURL = await snapshot.ref.getDownloadURL();
  return { snapshot, downloadURL };
};

// Delete a file from Firebase Storage
export const deleteFile = async (path) => {
  const storageRef = storage.ref().child(path);
  await storageRef.delete();
  return true;
};