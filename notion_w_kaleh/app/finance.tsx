import React, { useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { Plus, Trash2 } from 'lucide-react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useNKStore } from '../store/useNKStore';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { AddTransactionSheet } from '../components/sheets/AddTransactionSheet';
import {
  Colors,
  Typography,
  Spacing,
  Radii,
  Animation,
} from '../constants/theme';
import type { FinanceTransaction } from '../lib/schema';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n);
}

function TransactionRow({
  item,
  onDelete,
}: {
  item: FinanceTransaction;
  onDelete: () => void;
}) {
  return (
    <View style={styles.txRow}>
      <View
        style={[
          styles.txIcon,
          {
            backgroundColor:
              item.type === 'income'
                ? 'rgba(48,209,88,0.15)'
                : 'rgba(255,69,58,0.15)',
          },
        ]}
      >
        <Text style={styles.txIconText}>
          {item.type === 'income' ? '↑' : '↓'}
        </Text>
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txCategory}>{item.category}</Text>
        {item.note ? (
          <Text style={styles.txNote} numberOfLines={1}>
            {item.note}
          </Text>
        ) : null}
      </View>
      <Text
        style={[
          styles.txAmount,
          {
            color: item.type === 'income' ? Colors.green : Colors.red,
          },
        ]}
      >
        {item.type === 'income' ? '+' : '-'}
        {formatCurrency(item.amount)}
      </Text>
      <TouchableOpacity
        onPress={onDelete}
        style={styles.txDelete}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Trash2 size={14} color={Colors.textTertiary} strokeWidth={1.5} />
      </TouchableOpacity>
    </View>
  );
}

export default function FinanceScreen() {
  const { transactions, totalBalance, deleteTransaction } = useNKStore();
  const sheetRef = useRef<BottomSheet>(null);

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const handleDelete = async (id: string) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await deleteTransaction(id);
  };

  return (
    <View style={styles.screen}>
      <Header
        title="Finance"
        right={
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              sheetRef.current?.expand();
            }}
            style={styles.addBtn}
          >
            <Plus size={20} color={Colors.gold} strokeWidth={2.5} />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={transactions}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Balance Card */}
            <MotiView
              from={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={Animation.spring}
            >
              <Card glow={totalBalance >= 0} style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <Text
                  style={[
                    styles.balanceAmount,
                    { color: totalBalance >= 0 ? Colors.green : Colors.red },
                  ]}
                >
                  {formatCurrency(totalBalance)}
                </Text>

                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Badge label="Income" variant="green" />
                    <Text style={[styles.statAmt, { color: Colors.green }]}>
                      {formatCurrency(income)}
                    </Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.stat}>
                    <Badge label="Expense" variant="red" />
                    <Text style={[styles.statAmt, { color: Colors.red }]}>
                      {formatCurrency(expense)}
                    </Text>
                  </View>
                </View>
              </Card>
            </MotiView>

            <Text style={styles.historyLabel}>Transaction History</Text>
          </>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No transactions yet.</Text>
        }
        renderItem={({ item, index }) => (
          <MotiView
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ ...Animation.spring, delay: index * 40 }}
          >
            <Card style={styles.txCard}>
              <TransactionRow
                item={item}
                onDelete={() => handleDelete(item.id)}
              />
            </Card>
          </MotiView>
        )}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />

      <AddTransactionSheet
        ref={sheetRef}
        onClose={() => sheetRef.current?.close()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingTop: 120,
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  balanceCard: {
    gap: Spacing.md,
  },
  balanceLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: -1.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    gap: 4,
  },
  statAmt: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.separator,
    marginHorizontal: Spacing.base,
  },
  historyLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: Spacing.sm,
  },
  txCard: {
    padding: 0,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txIconText: {
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  txInfo: {
    flex: 1,
  },
  txCategory: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
  },
  txNote: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  txAmount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  txDelete: {
    padding: Spacing.xs,
  },
  empty: {
    textAlign: 'center',
    color: Colors.textSecondary,
    padding: Spacing.xl,
  },
});
