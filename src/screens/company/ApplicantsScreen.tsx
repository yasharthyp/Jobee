import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { Card } from '../../components/ui/Card';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';
import { Tables } from '../../types/database';
import { CompanyJobsStackParamList } from '../../navigation/CompanyTabs';

type Assignment = Tables<'job_assignments'> & {
  workers: {
    id: string;
    bio: string | null;
    experience_years: number | null;
    expected_daily_wage: number | null;
    profiles: { full_name: string; city: string | null } | null;
  } | null;
};

export function ApplicantsScreen() {
  const route = useRoute<RouteProp<CompanyJobsStackParamList, 'Applicants'>>();
  const navigation = useNavigation();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApplicants = useCallback(async () => {
    const { data, error } = await supabase
      .from('job_assignments')
      .select(
        '*, workers(id, bio, experience_years, expected_daily_wage, profiles(full_name, city))'
      )
      .eq('job_request_id', route.params.jobId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applicants:', error);
    } else {
      setAssignments((data as Assignment[]) ?? []);
    }
  }, [route.params.jobId]);

  useEffect(() => {
    fetchApplicants().finally(() => setLoading(false));
  }, [fetchApplicants]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchApplicants();
    setRefreshing(false);
  };

  const updateStatus = async (id: string, status: 'accepted' | 'rejected') => {
    const { error } = await supabase
      .from('job_assignments')
      .update({
        status,
        ...(status === 'accepted' ? { accepted_at: new Date().toISOString() } : {}),
      })
      .eq('id', id);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      await fetchApplicants();
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {route.params.jobTitle}
          </Text>
          <Text style={styles.topBarSubtitle}>
            {assignments.length} applicant{assignments.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={assignments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const worker = item.workers;
          const profile = worker?.profiles;
          return (
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatarSmall}>
                  <Ionicons name="person" size={20} color={colors.white} />
                </View>
                <View style={styles.nameBlock}>
                  <Text style={styles.name}>
                    {profile?.full_name ?? 'Unknown Worker'}
                  </Text>
                  {profile?.city && (
                    <Text style={styles.city}>{profile.city}</Text>
                  )}
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        item.status === 'accepted'
                          ? colors.successLight
                          : item.status === 'rejected'
                            ? colors.dangerLight
                            : colors.warningLight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          item.status === 'accepted'
                            ? colors.success
                            : item.status === 'rejected'
                              ? colors.danger
                              : colors.warning,
                      },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                {worker?.experience_years != null && (
                  <Text style={styles.infoText}>
                    {worker.experience_years} yr(s) exp
                  </Text>
                )}
                {worker?.expected_daily_wage != null && (
                  <Text style={styles.infoText}>
                    ₹{worker.expected_daily_wage}/day
                  </Text>
                )}
              </View>

              {item.status === 'pending' && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.acceptBtn]}
                    onPress={() => updateStatus(item.id, 'accepted')}
                  >
                    <Ionicons name="checkmark" size={18} color={colors.white} />
                    <Text style={styles.acceptText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => updateStatus(item.id, 'rejected')}
                  >
                    <Ionicons name="close" size={18} color={colors.danger} />
                    <Text style={styles.rejectText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          );
        }}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="No applicants yet"
            message="Applicants will appear here when workers apply"
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['5xl'],
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  topBarSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
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
    alignItems: 'center',
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  nameBlock: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  city: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'capitalize',
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  acceptBtn: {
    backgroundColor: colors.success,
  },
  rejectBtn: {
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  acceptText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  rejectText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.danger,
  },
});
