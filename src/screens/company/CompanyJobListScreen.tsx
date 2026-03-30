import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';
import { Tables } from '../../types/database';
import { CompanyJobsStackParamList } from '../../navigation/CompanyTabs';

type Job = Tables<'job_requests'>;
type Nav = NativeStackNavigationProp<CompanyJobsStackParamList, 'CompanyJobList'>;

const FILTERS = ['all', 'open', 'draft', 'in_progress', 'closed'] as const;
type FilterType = (typeof FILTERS)[number];

export function CompanyJobListScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<CompanyJobsStackParamList, 'CompanyJobList'>>();
  const { company } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const incomingFilter = route.params?.initialFilter as FilterType | undefined;
  const [filter, setFilter] = useState<FilterType>(
    incomingFilter && FILTERS.includes(incomingFilter) ? incomingFilter : 'all'
  );

  useEffect(() => {
    if (incomingFilter && FILTERS.includes(incomingFilter as FilterType)) {
      setFilter(incomingFilter as FilterType);
    }
  }, [incomingFilter]);

  const fetchJobs = useCallback(async () => {
    if (!company) return;
    let query = supabase
      .from('job_requests')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching jobs:', error);
    } else {
      setJobs(data ?? []);
    }
  }, [company, filter]);

  useEffect(() => {
    setLoading(true);
    fetchJobs().finally(() => setLoading(false));
  }, [fetchJobs]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchJobs();
    });
    return unsubscribe;
  }, [navigation, fetchJobs]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>My Jobs</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateJob', {})}
            style={styles.addButton}
          >
            <Ionicons name="add" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, filter === item && styles.filterChipActive]}
              onPress={() => setFilter(item)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item && styles.filterTextActive,
                ]}
              >
                {item === 'all' ? 'All' : item.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterRow}
        />
      </View>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <JobListItem
            job={item}
            onPress={() =>
              navigation.navigate('Applicants', {
                jobId: item.id,
                jobTitle: item.title,
              })
            }
            onEdit={() =>
              navigation.navigate('CreateJob', { jobId: item.id })
            }
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="briefcase-outline"
            title="No jobs found"
            message="Tap + to create your first job"
          />
        }
      />
    </View>
  );
}

function JobListItem({
  job,
  onPress,
  onEdit,
}: {
  job: Job;
  onPress: () => void;
  onEdit: () => void;
}) {
  const canEdit = job.status === 'open' || job.status === 'draft';
  const statusStyle = getStatusStyle(job.status);

  const wageText =
    job.daily_wage_min && job.daily_wage_max
      ? `₹${job.daily_wage_min}–₹${job.daily_wage_max}/day`
      : job.daily_wage_min
        ? `From ₹${job.daily_wage_min}/day`
        : null;

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <Card style={styles.jobCard}>
        <View style={styles.jobHeader}>
          <View style={styles.jobTitleBlock}>
            <Text style={styles.jobTitle} numberOfLines={1}>
              {job.title}
            </Text>
            {job.description && (
              <Text style={styles.jobDesc} numberOfLines={2}>
                {job.description}
              </Text>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {job.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        <View style={styles.jobDetails}>
          {(job.city || job.state) && (
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={13} color={colors.textTertiary} />
              <Text style={styles.detailText}>
                {[job.city, job.state].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}
          {wageText && (
            <View style={styles.detailItem}>
              <Ionicons name="cash-outline" size={13} color={colors.textTertiary} />
              <Text style={styles.detailText}>{wageText}</Text>
            </View>
          )}
          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={13} color={colors.textTertiary} />
            <Text style={styles.detailText}>
              {job.workers_needed} needed
            </Text>
          </View>
        </View>

        <View style={styles.jobFooter}>
          <View style={styles.tagsRow}>
            {job.is_urgent && (
              <View style={styles.urgentTag}>
                <Text style={styles.urgentTagText}>Urgent</Text>
              </View>
            )}
            {job.accommodation_provided && (
              <View style={styles.benefitTag}>
                <Text style={styles.benefitTagText}>Accommodation</Text>
              </View>
            )}
            {job.transport_provided && (
              <View style={styles.benefitTag}>
                <Text style={styles.benefitTagText}>Transport</Text>
              </View>
            )}
            {job.meals_provided && (
              <View style={styles.benefitTag}>
                <Text style={styles.benefitTagText}>Meals</Text>
              </View>
            )}
          </View>
          {canEdit && (
            <TouchableOpacity
              style={styles.editBtn}
              onPress={(e) => {
                e.stopPropagation?.();
                onEdit();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="create-outline" size={15} color={colors.primary} />
              <Text style={styles.editBtnText}>Edit</Text>
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
  header: {
    paddingTop: spacing['5xl'],
    backgroundColor: colors.white,
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  filterTextActive: {
    color: colors.white,
    fontWeight: fontWeight.medium,
  },
  list: {
    padding: spacing.lg,
    flexGrow: 1,
  },

  // Job card
  jobCard: {
    marginBottom: spacing.md,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  jobTitleBlock: {
    flex: 1,
    marginRight: spacing.sm,
  },
  jobTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  jobDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
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
  jobDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    flex: 1,
  },
  urgentTag: {
    backgroundColor: colors.dangerLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  urgentTagText: {
    fontSize: 10,
    fontWeight: fontWeight.semibold,
    color: colors.danger,
  },
  benefitTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  benefitTagText: {
    fontSize: 10,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryLight,
    marginLeft: spacing.sm,
  },
  editBtnText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
});
