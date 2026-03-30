import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
  borderRadius,
  shadow,
} from '../../theme';
import { Tables } from '../../types/database';

type Job = Tables<'job_requests'>;

interface DashboardStats {
  totalJobs: number;
  openJobs: number;
  draftJobs: number;
  totalAssignments: number;
}

export function CompanyDashboardScreen() {
  const navigation = useNavigation<any>();
  const { profile, company } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    openJobs: 0,
    draftJobs: 0,
    totalAssignments: 0,
  });
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!company) return;

    const [jobsRes, openRes, draftRes, assignRes, recentRes] = await Promise.all([
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
        .from('job_requests')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', company.id)
        .eq('status', 'draft'),
      supabase
        .from('job_assignments')
        .select('id, job_requests!inner(company_id)', {
          count: 'exact',
          head: true,
        })
        .eq('job_requests.company_id', company.id),
      supabase
        .from('job_requests')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
        .limit(3),
    ]);

    setStats({
      totalJobs: jobsRes.count ?? 0,
      openJobs: openRes.count ?? 0,
      draftJobs: draftRes.count ?? 0,
      totalAssignments: assignRes.count ?? 0,
    });
    setRecentJobs(recentRes.data ?? []);
  }, [company]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return unsubscribe;
  }, [navigation, fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const navigateToFilteredList = (filter: string) => {
    navigation.navigate('Jobs', {
      screen: 'CompanyJobList',
      params: { initialFilter: filter },
    });
  };

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>J</Text>
          </View>
          <View style={styles.greetingBlock}>
            <Text style={styles.greeting}>Hello, {firstName}</Text>
            <Text style={styles.companyName}>
              {company?.company_name ?? 'Company'}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <TouchableOpacity
          style={styles.statCardWrap}
          activeOpacity={0.7}
          onPress={() => navigateToFilteredList('all')}
        >
          <View style={[styles.statCard, { borderLeftColor: colors.primary }]}>
            <View style={[styles.statIconWrap, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="briefcase" size={20} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{stats.totalJobs}</Text>
            <Text style={styles.statLabel}>Total Jobs</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCardWrap}
          activeOpacity={0.7}
          onPress={() => navigateToFilteredList('open')}
        >
          <View style={[styles.statCard, { borderLeftColor: colors.success }]}>
            <View style={[styles.statIconWrap, { backgroundColor: colors.successLight }]}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            </View>
            <Text style={styles.statValue}>{stats.openJobs}</Text>
            <Text style={styles.statLabel}>Open</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCardWrap}
          activeOpacity={0.7}
          onPress={() => navigateToFilteredList('draft')}
        >
          <View style={[styles.statCard, { borderLeftColor: colors.warning }]}>
            <View style={[styles.statIconWrap, { backgroundColor: colors.warningLight }]}>
              <Ionicons name="document-text" size={20} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>{stats.draftJobs}</Text>
            <Text style={styles.statLabel}>Drafts</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCardWrap}
          activeOpacity={0.7}
          onPress={() => navigateToFilteredList('all')}
        >
          <View style={[styles.statCard, { borderLeftColor: '#8B5CF6' }]}>
            <View style={[styles.statIconWrap, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="people" size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.statValue}>{stats.totalAssignments}</Text>
            <Text style={styles.statLabel}>Applicants</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Quick Action */}
      <View style={styles.quickActionRow}>
        <Button
          title="Post a New Job"
          onPress={() =>
            navigation.navigate('Jobs', { screen: 'CreateJob', params: {} })
          }
          style={styles.postButton}
        />
      </View>

      {/* Recent Jobs */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Jobs</Text>
          <TouchableOpacity
            onPress={() => navigateToFilteredList('all')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentJobs.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons
              name="document-outline"
              size={32}
              color={colors.textTertiary}
            />
            <Text style={styles.emptyText}>No jobs posted yet</Text>
          </Card>
        ) : (
          recentJobs.map((job) => (
            <RecentJobCard
              key={job.id}
              job={job}
              onPress={() =>
                navigation.navigate('Jobs', {
                  screen: 'Applicants',
                  params: { jobId: job.id, jobTitle: job.title },
                })
              }
              onEdit={() =>
                navigation.navigate('Jobs', {
                  screen: 'CreateJob',
                  params: { jobId: job.id },
                })
              }
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

function RecentJobCard({
  job,
  onPress,
  onEdit,
}: {
  job: Job;
  onPress: () => void;
  onEdit: () => void;
}) {
  const statusStyle = getStatusStyle(job.status);
  const canEdit = job.status === 'open' || job.status === 'draft';

  const wageText =
    job.daily_wage_min && job.daily_wage_max
      ? `₹${job.daily_wage_min}–₹${job.daily_wage_max}/day`
      : job.daily_wage_min
        ? `From ₹${job.daily_wage_min}/day`
        : null;

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <Card style={styles.recentCard}>
        <View style={styles.recentHeader}>
          <View style={styles.recentTitleBlock}>
            <Text style={styles.recentTitle} numberOfLines={1}>
              {job.title}
            </Text>
            <View style={styles.recentMeta}>
              {(job.city || job.state) && (
                <View style={styles.metaItem}>
                  <Ionicons
                    name="location-outline"
                    size={12}
                    color={colors.textTertiary}
                  />
                  <Text style={styles.metaText}>
                    {[job.city, job.state].filter(Boolean).join(', ')}
                  </Text>
                </View>
              )}
              {wageText && (
                <View style={styles.metaItem}>
                  <Ionicons
                    name="cash-outline"
                    size={12}
                    color={colors.textTertiary}
                  />
                  <Text style={styles.metaText}>{wageText}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {job.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        <View style={styles.recentFooter}>
          <View style={styles.recentStats}>
            <View style={styles.miniStat}>
              <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.miniStatText}>
                {job.workers_needed} needed
              </Text>
            </View>
            {job.is_urgent && (
              <View style={[styles.miniTag, { backgroundColor: colors.dangerLight }]}>
                <Text style={[styles.miniTagText, { color: colors.danger }]}>
                  Urgent
                </Text>
              </View>
            )}
          </View>
          {canEdit && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={(e) => {
                e.stopPropagation?.();
                onEdit();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="create-outline" size={16} color={colors.primary} />
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'open':
      return { bg: colors.successLight, text: colors.success };
    case 'in_progress':
      return { bg: colors.warningLight, text: colors.warning };
    case 'draft':
      return { bg: colors.borderLight, text: colors.textSecondary };
    case 'closed':
    case 'cancelled':
      return { bg: colors.dangerLight, text: colors.danger };
    default:
      return { bg: colors.primaryLight, text: colors.primary };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing['3xl'],
  },

  // Header
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['5xl'] + spacing.sm,
    paddingBottom: spacing['2xl'],
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  logoText: {
    fontSize: 22,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  greetingBlock: {
    flex: 1,
  },
  greeting: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  companyName: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.lg,
    gap: spacing.md,
  },
  statCardWrap: {
    width: '47%',
    flexGrow: 1,
  },
  statCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderLeftWidth: 3,
    ...shadow.md,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Quick Action
  quickActionRow: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  postButton: {
    borderRadius: borderRadius.md,
  },

  // Section
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  viewAll: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },

  // Empty
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },

  // Recent Job Card
  recentCard: {
    marginBottom: spacing.md,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recentTitleBlock: {
    flex: 1,
    marginRight: spacing.sm,
  },
  recentTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  recentMeta: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
    textTransform: 'capitalize',
  },
  recentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
  },
  recentStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  miniStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  miniStatText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  miniTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
  },
  miniTagText: {
    fontSize: 10,
    fontWeight: fontWeight.semibold,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryLight,
  },
  editText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
});
