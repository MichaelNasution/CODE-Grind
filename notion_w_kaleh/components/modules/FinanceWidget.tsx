import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useNKStore } from '../../store/useNKStore';
import { Card, CardTitle } from '../ui/Card';
import { Colors, Typography, Spacing } from '../../constants/theme';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function FinanceWidget() {
  const { totalBalance, transactions } = useNKStore();

  // Build last-7-day chart data from transactions
  const chartData = useMemo(() => {
    const days: Record<string, number> = {};
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      days[key] = 0;
    }

    let running = 0;
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Build cumulative balance per day
    const dailyBalances: Record<string, number> = {};
    for (const tx of sorted) {
      const key = new Date(tx.createdAt).toISOString().split('T')[0];
      if (key in days) {
        running += tx.type === 'income' ? tx.amount : -tx.amount;
        dailyBalances[key] = running;
      }
    }

    return Object.keys(days).map((key) => ({
      value: Math.max(0, dailyBalances[key] ?? 0),
      label: new Date(key).toLocaleDateString('en', { weekday: 'narrow' }),
    }));
  }, [transactions]);

  const isPositive = totalBalance >= 0;

  return (
    <Card glow={isPositive}>
      <CardTitle>Balance</CardTitle>
      <Text style={[styles.balance, { color: isPositive ? Colors.green : Colors.red }]}>
        {formatCurrency(totalBalance)}
      </Text>

      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Income</Text>
          <Text style={[styles.statValue, { color: Colors.green }]}>
            {formatCurrency(
              transactions
                .filter((t) => t.type === 'income')
                .reduce((s, t) => s + t.amount, 0)
            )}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Expense</Text>
          <Text style={[styles.statValue, { color: Colors.red }]}>
            {formatCurrency(
              transactions
                .filter((t) => t.type === 'expense')
                .reduce((s, t) => s + t.amount, 0)
            )}
          </Text>
        </View>
      </View>

      {chartData.some((d) => d.value > 0) && (
        <View style={styles.chart}>
          <LineChart
            data={chartData}
            height={80}
            width={300}
            thickness={2}
            color={Colors.gold}
            dataPointsColor={Colors.gold}
            dataPointsRadius={4}
            startFillColor={Colors.gold}
            endFillColor="transparent"
            startOpacity={0.25}
            endOpacity={0.0}
            areaChart
            hideRules
            hideYAxisText
            xAxisColor="transparent"
            yAxisColor="transparent"
            curved
            noOfSections={3}
            initialSpacing={10}
          />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  balance: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: -1,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.separator,
    marginHorizontal: Spacing.base,
  },
  chart: {
    marginTop: Spacing.sm,
    marginHorizontal: -Spacing.sm,
  },
});
