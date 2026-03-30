import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';

interface DashboardStats {
  totalJobs: number;
  openJobs: number;
  totalAssignments: number;
}

export function CompanyDashboardScreen() {
  const navigation = useNavigation<any>();
  const { profile, company } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    openJobs: 0,
    totalAssignments: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!company) return;

    const [jobsRes, openRes, assignRes] = await Promise.all([
      supabase
        .from('job_requests')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', company.id),
      supabase
        .from('job_requests')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', company.id)
        .eq('status', 'open'),
      supabase
        .from('job_assignments')
        .select('id, job_requests!inner(company_id)', { count: 'exact', head: true })
        .eq('job_requests.company_id', company.id),
    ]);

    setStats({
      totalJobs: jobsRes.count ?? 0,
      openJobs: openRes.count ?? 0,
      totalAssignments: assignRes.count ?? 0,
    });
  }, [company]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {company?.company_name ?? profile?.full_name ?? 'Company'}
        </Text>
        <Text style={styles.subtitle}>Dashboard</Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard
          icon="briefcase-outline"
          label="Total Jobs"
          value={stats.totalJobs}
          color={colors.primary}
        />
        <StatCard
          icon="checkmark-circle-outline"
          label="Open"
          value={stats.openJobs}
          color={colors.success}
        />
        <StatCard
          icon="people-outline"
          label="Applications"
          value={stats.totalAssignments}
          color={colors.warning}
        />
      </View>

      <Card style={styles.actionsCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Button
          title="Post a New Job"
          onPress={() => navigation.navigate('Jobs', { screen: 'CreateJob' })}
          style={styles.actionButton}
        />
        <Button
          title="View All Jobs"
          variant="outline"
          onPress={() => navigation.navigate('Jobs', { screen: 'CompanyJobList' })}
          style={styles.actionButton}
        />
      </Card>
    </ScrollView>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card style={styles.statCard}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing['3xl'],
  },
  header: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['5xl'],
    paddingBottom: spacing.lg,
    backgroundColor: colors.white,
  },
  greeting: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  actionsCard: {
    marginHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  actionButton: {
    marginBottom: spacing.md,
  },
});
