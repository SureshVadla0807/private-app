import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { TRANSACTIONS_API } from '../api/config';

interface TransactionItem {
  id: string;
  amount: number;
  currency: string;
  type: 'DEBIT' | 'CREDIT' | 'TRANSFER' | 'REFUND';
  merchantName: string;
  cleanMerchantName: string;
  category: string;
  subCategory?: string;
  accountMask?: string;
  timestamp: string;
  source: string;
  rawText?: string;
}

export const TransactionsScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'DEBIT' | 'CREDIT'>('ALL');

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch(TRANSACTIONS_API);
      const json = await response.json();
      if (json.success && Array.isArray(json.data)) {
        setTransactions(json.data);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${TRANSACTIONS_API}/${id}`, { method: 'DELETE' });
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Transactions',
      'Are you sure you want to delete all tracked transactions?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(TRANSACTIONS_API, { method: 'DELETE' });
              setTransactions([]);
            } catch (err) {
              console.error('Failed to clear transactions:', err);
            }
          },
        },
      ]
    );
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'ALL') return true;
    return t.type === filterType;
  });

  const getCurrencySymbol = (cur?: string) => {
    if (cur === 'INR') return '₹';
    if (cur === 'EUR') return '€';
    if (cur === 'GBP') return '£';
    return '$';
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#38BDF8" />
        <Text style={styles.loadingText}>Fetching transactions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.title}>Transactions</Text>
        {transactions.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearBtnText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {(['ALL', 'DEBIT', 'CREDIT'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.filterChip, filterType === type && styles.filterChipActive]}
            onPress={() => setFilterType(type)}
          >
            <Text style={[styles.filterText, filterType === type && styles.filterTextActive]}>
              {type === 'ALL' ? 'All' : type === 'DEBIT' ? 'Expenses' : 'Income'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Empty State */}
      {filteredTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💳</Text>
          <Text style={styles.emptyTitle}>No Transactions Found</Text>
          <Text style={styles.emptySub}>
            {transactions.length === 0
              ? 'Incoming bank SMS messages will be automatically logged and categorized here.'
              : 'No transactions match the selected filter.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />}
          renderItem={({ item }) => {
            const sym = getCurrencySymbol(item.currency);
            const isCredit = item.type === 'CREDIT' || item.type === 'REFUND';

            return (
              <View style={styles.txCard}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.merchantContainer}>
                    <Text style={styles.merchantName}>{item.cleanMerchantName || item.merchantName}</Text>
                    <View style={styles.badgeRow}>
                      <View style={styles.sourceBadge}>
                        <Text style={styles.sourceText}>{item.source}</Text>
                      </View>
                      {item.accountMask && (
                        <Text style={styles.cardMask}>••• {item.accountMask}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.amountContainer}>
                    <Text style={[styles.amount, isCredit ? styles.amountCredit : styles.amountDebit]}>
                      {isCredit ? `+${sym}${item.amount.toFixed(2)}` : `-${sym}${item.amount.toFixed(2)}`}
                    </Text>
                    <Text style={styles.dateText}>
                      {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                </View>

                {item.rawText ? (
                  <Text style={styles.rawSnippet} numberOfLines={2}>
                    "{item.rawText}"
                  </Text>
                ) : null}

                <View style={styles.footerRow}>
                  <Text style={styles.categoryBadge}>{item.subCategory || item.category}</Text>
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '800',
  },
  clearBtnText: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  filterChip: {
    backgroundColor: '#1E293B',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#38BDF8',
  },
  filterText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#0F172A',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySub: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  txCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  merchantContainer: {
    flex: 1,
    marginRight: 12,
  },
  merchantName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  sourceText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
  },
  cardMask: {
    color: '#94A3B8',
    fontSize: 12,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 17,
    fontWeight: '800',
  },
  amountDebit: {
    color: '#F87171',
  },
  amountCredit: {
    color: '#34D399',
  },
  dateText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  rawSnippet: {
    color: '#64748B',
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 8,
    backgroundColor: '#0F172A',
    padding: 6,
    borderRadius: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  categoryBadge: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  deleteText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
});
