import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ShopListScreen from '../screens/shops/ShopListScreen';
import ShopDetailScreen from '../screens/shops/ShopDetailScreen';
import AddShopScreen from '../screens/shops/AddShopScreen';
import ProductListScreen from '../screens/inventory/ProductListScreen';
import ProductDetailScreen from '../screens/inventory/ProductDetailScreen';
import AddProductScreen from '../screens/inventory/AddProductScreen';
import InventoryScreen from '../screens/inventory/InventoryScreen';
import SalesScreen from '../screens/sales/SalesScreen';
import SalesReportScreen from '../screens/reports/SalesReportScreen';
import ExpensesScreen from '../screens/expenses/ExpensesScreen';
import ExpenseReportScreen from '../screens/reports/ExpenseReportScreen';
import DeliveriesScreen from '../screens/deliveries/DeliveriesScreen';
import DeliveryDetailScreen from '../screens/deliveries/DeliveryDetailScreen';
import EmployeeListScreen from '../screens/employees/EmployeeListScreen';
import EmployeeDetailScreen from '../screens/employees/EmployeeDetailScreen';
import AddEmployeeScreen from '../screens/employees/AddEmployeeScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';
import InventoryReportScreen from '../screens/reports/InventoryReportScreen';
import TransferReportScreen from '../screens/reports/TransferReportScreen';
import ProfitLossScreen from '../screens/reports/ProfitLossScreen';
import AttendanceReportScreen from '../screens/reports/AttendanceReportScreen';
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
      <Stack.Screen name="DashboardHome" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

// Shops Stack
const ShopsStack = () => {
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
      <Stack.Screen name="ShopList" component={ShopListScreen} options={{ title: 'Shops' }} />
      <Stack.Screen name="ShopDetail" component={ShopDetailScreen} options={({ route }) => ({ title: route.params?.shopName || 'Shop Details' })} />
      <Stack.Screen name="AddShop" component={AddShopScreen} options={{ title: 'Add New Shop' }} />
      <Stack.Screen name="EmployeeList" component={EmployeeListScreen} options={{ title: 'Employees' }} />
      <Stack.Screen name="EmployeeDetail" component={EmployeeDetailScreen} options={({ route }) => ({ title: route.params?.employeeName || 'Employee Details' })} />
      <Stack.Screen name="AddEmployee" component={AddEmployeeScreen} options={{ title: 'Add New Employee' }} />
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
      <Stack.Screen name="ProductList" component={ProductListScreen} options={{ title: 'Products' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={({ route }) => ({ title: route.params?.productName || 'Product Details' })} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} options={{ title: 'Add New Product' }} />
      <Stack.Screen name="Inventory" component={InventoryScreen} options={{ title: 'Inventory' }} />
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
      <Stack.Screen name="SalesHome" component={SalesScreen} options={{ title: 'Sales' }} />
      <Stack.Screen name="SalesReport" component={SalesReportScreen} options={{ title: 'Sales Report' }} />
      <Stack.Screen name="Expenses" component={ExpensesScreen} options={{ title: 'Expenses' }} />
      <Stack.Screen name="ExpenseReport" component={ExpenseReportScreen} options={{ title: 'Expense Report' }} />
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
      <Stack.Screen name="DeliveriesHome" component={DeliveriesScreen} options={{ title: 'Deliveries' }} />
      <Stack.Screen name="DeliveryDetail" component={DeliveryDetailScreen} options={({ route }) => ({ title: `Delivery #${route.params?.deliveryId || ''}` })} />
    </Stack.Navigator>
  );
};

// Reports Stack
const ReportsStack = () => {
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
      <Stack.Screen name="ReportsHome" component={ReportsScreen} options={{ title: 'Reports & Analytics' }} />
      <Stack.Screen name="SalesReport" component={SalesReportScreen} options={{ title: 'Sales Report' }} />
      <Stack.Screen name="ExpenseReport" component={ExpenseReportScreen} options={{ title: 'Expense Report' }} />
      <Stack.Screen name="InventoryReport" component={InventoryReportScreen} options={{ title: 'Inventory Report' }} />
      <Stack.Screen name="TransferReport" component={TransferReportScreen} options={{ title: 'Transfers Report' }} />
      <Stack.Screen name="ProfitLoss" component={ProfitLossScreen} options={{ title: 'Profit & Loss Analysis' }} />
      <Stack.Screen name="AttendanceReport" component={AttendanceReportScreen} options={{ title: 'Attendance Report' }} />
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
const AdminNavigator = () => {
  const { colors, isDark } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Shops') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'Inventory') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Sales') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'Deliveries') {
            iconName = focused ? 'bicycle' : 'bicycle-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
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
      <Tab.Screen name="Shops" component={ShopsStack} />
      <Tab.Screen name="Inventory" component={InventoryStack} />
      <Tab.Screen name="Sales" component={SalesStack} />
      <Tab.Screen name="Deliveries" component={DeliveriesStack} />
      <Tab.Screen name="Reports" component={ReportsStack} />
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  );
};

export default AdminNavigator;