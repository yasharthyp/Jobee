import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../hooks/useLocation';
import { JobCard } from '../../components/JobCard';
import { SearchBar } from '../../components/SearchBar';
import {
  LocationFilterModal,
  LocationFilter,
} from '../../components/LocationFilterModal';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
  borderRadius,
} from '../../theme';
import { Tables } from '../../types/database';
import { WorkerHomeStackParamList } from '../../navigation/WorkerTabs';

type Job = Tables<'job_requests'> & { companies: { company_name: string } | null };
type Nav = NativeStackNavigationProp<WorkerHomeStackParamList, 'WorkerHome'>;

export function WorkerHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { profile } = useAuth();
  const { userCity, userState, requestLocation } = useLocation();

  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState<LocationFilter | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onSearchChange = useCallback((text: string) => {
    setSearchText(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(text), 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const fetchJobs = useCallback(async () => {
    const { data, error } = await supabase
      .from('job_requests')
      .select('*, companies(company_name)')
      .in('status', ['open', 'in_progress'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
    } else {
      setAllJobs((data as Job[]) ?? []);
    }
  }, []);

  useEffect(() => {
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

  const filteredJobs = useMemo(() => {
    let result = allJobs;

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          (j.description ?? '').toLowerCase().includes(q) ||
          (j.city ?? '').toLowerCase().includes(q) ||
          (j.state ?? '').toLowerCase().includes(q) ||
          (j.companies?.company_name ?? '').toLowerCase().includes(q)
      );
    }

    if (locationFilter) {
      result = result.filter((j) => {
        if (locationFilter.city && locationFilter.state) {
          return (
            j.city?.toLowerCase() === locationFilter.city.toLowerCase() &&
            j.state?.toLowerCase() === locationFilter.state.toLowerCase()
          );
        }
        if (locationFilter.state) {
          return j.state?.toLowerCase() === locationFilter.state.toLowerCase();
        }
        if (locationFilter.city) {
          return j.city?.toLowerCase() === locationFilter.city.toLowerCase();
        }
        return true;
      });
    }

    const matchCity = userCity?.toLowerCase() ?? null;
    const matchState = userState?.toLowerCase() ?? null;

    result = [...result].sort((a, b) => {
      const aLocal = isLocationMatch(a, matchCity, matchState);
      const bLocal = isLocationMatch(b, matchCity, matchState);
      if (aLocal && !bLocal) return -1;
      if (!aLocal && bLocal) return 1;

      if (a.is_urgent && !b.is_urgent) return -1;
      if (!a.is_urgent && b.is_urgent) return 1;

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [allJobs, debouncedSearch, locationFilter, userCity, userState]);

  const handleUseMyLocation = () => {
    if (userCity || userState) {
      setLocationFilter({
        city: userCity ?? undefined,
        state: userState ?? undefined,
      });
    } else {
      requestLocation();
    }
  };

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';

  if (loading) return <LoadingScreen />;

  const nearbyCount =
    !locationFilter && (userCity || userState)
      ? allJobs.filter((j) =>
          isLocationMatch(
            j,
            userCity?.toLowerCase() ?? null,
            userState?.toLowerCase() ?? null
          )
        ).length
      : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>J</Text>
          </View>
          <View style={styles.greetingBlock}>
            <Text style={styles.greeting}>Hello, {firstName}</Text>
            <Text style={styles.subtitle}>Find your next opportunity</Text>
          </View>
        </View>
      </View>

      {/* Search + Filter */}
      <SearchBar
        value={searchText}
        onChangeText={onSearchChange}
        onFilterPress={() => setFilterModalVisible(true)}
        filterActive={!!locationFilter}
      />

      {/* Active filter chip */}
      {locationFilter && (
        <View style={styles.activeFilterRow}>
          <View style={styles.activeChip}>
            <Ionicons name="location" size={13} color={colors.primary} />
            <Text style={styles.activeChipText}>
              {[locationFilter.city, locationFilter.state].filter(Boolean).join(', ')}
            </Text>
          </View>
        </View>
      )}

      {/* Nearby hint */}
      {!locationFilter && nearbyCount > 0 && (
        <View style={styles.hintRow}>
          <Ionicons name="navigate-outline" size={14} color={colors.primary} />
          <Text style={styles.hintText}>
            {nearbyCount} job{nearbyCount !== 1 ? 's' : ''} near you shown first
          </Text>
        </View>
      )}

      {/* Job list */}
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <JobCard
            job={item}
            onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
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
            title={debouncedSearch || locationFilter ? 'No matching jobs' : 'No jobs available'}
            message={
              debouncedSearch || locationFilter
                ? 'Try adjusting your search or filters'
                : 'Pull to refresh or check back later'
            }
          />
        }
      />

      {/* Location filter modal */}
      <LocationFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onSelect={setLocationFilter}
        onClear={() => setLocationFilter(null)}
        onUseMyLocation={handleUseMyLocation}
        currentFilter={locationFilter}
        detectedCity={userCity}
        detectedState={userState}
      />
    </View>
  );
}

function isLocationMatch(
  job: Job,
  city: string | null,
  state: string | null
): boolean {
  if (!city && !state) return false;
  const jobCity = job.city?.toLowerCase() ?? '';
  const jobState = job.state?.toLowerCase() ?? '';
  if (city && jobCity === city) return true;
  if (state && jobState === state) return true;
  return false;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  subtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },

  // Active filter
  activeFilterRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xl,
  },
  activeChipText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },

  // Hint
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  hintText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },

  // List
  list: {
    padding: spacing.lg,
    flexGrow: 1,
  },
});
