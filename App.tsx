import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { TransactionsScreen } from './src/screens/TransactionsScreen';
import { SMSListenerScreen } from './src/screens/SMSListenerScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'sms'>('dashboard');

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />

        {/* Screen View */}
        <View style={styles.screenContainer}>
          {activeTab === 'dashboard' && <DashboardScreen onNavigateToCapture={() => setActiveTab('sms')} />}
          {activeTab === 'transactions' && <TransactionsScreen />}
          {activeTab === 'sms' && <SMSListenerScreen onTransactionIngested={() => setActiveTab('transactions')} />}
        </View>

        {/* Bottom Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={[styles.navItem, activeTab === 'dashboard' && styles.navItemActive]}
            onPress={() => setActiveTab('dashboard')}
          >
            <Text style={styles.navIcon}>📊</Text>
            <Text style={[styles.navLabel, activeTab === 'dashboard' && styles.navLabelActive]}>Overview</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === 'transactions' && styles.navItemActive]}
            onPress={() => setActiveTab('transactions')}
          >
            <Text style={styles.navIcon}>💳</Text>
            <Text style={[styles.navLabel, activeTab === 'transactions' && styles.navLabelActive]}>Transactions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === 'sms' && styles.navItemActive]}
            onPress={() => setActiveTab('sms')}
          >
            <Text style={styles.navIcon}>📩</Text>
            <Text style={[styles.navLabel, activeTab === 'sms' && styles.navLabelActive]}>SMS Tracker</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  screenContainer: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingVertical: 10,
    paddingBottom: 16,
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  navItemActive: {
    opacity: 1,
  },
  navIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  navLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },
});
