import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Screens
import ManagerDashboardScreen from '../screens/dashboard/ManagerDashboardScreen';
import ShopDetailScreen from '../screens/shops/ShopDetailScreen';
import InventoryScreen from '../screens/inventory/InventoryScreen';
import ProductDetailScreen from '../screens/inventory/ProductDetailScreen';
import StockEntryScreen from '../screens/inventory/StockEntryScreen';
import TransferRequestScreen from '../screens/inventory/TransferRequestScreen';
import SalesEntryScreen from '../screens/sales/SalesEntryScreen';
import SalesHistoryScreen from '../screens/sales/SalesHistoryScreen';
import SalesReportScreen from '../screens/reports/SalesReportScreen';
import ExpensesScreen from '../screens/expenses/ExpensesScreen';
import AddExpenseScreen from '../screens/expenses/AddExpenseScreen';
import ExpenseReportScreen from '../screens/reports/ExpenseReportScreen';
import DeliveriesScreen from '../screens/deliveries/DeliveriesScreen';
import DeliveryDetailScreen from '../screens/deliveries/DeliveryDetailScreen';
import CreateDeliveryScreen from '../screens/deliveries/CreateDeliveryScreen';
import EmployeeListScreen from '../screens/employees/EmployeeListScreen';
import EmployeeDetailScreen from '../screens/employees/EmployeeDetailScreen';
import EmployeeAttendanceScreen from '../screens/employees/EmployeeAttendanceScreen';
import ManagerReportsScreen from '../screens/reports/ManagerReportsScreen';
import InventoryReportScreen from '../screens/reports/InventoryReportScreen';
import ProfitLossScreen from '../screens/reports/ProfitLossScreen';
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
      <Stack.Screen name="ManagerDashboardHome" component={ManagerDashboardScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="ShopDetail" component={ShopDetailScreen} options={({ route }) => ({ title: route.params?.shopName || 'Shop Details' })} />
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
      <Stack.Screen name="InventoryHome" component={InventoryScreen} options={{ title: 'Inventory' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={({ route }) => ({ title: route.params?.productName || 'Product Details' })} />
      <Stack.Screen name="StockEntry" component={StockEntryScreen} options={{ title: 'Stock Entry' }} />
      <Stack.Screen name="TransferRequest" component={TransferRequestScreen} options={{ title: 'Request Transfer' }} />
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
      <Stack.Screen name="SalesHistory" component={SalesHistoryScreen} options={{ title: 'Sales History' }} />
      <Stack.Screen name="SalesReport" component={SalesReportScreen} options={{ title: 'Sales Report' }} />
      <Stack.Screen name="Expenses" component={ExpensesScreen} options={{ title: 'Expenses' }} />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ title: 'Add Expense' }} />
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
      <Stack.Screen name="CreateDelivery" component={CreateDeliveryScreen} options={{ title: 'Request Delivery' }} />
    </Stack.Navigator>
  );
};

// Employees Stack
const EmployeesStack = () => {
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
      <Stack.Screen name="EmployeeList" component={EmployeeListScreen} options={{ title: 'Employees' }} />
      <Stack.Screen name="EmployeeDetail" component={EmployeeDetailScreen} options={({ route }) => ({ title: route.params?.employeeName || 'Employee Details' })} />
      <Stack.Screen name="EmployeeAttendance" component={EmployeeAttendanceScreen} options={{ title: 'Attendance' }} />
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
      <Stack.Screen name="ManagerReportsHome" component={ManagerReportsScreen} options={{ title: 'Reports' }} />
      <Stack.Screen name="SalesReport" component={SalesReportScreen} options={{ title: 'Sales Report' }} />
      <Stack.Screen name="ExpenseReport" component={ExpenseReportScreen} options={{ title: 'Expense Report' }} />
      <Stack.Screen name="InventoryReport" component={InventoryReportScreen} options={{ title: 'Inventory Report' }} />
      <Stack.Screen name="ProfitLoss" component={ProfitLossScreen} options={{ title: 'Profit & Loss' }} />
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
const ManagerNavigator = () => {
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
          } else if (route.name === 'Employees') {
            iconName = focused ? 'people' : 'people-outline';
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
      <Tab.Screen name="Inventory" component={InventoryStack} />
      <Tab.Screen name="Sales" component={SalesStack} />
      <Tab.Screen name="Deliveries" component={DeliveriesStack} />
      <Tab.Screen name="Employees" component={EmployeesStack} />
      <Tab.Screen name="Reports" component={ReportsStack} />
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  );
};

export default ManagerNavigator;