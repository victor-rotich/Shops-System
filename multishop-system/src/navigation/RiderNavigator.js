import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Screens
import RiderDashboardScreen from '../screens/dashboard/RiderDashboardScreen';
import RiderDeliveriesScreen from '../screens/deliveries/RiderDeliveriesScreen';
import DeliveryDetailScreen from '../screens/deliveries/DeliveryDetailScreen';
import UpdateDeliveryScreen from '../screens/deliveries/UpdateDeliveryScreen';
import RiderHistoryScreen from '../screens/deliveries/RiderHistoryScreen';
import RiderEarningsScreen from '../screens/deliveries/RiderEarningsScreen';
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
      <Stack.Screen name="RiderDashboardHome" component={RiderDashboardScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
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
      <Stack.Screen name="RiderDeliveries" component={RiderDeliveriesScreen} options={{ title: 'My Deliveries' }} />
      <Stack.Screen 
        name="DeliveryDetail" 
        component={DeliveryDetailScreen} 
        options={({ route }) => ({ 
          title: `Delivery #${route.params?.deliveryId || ''}` 
        })} 
      />
      <Stack.Screen name="UpdateDelivery" component={UpdateDeliveryScreen} options={{ title: 'Update Delivery' }} />
    </Stack.Navigator>
  );
};

// History Stack
const HistoryStack = () => {
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
      <Stack.Screen name="RiderHistory" component={RiderHistoryScreen} options={{ title: 'Delivery History' }} />
      <Stack.Screen 
        name="DeliveryDetail" 
        component={DeliveryDetailScreen} 
        options={({ route }) => ({ 
          title: `Delivery #${route.params?.deliveryId || ''}` 
        })} 
      />
    </Stack.Navigator>
  );
};

// Earnings Stack
const EarningsStack = () => {
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
      <Stack.Screen name="RiderEarnings" component={RiderEarningsScreen} options={{ title: 'My Earnings' }} />
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
const RiderNavigator = () => {
  const { colors, isDark } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Deliveries') {
            iconName = focused ? 'bicycle' : 'bicycle-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Earnings') {
            iconName = focused ? 'wallet' : 'wallet-outline';
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
      <Tab.Screen name="Deliveries" component={DeliveriesStack} />
      <Tab.Screen name="History" component={HistoryStack} />
      <Tab.Screen name="Earnings" component={EarningsStack} />
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  );
};

export default RiderNavigator;