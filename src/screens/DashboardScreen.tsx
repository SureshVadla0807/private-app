import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { TRANSACTIONS_API } from '../api/config';

interface SummaryData {
  totalExpense: number;
  totalIncome: number;
  netSavings: number;
  categoryBreakdown: Record<string, number>;
  transactionCount: number;
}

interface DashboardProps {
  onNavigateToCapture?: () => void;
}

const CATEGORY_NAMES: Record<string, { label: string; icon: string }> = {
  food_dining: { label: 'Food & Dining', icon: '🍔' },
  shopping: { label: 'Shopping', icon: '🛍️' },
  transportation: { label: 'Transportation', icon: '🚗' },
  utilities_bills: { label: 'Bills & Utilities', icon: '⚡' },
  entertainment: { label: 'Entertainment', icon: '🎬' },
  health_wellness: { label: 'Health & Wellness', icon: '💊' },
  investments_savings: { label: 'Savings & Investments', icon: '📈' },
  income: { label: 'Income', icon: '💰' },
  other: { label: 'Other', icon: '📦' },
};

export const DashboardScreen: React.FC<DashboardProps> = ({ onNavigateToCapture }) => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [recentTx, setRecentTx] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      // 1. Fetch summary totals
      const summaryRes = await fetch(`${TRANSACTIONS_API}/summary`);
      const summaryJson = await summaryRes.json();
      if (summaryJson.success) {
        setSummary(summaryJson.data);
      }

      // 2. Fetch recent transactions
      const txRes = await fetch(`${TRANSACTIONS_API}?limit=5`);
      const txJson = await txRes.json();
      if (txJson.success) {
        setRecentTx(txJson.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#38BDF8" />
        <Text style={styles.loadingText}>Loading your spendings...</Text>
      </View>
    );
  }

  const categoryEntries = Object.entries(summary?.categoryBreakdown || {});
  const totalSpent = summary?.totalExpense || 0;
  const totalIncome = summary?.totalIncome || 0;
  const netSavings = summary?.netSavings || 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />}
    >
      {/* Header Total Spend */}
      <View style={styles.header}>
        <Text style={styles.subtitle}>Total Expense Tracked</Text>
        <Text style={styles.balance}>${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        <View style={styles.rowStats}>
          <Text style={styles.incomeStat}>Income: +${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
          <Text style={styles.statDot}>•</Text>
          <Text style={netSavings >= 0 ? styles.savingsStat : styles.lossStat}>
            Net: {netSavings >= 0 ? `+$${netSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : `-$${Math.abs(netSavings).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          </Text>
        </View>
      </View>

      {/* Tracker Status Indicator */}
      <View style={styles.statusBanner}>
        <View style={styles.pulseDot} />
        <Text style={styles.statusBannerText}>
          {summary?.transactionCount ? `${summary.transactionCount} bank SMS payments automatically captured` : 'SMS Payment Tracker Active 🟢'}
        </Text>
      </View>

      {/* Empty State when no transactions yet */}
      {(!summary || summary.transactionCount === 0) && (
        <View style={styles.cardEmpty}>
          <Text style={styles.emptyIcon}>📬</Text>
          <Text style={styles.cardTitle}>No Transactions Yet</Text>
          <Text style={styles.emptyDesc}>
            Incoming bank SMS messages will automatically be parsed and logged here in real time.
          </Text>
          <TouchableOpacity style={styles.actionBtn} onPress={onNavigateToCapture}>
            <Text style={styles.actionBtnText}>Test Ingestion Playground</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Category Breakdown (Dynamically Generated from real data) */}
      {categoryEntries.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Spending by Category</Text>
          {categoryEntries.map(([catKey, amount]) => {
            const cat = CATEGORY_NAMES[catKey] || { label: catKey, icon: '🏷️' };
            const pct = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;

            return (
              <View key={catKey} style={styles.categoryRow}>
                <View style={styles.catLeft}>
                  <Text style={styles.catIcon}>{cat.icon}</Text>
                  <View>
                    <Text style={styles.catLabel}>{cat.label}</Text>
                    <Text style={styles.catPct}>{pct}% of total spend</Text>
                  </View>
                </View>
                <Text style={styles.catAmount}>${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Recent Activity */}
      {recentTx.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          {recentTx.map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <View>
                <Text style={styles.txMerchant}>{tx.cleanMerchantName || tx.merchantName}</Text>
                <Text style={styles.txMeta}>
                  {tx.source} • {new Date(tx.timestamp).toLocaleDateString()}
                </Text>
              </View>
              <Text style={[styles.txAmount, tx.type === 'CREDIT' ? styles.txCredit : styles.txDebit]}>
                {tx.type === 'CREDIT' ? `+$${tx.amount.toFixed(2)}` : `-$${tx.amount.toFixed(2)}`}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 16,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 12,
  },
  header: {
    marginVertical: 20,
    alignItems: 'center',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  balance: {
    color: '#F8FAFC',
    fontSize: 40,
    fontWeight: '800',
    marginTop: 6,
  },
  rowStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  incomeStat: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '600',
  },
  statDot: {
    color: '#64748B',
    marginHorizontal: 8,
  },
  savingsStat: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '600',
  },
  lossStat: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '600',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 30,
    alignSelf: 'center',
    marginBottom: 16,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399',
    marginRight: 8,
  },
  statusBannerText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardEmpty: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginVertical: 10,
  },
  emptyIcon: {
    fontSize: 42,
    marginBottom: 10,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyDesc: {
    color: '#94A3B8',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  catLabel: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  catPct: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  catAmount: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  txMerchant: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  txMeta: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  txDebit: {
    color: '#F87171',
  },
  txCredit: {
    color: '#34D399',
  },
  spacer: {
    height: 40,
  },
});
