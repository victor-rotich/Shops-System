import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import AuthNavigator from './AuthNavigator';
import AdminNavigator from './AdminNavigator';
import ManagerNavigator from './ManagerNavigator';
import EmployeeNavigator from './EmployeeNavigator';
import RiderNavigator from './RiderNavigator';
import LoadingScreen from '../screens/common/LoadingScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, isAuthenticated, loading, isAdmin, isManager, isEmployee, isRider } = useAuth();
  const { fetchInitialData, isLoading } = useApp();

  useEffect(() => {
    if (isAuthenticated) {
      fetchInitialData();
    }
  }, [isAuthenticated]);

  if (loading || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          {isAdmin && <Stack.Screen name="Admin" component={AdminNavigator} />}
          {isManager && <Stack.Screen name="Manager" component={ManagerNavigator} />}
          {isEmployee && <Stack.Screen name="Employee" component={EmployeeNavigator} />}
          {isRider && <Stack.Screen name="Rider" component={RiderNavigator} />}
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;