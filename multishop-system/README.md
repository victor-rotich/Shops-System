# Multi-Shop Admin & Management System

## Overview
The **Multi-Shop Admin & Management System** is a powerful application built with React Native and Expo, designed to streamline the management of multiple shops, inventory, sales, employees, deliveries, and more.

## Features
- **Authentication & Authorization** (Super Admin, Managers, Employees, Riders)
- **Dashboard** for real-time analytics
- **Shop Management** (create, update, delete shops)
- **Inventory Management**
- **Sales Tracking**
- **Expense Management**
- **Delivery & Rider Management**
- **Employee Management**
- **Reports & Analytics**
- **Settings & Customization**

## Project Structure
``` 
|- app.json             // Expo configuration
|- App.js               // Entry point
|- babel.config.js      // Babel configuration
|- package.json         // Dependencies
|
|- src/
   |- assets/           // Images, fonts, etc.
   |  |- fonts/
   |  |  |- Roboto-Regular.ttf
   |  |  |- Roboto-Bold.ttf
   |  |  |- Roboto-Medium.ttf
   |  |- icon.png
   |  |- splash.png
   |  |- logo.png
   |
   |- components/       // Reusable UI components
   |  |- common/
   |  |  |- AppButton.js
   |  |  |- AppCard.js
   |  |  |- AppInput.js
   |  |  |- LoadingScreen.js
   |
   |- context/          // Context API for state management
   |  |- AuthContext.js
   |  |- AppContext.js
   |  |- ThemeContext.js
   |
   |- navigation/       // Navigation configuration
   |  |- AppNavigator.js
   |  |- AuthNavigator.js
   |  |- AdminNavigator.js
   |  |- ManagerNavigator.js
   |  |- EmployeeNavigator.js
   |  |- RiderNavigator.js
   |
   |- screens/          // All app screens
   |  |- auth/
   |  |  |- LoginScreen.js
   |  |  |- RegisterScreen.js
   |  |  |- ForgotPasswordScreen.js
   |  |
   |  |- common/
   |  |  |- LoadingScreen.js
   |  |  |- NotificationsScreen.js
   |  |
   |  |- dashboard/
   |  |  |- DashboardScreen.js
   |  |  |- ManagerDashboardScreen.js
   |  |  |- EmployeeDashboardScreen.js
   |  |  |- RiderDashboardScreen.js
   |  |
   |  |- shops/
   |  |  |- ShopListScreen.js
   |  |  |- ShopDetailScreen.js
   |  |  |- AddShopScreen.js
   |  |
   |  |- inventory/
   |  |  |- ProductListScreen.js
   |  |  |- ProductDetailScreen.js
   |  |  |- AddProductScreen.js
   |  |  |- InventoryScreen.js
   |  |  |- StockEntryScreen.js
   |  |  |- TransferRequestScreen.js
   |  |  |- InventoryViewScreen.js
   |  |
   |  |- sales/
   |  |  |- SalesScreen.js
   |  |  |- SalesEntryScreen.js
   |  |  |- SalesHistoryScreen.js
   |  |
   |  |- expenses/
   |  |  |- ExpensesScreen.js
   |  |  |- AddExpenseScreen.js
   |  |
   |  |- deliveries/
   |  |  |- DeliveriesScreen.js
   |  |  |- DeliveryDetailScreen.js
   |  |  |- CreateDeliveryScreen.js
   |  |  |- RiderDeliveriesScreen.js
   |  |  |- UpdateDeliveryScreen.js
   |  |  |- RiderHistoryScreen.js
   |  |  |- RiderEarningsScreen.js
   |  |  |- DeliveriesViewScreen.js
   |  |
   |  |- employees/
   |  |  |- EmployeeListScreen.js
   |  |  |- EmployeeDetailScreen.js
   |  |  |- AddEmployeeScreen.js
   |  |  |- EmployeeAttendanceScreen.js
   |  |  |- AttendanceScreen.js
   |  |  |- LeaveRequestScreen.js
   |  |  |- LeaveHistoryScreen.js
   |  |
   |  |- reports/
   |  |  |- ReportsScreen.js
   |  |  |- ManagerReportsScreen.js
   |  |  |- SalesReportScreen.js
   |  |  |- ExpenseReportScreen.js
   |  |  |- InventoryReportScreen.js
   |  |  |- TransferReportScreen.js
   |  |  |- ProfitLossScreen.js
   |  |  |- AttendanceReportScreen.js
   |  |
   |  |- settings/
   |  |  |- SettingsScreen.js
   |  |  |- ProfileScreen.js
   |
   |- services/         // API and third-party services
   |  |- firebase.js
   |  |- storage.js
   |
   |- utils/            // Utility functions
   |  |- helpers.js
   |  |- validation.js
   |  |- formatters.js
   |
   |- constants/        // App constants
      |- theme.js
      |- routes.js
      |- permissions.js
```

## Installation
### Prerequisites
Ensure you have the following installed:
- Node.js
- Expo CLI
- Firebase (if used)

### Steps
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/multi-shop-admin.git
   cd multi-shop-admin
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   expo start
   ```

## Technologies Used
- React Native
- Expo
- Context API
- Firebase
- AsyncStorage/SQLite

