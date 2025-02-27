import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Screens
import EmployeeDashboardScreen from '../screens/dashboard/EmployeeDashboardScreen';
import InventoryViewScreen from '../screens/inventory/InventoryViewScreen';
import ProductDetailScreen from '../screens/inventory/ProductDetailScreen';
import SalesEntryScreen from '../screens/sales/SalesEntryScreen';
import DeliveriesViewScreen from '../screens/deliveries/DeliveriesViewScreen';
import DeliveryDetailScreen from '../screens/deliveries/DeliveryDetailScreen';
import AttendanceScreen from '../screens/employees/AttendanceScreen';
import LeaveRequestScreen from '../screens/employees/LeaveRequestScreen';
import LeaveHistoryScreen from '../screens/employees/LeaveHistoryScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import NotificationsScreen from '../screens/common/NotificationsScreen';
import ProfileScreen from '../screens/settings/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Dashboard Stack
const DashboardStack = () => {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.navBackground,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.navText,
      }}
    >
      <Stack.Screen name="EmployeeDashboardHome" component={EmployeeDashboardScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};



// Inventory Stack
const InventoryStack = () => {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.navBackground,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.navText,
      }}
    >
      <Stack.Screen name="InventoryView" component={InventoryViewScreen} options={{ title: 'Inventory' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={({ route }) => ({ title: route.params?.productName || 'Product Details' })} />
    </Stack.Navigator>
  );
};

// Sales Stack
const SalesStack = () => {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.navBackground,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.navText,
      }}
    >
      <Stack.Screen name="SalesEntry" component={SalesEntryScreen} options={{ title: 'Sales Entry' }} />
    </Stack.Navigator>
  );
};

// Deliveries Stack
const DeliveriesStack = () => {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.navBackground,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.navText,
      }}
    >
      <Stack.Screen name="DeliveriesView" component={DeliveriesViewScreen} options={{ title: 'Deliveries' }} />
      <Stack.Screen name="DeliveryDetail" component={DeliveryDetailScreen} options={({ route }) => ({ title: `Delivery #${route.params?.deliveryId || ''}` })} />
    </Stack.Navigator>
  );
};

// Attendance Stack
const AttendanceStack = () => {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.navBackground,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.navText,
      }}
    >
      <Stack.Screen name="AttendanceHome" component={AttendanceScreen} options={{ title: 'Attendance' }} />
      <Stack.Screen name="LeaveRequest" component={LeaveRequestScreen} options={{ title: 'Request Leave' }} />
      <Stack.Screen name="LeaveHistory" component={LeaveHistoryScreen} options={{ title: 'Leave History' }} />
    </Stack.Navigator>
  );
};

// Settings Stack
const SettingsStack = () => {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.navBackground,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.navText,
      }}
    >
      <Stack.Screen name="SettingsHome" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const EmployeeNavigator = () => {
  const { colors, isDark } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Inventory') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Sales') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'Deliveries') {
            iconName = focused ? 'bicycle' : 'bicycle-outline';
          } else if (route.name === 'Attendance') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: colors.navBackground,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Inventory" component={InventoryStack} />
      <Tab.Screen name="Sales" component={SalesStack} />
      <Tab.Screen name="Deliveries" component={DeliveriesStack} />
      <Tab.Screen name="Attendance" component={AttendanceStack} />
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  );
};

export default EmployeeNavigator;