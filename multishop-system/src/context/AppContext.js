import React, { createContext, useState, useEffect, useContext, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { firebase } from '../services/firebase';

// Create the context
export const AppContext = createContext();

// Initial state
const initialState = {
  shops: [],
  products: [],
  inventory: [],
  sales: [],
  expenses: [],
  deliveries: [],
  employees: [],
  notifications: [],
  selectedShop: null,
  isLoading: false,
  error: null,
  lastSync: null,
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SHOPS':
      return { ...state, shops: action.payload };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'SET_INVENTORY':
      return { ...state, inventory: action.payload };
    case 'SET_SALES':
      return { ...state, sales: action.payload };
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload };
    case 'SET_DELIVERIES':
      return { ...state, deliveries: action.payload };
    case 'SET_EMPLOYEES':
      return { ...state, employees: action.payload };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'SET_SELECTED_SHOP':
      return { ...state, selectedShop: action.payload };
    case 'SET_LAST_SYNC':
      return { ...state, lastSync: action.payload };
    case 'ADD_SHOP':
      return { ...state, shops: [...state.shops, action.payload] };
    case 'UPDATE_SHOP':
      return {
        ...state,
        shops: state.shops.map(shop => 
          shop.id === action.payload.id ? action.payload : shop
        ),
      };
    case 'DELETE_SHOP':
      return {
        ...state,
        shops: state.shops.filter(shop => shop.id !== action.payload),
      };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product => 
          product.id === action.payload.id ? action.payload : product
        ),
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload),
      };
    case 'ADD_INVENTORY':
      return { ...state, inventory: [...state.inventory, action.payload] };
    case 'UPDATE_INVENTORY':
      return {
        ...state,
        inventory: state.inventory.map(item => 
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case 'ADD_SALE':
      return { ...state, sales: [...state.sales, action.payload] };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'ADD_DELIVERY':
      return { ...state, deliveries: [...state.deliveries, action.payload] };
    case 'UPDATE_DELIVERY':
      return {
        ...state,
        deliveries: state.deliveries.map(delivery => 
          delivery.id === action.payload.id ? action.payload : delivery
        ),
      };
    case 'ADD_EMPLOYEE':
      return { ...state, employees: [...state.employees, action.payload] };
    case 'UPDATE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.map(employee => 
          employee.id === action.payload.id ? action.payload : employee
        ),
      };
    case 'DELETE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.filter(employee => employee.id !== action.payload),
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        ),
      };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    default:
      return state;
  }
}

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user } = useAuth();
  
  // Fetch initial data when user logs in
  useEffect(() => {
    if (user) {
      fetchInitialData();
    }
  }, [user]);

  // Load cached data from AsyncStorage
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const cachedDataStr = await AsyncStorage.getItem('appData');
        if (cachedDataStr) {
          const cachedData = JSON.parse(cachedDataStr);
          
          // Dispatch actions to set initial state from cache
          dispatch({ type: 'SET_SHOPS', payload: cachedData.shops || [] });
          dispatch({ type: 'SET_PRODUCTS', payload: cachedData.products || [] });
          dispatch({ type: 'SET_INVENTORY', payload: cachedData.inventory || [] });
          dispatch({ type: 'SET_SALES', payload: cachedData.sales || [] });
          dispatch({ type: 'SET_EXPENSES', payload: cachedData.expenses || [] });
          dispatch({ type: 'SET_DELIVERIES', payload: cachedData.deliveries || [] });
          dispatch({ type: 'SET_EMPLOYEES', payload: cachedData.employees || [] });
          dispatch({ type: 'SET_NOTIFICATIONS', payload: cachedData.notifications || [] });
          dispatch({ type: 'SET_LAST_SYNC', payload: cachedData.lastSync });
          
          // Set selected shop if user is a manager
          if (user?.role === 'manager' && user?.shopId) {
            const userShop = cachedData.shops.find(shop => shop.id === user.shopId);
            if (userShop) {
              dispatch({ type: 'SET_SELECTED_SHOP', payload: userShop });
            }
          }
        }
      } catch (error) {
        console.error('Error loading cached data:', error);
      }
    };

    if (user) {
      loadCachedData();
    }
  }, [user]);

  // Cache data to AsyncStorage whenever it changes
  useEffect(() => {
    const cacheData = async () => {
      try {
        const dataToCache = {
          shops: state.shops,
          products: state.products,
          inventory: state.inventory,
          sales: state.sales,
          expenses: state.expenses,
          deliveries: state.deliveries,
          employees: state.employees,
          notifications: state.notifications,
          lastSync: state.lastSync,
        };
        
        await AsyncStorage.setItem('appData', JSON.stringify(dataToCache));
      } catch (error) {
        console.error('Error caching data:', error);
      }
    };

    if (user && state.lastSync) {
      cacheData();
    }
  }, [state, user]);

  // Fetch all initial data from Firebase
  const fetchInitialData = async () => {
    if (!user) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Determine which data to fetch based on user role
      if (user.role === 'admin') {
        // Admin fetches all data
        await Promise.all([
          fetchShops(),
          fetchProducts(),
          fetchInventory(),
          fetchSales(),
          fetchExpenses(),
          fetchDeliveries(),
          fetchEmployees(),
          fetchNotifications(),
        ]);
      } else if (user.role === 'manager' && user.shopId) {
        // Manager fetches data for their shop
        await Promise.all([
          fetchShops(user.shopId),
          fetchProducts(),
          fetchInventory(user.shopId),
          fetchSales(user.shopId),
          fetchExpenses(user.shopId),
          fetchDeliveries(user.shopId),
          fetchEmployees(user.shopId),
          fetchNotifications(),
        ]);
        
        // Set selected shop for manager
        const shopDoc = await firebase
          .firestore()
          .collection('shops')
          .doc(user.shopId)
          .get();
          
        if (shopDoc.exists) {
          dispatch({
            type: 'SET_SELECTED_SHOP',
            payload: { id: shopDoc.id, ...shopDoc.data() },
          });
        }
      } else if (user.role === 'employee' && user.shopId) {
        // Employee fetches limited data for their shop
        await Promise.all([
          fetchShops(user.shopId),
          fetchProducts(),
          fetchInventory(user.shopId),
          fetchDeliveries(user.shopId),
          fetchNotifications(),
        ]);
      } else if (user.role === 'rider') {
        // Rider fetches only deliveries data
        await Promise.all([
          fetchShops(),
          fetchDeliveries(null, user.uid),
          fetchNotifications(),
        ]);
      }
      
      dispatch({ type: 'SET_LAST_SYNC', payload: new Date().toISOString() });
    } catch (error) {
      console.error('Error fetching initial data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Individual data fetching functions
  const fetchShops = async (shopId = null) => {
    try {
      let query = firebase.firestore().collection('shops');
      
      if (shopId) {
        query = query.where('id', '==', shopId);
      }
      
      const snapshot = await query.get();
      const shops = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      dispatch({ type: 'SET_SHOPS', payload: shops });
      return shops;
    } catch (error) {
      console.error('Error fetching shops:', error);
      throw error;
    }
  };

  const fetchProducts = async () => {
    try {
      const snapshot = await firebase.firestore().collection('products').get();
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      dispatch({ type: 'SET_PRODUCTS', payload: products });
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  };

  const fetchInventory = async (shopId = null) => {
    try {
      let query = firebase.firestore().collection('inventory');
      
      if (shopId) {
        query = query.where('shopId', '==', shopId);
      }
      
      const snapshot = await query.get();
      const inventory = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      dispatch({ type: 'SET_INVENTORY', payload: inventory });
      return inventory;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  };

  const fetchSales = async (shopId = null) => {
    try {
      let query = firebase.firestore().collection('sales');
      
      if (shopId) {
        query = query.where('shopId', '==', shopId);
      }
      
      const snapshot = await query.get();
      const sales = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      dispatch({ type: 'SET_SALES', payload: sales });
      return sales;
    } catch (error) {
      console.error('Error fetching sales:', error);
      throw error;
    }
  };

  const fetchExpenses = async (shopId = null) => {
    try {
      let query = firebase.firestore().collection('expenses');
      
      if (shopId) {
        query = query.where('shopId', '==', shopId);
      }
      
      const snapshot = await query.get();
      const expenses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      dispatch({ type: 'SET_EXPENSES', payload: expenses });
      return expenses;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  };

  const fetchDeliveries = async (shopId = null, riderId = null) => {
    try {
      let query = firebase.firestore().collection('deliveries');
      
      if (shopId) {
        query = query.where('shopId', '==', shopId);
      }
      
      if (riderId) {
        query = query.where('riderId', '==', riderId);
      }
      
      const snapshot = await query.get();
      const deliveries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      dispatch({ type: 'SET_DELIVERIES', payload: deliveries });
      return deliveries;
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      throw error;
    }
  };

  const fetchEmployees = async (shopId = null) => {
    try {
      let query = firebase.firestore().collection('users')
        .where('role', 'in', ['manager', 'employee', 'rider']);
      
      if (shopId) {
        query = query.where('shopId', '==', shopId);
      }
      
      const snapshot = await query.get();
      const employees = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      dispatch({ type: 'SET_EMPLOYEES', payload: employees });
      return employees;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  };

  const fetchNotifications = async () => {
    try {
      const snapshot = await firebase.firestore().collection('notifications')
        .where('userId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();
        
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  };

  // Shop CRUD operations
  const addShop = async (shopData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const docRef = await firebase.firestore().collection('shops').add({
        ...shopData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: user.uid,
      });
      
      const newShop = {
        id: docRef.id,
        ...shopData,
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
      };
      
      dispatch({ type: 'ADD_SHOP', payload: newShop });
      return newShop;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add shop' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateShop = async (shopId, shopData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await firebase.firestore().collection('shops').doc(shopId).update({
        ...shopData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedBy: user.uid,
      });
      
      const updatedShop = {
        id: shopId,
        ...shopData,
        updatedAt: new Date().toISOString(),
        updatedBy: user.uid,
      };
      
      dispatch({ type: 'UPDATE_SHOP', payload: updatedShop });
      return updatedShop;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update shop' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteShop = async (shopId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await firebase.firestore().collection('shops').doc(shopId).delete();
      dispatch({ type: 'DELETE_SHOP', payload: shopId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete shop' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Products CRUD operations
  const addProduct = async (productData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const docRef = await firebase.firestore().collection('products').add({
        ...productData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: user.uid,
      });
      
      const newProduct = {
        id: docRef.id,
        ...productData,
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
      };
      
      dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
      return newProduct;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add product' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateProduct = async (productId, productData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await firebase.firestore().collection('products').doc(productId).update({
        ...productData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedBy: user.uid,
      });
      
      const updatedProduct = {
        id: productId,
        ...productData,
        updatedAt: new Date().toISOString(),
        updatedBy: user.uid,
      };
      
      dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
      return updatedProduct;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update product' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteProduct = async (productId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await firebase.firestore().collection('products').doc(productId).delete();
      dispatch({ type: 'DELETE_PRODUCT', payload: productId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete product' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Inventory operations
  const updateInventory = async (inventoryId, inventoryData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await firebase.firestore().collection('inventory').doc(inventoryId).update({
        ...inventoryData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedBy: user.uid,
      });
      
      const updatedInventory = {
        id: inventoryId,
        ...inventoryData,
        updatedAt: new Date().toISOString(),
        updatedBy: user.uid,
      };
      
      dispatch({ type: 'UPDATE_INVENTORY', payload: updatedInventory });
      return updatedInventory;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update inventory' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Product transfer between shops
  const transferProduct = async (fromShopId, toShopId, productId, quantity, notes) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Create transfer record
      const transferRef = await firebase.firestore().collection('transfers').add({
        fromShopId,
        toShopId,
        productId,
        quantity,
        notes,
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: user.uid,
      });
      
      // Create notification for receiving shop manager
      await createNotification(
        toShopId,
        'transfer_request',
        `New product transfer request for ${quantity} units.`,
        {
          transferId: transferRef.id,
          productId,
          quantity,
        }
      );
      
      return transferRef.id;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create transfer' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Sales operations
  const addSale = async (saleData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Create sale record
      const docRef = await firebase.firestore().collection('sales').add({
        ...saleData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: user.uid,
      });
      
      // Update inventory
      for (const item of saleData.items) {
        const inventoryRef = firebase.firestore()
          .collection('inventory')
          .where('shopId', '==', saleData.shopId)
          .where('productId', '==', item.productId)
          .limit(1);
        
        const inventorySnapshot = await inventoryRef.get();
        
        if (!inventorySnapshot.empty) {
          const inventoryDoc = inventorySnapshot.docs[0];
          const currentStock = inventoryDoc.data().currentStock;
          
          await inventoryDoc.ref.update({
            currentStock: currentStock - item.quantity,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedBy: user.uid,
          });
          
          // Check if stock is low after sale
          if ((currentStock - item.quantity) <= item.lowStockThreshold) {
            // Create low stock notification
            await createNotification(
              saleData.shopId,
              'low_stock',
              `Low stock alert for product ${item.productName}`,
              {
                productId: item.productId,
                currentStock: currentStock - item.quantity,
              }
            );
          }
        }
      }
      
      const newSale = {
        id: docRef.id,
        ...saleData,
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
      };
      
      dispatch({ type: 'ADD_SALE', payload: newSale });
      return newSale;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add sale' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Expense operations
  const addExpense = async (expenseData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const docRef = await firebase.firestore().collection('expenses').add({
        ...expenseData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: user.uid,
      });
      
      const newExpense = {
        id: docRef.id,
        ...expenseData,
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
      };
      
      dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
      return newExpense;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add expense' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Delivery operations
  const createDelivery = async (deliveryData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const docRef = await firebase.firestore().collection('deliveries').add({
        ...deliveryData,
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: user.uid,
      });
      
      const newDelivery = {
        id: docRef.id,
        ...deliveryData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
      };
      
      dispatch({ type: 'ADD_DELIVERY', payload: newDelivery });
      
      // Notify riders about new delivery
      await createNotification(
        null,
        'new_delivery',
        `New delivery request from ${deliveryData.shopName}`,
        {
          deliveryId: docRef.id,
          shopId: deliveryData.shopId,
        },
        'rider'
      );
      
      return newDelivery;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create delivery' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateDeliveryStatus = async (deliveryId, status, notes) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const deliveryRef = firebase.firestore().collection('deliveries').doc(deliveryId);
      const deliveryDoc = await deliveryRef.get();
      
      if (!deliveryDoc.exists) {
        throw new Error('Delivery not found');
      }
      
      const deliveryData = deliveryDoc.data();
      
      await deliveryRef.update({
        status,
        notes: notes || deliveryData.notes,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedBy: user.uid,
      });
      
      const updatedDelivery = {
        id: deliveryId,
        ...deliveryData,
        status,
        notes: notes || deliveryData.notes,
        updatedAt: new Date().toISOString(),
        updatedBy: user.uid,
      };
      
      dispatch({ type: 'UPDATE_DELIVERY', payload: updatedDelivery });
      
      // Notify shop manager about delivery status change
      await createNotification(
        deliveryData.shopId,
        'delivery_status_update',
        `Delivery status updated to ${status}`,
        {
          deliveryId,
          status,
        }
      );
      
      return updatedDelivery;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update delivery status' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Employee operations
  const addEmployee = async (employeeData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Create user account
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(
        employeeData.email,
        employeeData.password
      );
      
      const uid = userCredential.user.uid;
      
      // Add user data to Firestore
      await firebase.firestore().collection('users').doc(uid).set({
        email: employeeData.email,
        name: employeeData.name,
        role: employeeData.role,
        shopId: employeeData.shopId,
        position: employeeData.position,
        phone: employeeData.phone,
        salary: employeeData.salary,
        joiningDate: employeeData.joiningDate,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: user.uid,
      });
      
      // Remove password from employee data before adding to state
      const { password, ...employeeDataWithoutPassword } = employeeData;
      
      const newEmployee = {
        id: uid,
        ...employeeDataWithoutPassword,
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
      };
      
      dispatch({ type: 'ADD_EMPLOYEE', payload: newEmployee });
      return newEmployee;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add employee' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateEmployee = async (employeeId, employeeData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await firebase.firestore().collection('users').doc(employeeId).update({
        ...employeeData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedBy: user.uid,
      });
      
      const updatedEmployee = {
        id: employeeId,
        ...employeeData,
        updatedAt: new Date().toISOString(),
        updatedBy: user.uid,
      };
      
      dispatch({ type: 'UPDATE_EMPLOYEE', payload: updatedEmployee });
      return updatedEmployee;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update employee' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteEmployee = async (employeeId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Delete user document
      await firebase.firestore().collection('users').doc(employeeId).delete();
      
      // Delete authentication account
      // Note: This typically requires special Firebase Admin SDK privileges
      // For client-side apps, you might need a Cloud Function to handle this
      
      dispatch({ type: 'DELETE_EMPLOYEE', payload: employeeId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete employee' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Notification functions
  const createNotification = async (shopId, type, message, data, targetRole = null) => {
    try {
      // Determine target users based on role or shopId
      let targetUsers = [];
      
      if (targetRole) {
        // Fetch users with specific role
        const usersSnapshot = await firebase
          .firestore()
          .collection('users')
          .where('role', '==', targetRole)
          .get();
          
        targetUsers = usersSnapshot.docs.map(doc => doc.id);
      } else if (shopId) {
        // Fetch manager of the specified shop
        const managersSnapshot = await firebase
          .firestore()
          .collection('users')
          .where('shopId', '==', shopId)
          .where('role', '==', 'manager')
          .get();
          
        targetUsers = managersSnapshot.docs.map(doc => doc.id);
      }
      
      // Create notifications for each target user
      const notificationPromises = targetUsers.map(userId => {
        return firebase.firestore().collection('notifications').add({
          userId,
          type,
          message,
          data,
          read: false,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      });
      
      await Promise.all(notificationPromises);
      
      // Update local state if current user is a target
      if (targetUsers.includes(user.uid)) {
        const newNotification = {
          id: Date.now().toString(), // Temporary ID until refresh
          userId: user.uid,
          type,
          message,
          data,
          read: false,
          createdAt: new Date().toISOString(),
        };
        
        dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await firebase
        .firestore()
        .collection('notifications')
        .doc(notificationId)
        .update({
          read: true,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        
      dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Report functions
  const generateSalesReport = async (shopId, startDate, endDate) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      let query = firebase.firestore().collection('sales')
        .where('createdAt', '>=', new Date(startDate))
        .where('createdAt', '<=', new Date(endDate));
        
      if (shopId) {
        query = query.where('shopId', '==', shopId);
      }
      
      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate sales report' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const generateExpenseReport = async (shopId, startDate, endDate) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      let query = firebase.firestore().collection('expenses')
        .where('date', '>=', startDate)
        .where('date', '<=', endDate);
        
      if (shopId) {
        query = query.where('shopId', '==', shopId);
      }
      
      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate expense report' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const generateInventoryReport = async (shopId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      let query = firebase.firestore().collection('inventory');
        
      if (shopId) {
        query = query.where('shopId', '==', shopId);
      }
      
      const snapshot = await query.get();
      const inventoryItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Enrich inventory data with product details
      const productIds = [...new Set(inventoryItems.map(item => item.productId))];
      const productsSnapshot = await firebase
        .firestore()
        .collection('products')
        .where(firebase.firestore.FieldPath.documentId(), 'in', productIds)
        .get();
        
      const productsMap = {};
      productsSnapshot.docs.forEach(doc => {
        productsMap[doc.id] = doc.data();
      });
      
      return inventoryItems.map(item => ({
        ...item,
        productName: productsMap[item.productId]?.name || 'Unknown Product',
        productCategory: productsMap[item.productId]?.category || 'Uncategorized',
      }));
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate inventory report' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Selected shop functions
  const setSelectedShop = (shop) => {
    dispatch({ type: 'SET_SELECTED_SHOP', payload: shop });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        fetchInitialData,
        addShop,
        updateShop,
        deleteShop,
        addProduct,
        updateProduct,
        deleteProduct,
        updateInventory,
        transferProduct,
        addSale,
        addExpense,
        createDelivery,
        updateDeliveryStatus,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        markNotificationAsRead,
        generateSalesReport,
        generateExpenseReport,
        generateInventoryReport,
        setSelectedShop,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};