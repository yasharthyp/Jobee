import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';
import { Tables } from '../../types/database';
import { WorkerJobsStackParamList } from '../../navigation/WorkerTabs';

type Assignment = Tables<'job_assignments'> & {
  job_requests: { title: string; city: string | null; status: string } | null;
};
type Nav = NativeStackNavigationProp<WorkerJobsStackParamList, 'MyJobs'>;

function getStatusStyle(status: string) {
  switch (status) {
    case 'accepted':
    case 'active':
      return { bg: colors.successLight, text: colors.success };
    case 'pending':
      return { bg: colors.warningLight, text: colors.warning };
    case 'completed':
      return { bg: colors.primaryLight, text: colors.primary };
    case 'rejected':
    case 'terminated':
    case 'no_show':
      return { bg: colors.dangerLight, text: colors.danger };
    default:
      return { bg: colors.borderLight, text: colors.textSecondary };
  }
}

export function MyJobsScreen() {
  const navigation = useNavigation<Nav>();
  const { worker } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAssignments = useCallback(async () => {
    if (!worker) return;
    const { data, error } = await supabase
      .from('job_assignments')
      .select('*, job_requests(title, city, status)')
      .eq('worker_id', worker.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assignments:', error);
    } else {
      setAssignments((data as Assignment[]) ?? []);
    }
  }, [worker]);

  useEffect(() => {
    fetchAssignments().finally(() => setLoading(false));
  }, [fetchAssignments]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAssignments();
    setRefreshing(false);
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Jobs</Text>
        <Text style={styles.subtitle}>
          {assignments.length} application{assignments.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={assignments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const statusStyle = getStatusStyle(item.status);
          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('JobDetail', { jobId: item.job_request_id })
              }
            >
              <Card style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.jobTitle} numberOfLines={1}>
                    {item.job_requests?.title ?? 'Untitled Job'}
                  </Text>
                  <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                      {item.status.replace('_', ' ')}
                    </Text>
                  </View>
                </View>
                {item.job_requests?.city && (
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color={colors.textTertiary} />
                    <Text style={styles.locationText}>{item.job_requests.city}</Text>
                  </View>
                )}
                {item.daily_wage_agreed && (
                  <Text style={styles.wage}>₹{item.daily_wage_agreed}/day agreed</Text>
                )}
              </Card>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="document-text-outline"
            title="No applications yet"
            message="Browse jobs and apply to get started"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['5xl'],
    paddingBottom: spacing.lg,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  list: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'capitalize',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  locationText: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },
  wage: {
    fontSize: fontSize.sm,
    color: colors.success,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xs,
  },
});
