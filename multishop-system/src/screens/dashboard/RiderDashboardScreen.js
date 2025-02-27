import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import AppCard from '../../components/common/AppCard';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const RiderDashboardScreen = ({ navigation }) => {
  const { colors, fontSizes } = useTheme();
  const { user } = useAuth();
  const {
    deliveries,
    shops,
    notifications,
    isLoading,
    fetchInitialData,
    updateDeliveryStatus,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [pendingDeliveries, setPendingDeliveries] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalDeliveries, setTotalDeliveries] = useState(0);

  useEffect(() => {
    if (user && deliveries) {
      // Filter deliveries for this rider
      const riderDeliveries = deliveries.filter(
        delivery => delivery.riderId === user.uid
      );
      
      // Pending deliveries
      const pending = riderDeliveries.filter(
        delivery => delivery.status === 'pending'
      );
      setPendingDeliveries(pending);
      
      // Active/in-transit deliveries
      const active = riderDeliveries.filter(
        delivery => delivery.status === 'in-transit'
      );
      setActiveDeliveries(active);
      
      // Calculate statistics
      const completed = riderDeliveries.filter(
        delivery => delivery.status === 'completed'
      );
      setTotalDeliveries(completed.length);
      
      // Calculate earnings (for demo, assume $5 per delivery)
      setTotalEarnings(completed.length * 5);
    }
  }, [user, deliveries]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  const handleAcceptDelivery = async (deliveryId) => {
    try {
      await updateDeliveryStatus(deliveryId, 'in-transit', 'Rider accepted delivery');
      await fetchInitialData();
    } catch (error) {
      console.error('Error accepting delivery:', error);
    }
  };

  const handleCompleteDelivery = async (deliveryId) => {
    try {
      await updateDeliveryStatus(deliveryId, 'completed', 'Delivery completed successfully');
      await fetchInitialData();
    } catch (error) {
      console.error('Error completing delivery:', error);
    }
  };

  const getShopName = (shopId) => {
    const shop = shops.find(s => s.id === shopId);
    return shop ? shop.name : 'Unknown Shop';
  };

  const renderPendingDeliveryItem = ({ item }) => (
    <AppCard style={[styles.deliveryCard, { borderLeftColor: colors.warning }]}>
      <View style={styles.deliveryHeader}>
        <View style={styles.deliveryInfo}>
          <Text style={[styles.shopName, { color: colors.text, fontSize: fontSizes.md }]}>
            {getShopName(item.shopId)}
          </Text>
          <Text style={[styles.deliveryId, { color: colors.text + '80' }]}>
            Delivery #{item.id.substring(0, 8)}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: colors.warning + '20' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: colors.warning, fontSize: fontSizes.xs },
            ]}
          >
            PENDING
          </Text>
        </View>
      </View>
      
      <View style={styles.deliveryDetails}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.text + '80' }]}>
            Items:
          </Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {item.items ? item.items.length : '1'} item(s)
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.text + '80' }]}>
            Distance:
          </Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {item.distance || '2.5'} km
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.text + '80' }]}>
            Estimated Time:
          </Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {item.estimatedTime || '15-20'} mins
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[
          styles.acceptButton,
          { backgroundColor: colors.primary },
        ]}
        onPress={() => handleAcceptDelivery(item.id)}
      >
        <Text style={styles.buttonText}>Accept Delivery</Text>
      </TouchableOpacity>
    </AppCard>
  );

  const renderActiveDeliveryItem = ({ item }) => (
    <AppCard style={[styles.deliveryCard, { borderLeftColor: colors.primary }]}>
      <View style={styles.deliveryHeader}>
        <View style={styles.deliveryInfo}>
          <Text style={[styles.shopName, { color: colors.text, fontSize: fontSizes.md }]}>
            {getShopName(item.shopId)}
          </Text>
          <Text style={[styles.deliveryId, { color: colors.text + '80' }]}>
            Delivery #{item.id.substring(0, 8)}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: colors.primary + '20' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: colors.primary, fontSize: fontSizes.xs },
            ]}
          >
            IN TRANSIT
          </Text>
        </View>
      </View>
      
      <View style={styles.deliveryDetails}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.text + '80' }]}>
            Customer:
          </Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {item.customerName || 'John Doe'}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.text + '80' }]}>
            Address:
          </Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {item.deliveryAddress || '123 Main St, City'}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.text + '80' }]}>
            Phone:
          </Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {item.customerPhone || '555-123-4567'}
          </Text>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.navigationButton,
            { backgroundColor: colors.info + '15' },
          ]}
          onPress={() => {
            // In a real app, this would open maps navigation
            alert('This would open navigation to the customer address');
          }}
        >
          <Ionicons name="navigate" size={wp(5)} color={colors.info} />
          <Text style={[styles.navigationText, { color: colors.info }]}>
            Navigate
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.completeButton,
            { backgroundColor: colors.success },
          ]}
          onPress={() => handleCompleteDelivery(item.id)}
        >
          <Text style={styles.buttonText}>Complete Delivery</Text>
        </TouchableOpacity>
      </View>
    </AppCard>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text, fontSize: fontSizes.lg }]}>
            Hello, {user?.name || 'Rider'}
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: colors.text + 'AA', fontSize: fontSizes.sm },
            ]}
          >
            Ready for your deliveries
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[
              styles.iconButton,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={wp(5.5)} color={colors.text} />
            {notifications.filter((n) => !n.read).length > 0 && (
              <View
                style={[
                  styles.notificationBadge,
                  { backgroundColor: colors.notification },
                ]}
              >
                <Text style={styles.badgeText}>
                  {notifications.filter((n) => !n.read).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.iconButton,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-outline" size={wp(5.5)} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <AppCard
            style={[
              styles.statsCard,
              { backgroundColor: colors.primary + '15' },
            ]}
          >
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary, fontSize: fontSizes.xl }]}>
                  ${totalEarnings.toFixed(2)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.text + '99' }]}>
                  Total Earnings
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary, fontSize: fontSizes.xl }]}>
                  {totalDeliveries}
                </Text>
                <Text style={[styles.statLabel, { color: colors.text + '99' }]}>
                  Completed
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.viewHistoryButton, { backgroundColor: colors.primary + '25' }]}
              onPress={() => navigation.navigate('History', { screen: 'RiderHistory' })}
            >
              <Text style={[styles.viewHistoryText, { color: colors.primary }]}>
                View History
              </Text>
              <Ionicons name="chevron-forward" size={wp(4)} color={colors.primary} />
            </TouchableOpacity>
          </AppCard>
        </View>

        {/* Active Deliveries */}
        {activeDeliveries.length > 0 && (
          <View style={styles.deliveriesSection}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text, fontSize: fontSizes.lg },
              ]}
            >
              Active Deliveries
            </Text>
            <FlatList
              data={activeDeliveries}
              renderItem={renderActiveDeliveryItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Pending Deliveries */}
        <View style={styles.deliveriesSection}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text, fontSize: fontSizes.lg },
            ]}
          >
            Pending Deliveries
          </Text>
          {pendingDeliveries.length > 0 ? (
            <FlatList
              data={pendingDeliveries}
              renderItem={renderPendingDeliveryItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
              <Ionicons name="bicycle-outline" size={wp(12)} color={colors.text + '40'} />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No pending deliveries
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.text + '99' }]}>
                New delivery requests will appear here
              </Text>
            </View>
          )}
        </View>

        {/* Quick Links */}
        <View style={styles.quickLinksContainer}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text, fontSize: fontSizes.lg },
            ]}
          >
            Quick Links
          </Text>
          <View style={styles.quickLinksRow}>
            <TouchableOpacity
              style={[styles.quickLinkItem, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('Deliveries', { screen: 'RiderDeliveries' })}
            >
              <Ionicons name="bicycle" size={wp(6)} color={colors.primary} />
              <Text style={[styles.quickLinkText, { color: colors.text }]}>
                My Deliveries
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickLinkItem, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('History', { screen: 'RiderHistory' })}
            >
              <Ionicons name="time" size={wp(6)} color={colors.secondary} />
              <Text style={[styles.quickLinkText, { color: colors.text }]}>
                History
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickLinkItem, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('Earnings', { screen: 'RiderEarnings' })}
            >
              <Ionicons name="wallet" size={wp(6)} color={colors.success} />
              <Text style={[styles.quickLinkText, { color: colors.text }]}>
                Earnings
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  greeting: {
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: hp(0.5),
  },
  headerButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: wp(2),
    borderWidth: 1,
  },
  notificationBadge: {
    position: 'absolute',
    top: -hp(0.5),
    right: -wp(1),
    minWidth: wp(4),
    height: wp(4),
    borderRadius: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(1),
  },
  badgeText: {
    color: 'white',
    fontSize: wp(2.5),
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
  },
  statsContainer: {
    marginBottom: hp(3),
  },
  statsCard: {
    marginHorizontal: 0,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: wp(3.5),
    marginTop: hp(0.5),
  },
  statDivider: {
    width: 1,
    height: hp(6),
    backgroundColor: '#E0E0E0',
  },
  viewHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1),
    borderRadius: hp(1),
    marginTop: hp(1.5),
  },
  viewHistoryText: {
    fontWeight: '500',
    marginRight: wp(1),
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: hp(1.5),
  },
  deliveriesSection: {
    marginBottom: hp(3),
  },
  deliveryCard: {
    marginHorizontal: 0,
    marginBottom: hp(2),
    borderLeftWidth: wp(1),
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(1.5),
  },
  deliveryInfo: {
    flex: 1,
  },
  shopName: {
    fontWeight: 'bold',
    marginBottom: hp(0.5),
  },
  deliveryId: {
    fontSize: wp(3.5),
  },
  statusBadge: {
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: hp(0.5),
  },
  statusText: {
    fontWeight: 'bold',
  },
  deliveryDetails: {
    marginBottom: hp(2),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(0.8),
  },
  detailLabel: {
    fontSize: wp(3.5),
  },
  detailValue: {
    fontSize: wp(3.5),
    fontWeight: '500',
  },
  acceptButton: {
    paddingVertical: hp(1.2),
    borderRadius: hp(1),
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: wp(3.8),
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4),
    borderRadius: hp(1),
    width: '30%',
  },
  navigationText: {
    fontWeight: '500',
    marginLeft: wp(1),
    fontSize: wp(3.5),
  },
  completeButton: {
    paddingVertical: hp(1.2),
    borderRadius: hp(1),
    alignItems: 'center',
    width: '65%',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp(6),
    borderRadius: hp(1),
  },
  emptyText: {
    fontWeight: 'bold',
    fontSize: wp(4),
    marginTop: hp(1),
  },
  emptySubtext: {
    fontSize: wp(3.5),
    marginTop: hp(0.5),
    textAlign: 'center',
  },
  quickLinksContainer: {
    marginBottom: hp(3),
  },
  quickLinksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickLinkItem: {
    width: wp(27),
    height: wp(27),
    borderRadius: hp(1),
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLinkText: {
    marginTop: hp(1),
    fontWeight: '500',
  },
});

export default RiderDashboardScreen;