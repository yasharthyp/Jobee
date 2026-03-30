import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
  borderRadius,
  shadow,
} from '../theme';

export interface LocationFilter {
  city?: string;
  state?: string;
}

interface LocationEntry {
  city: string | null;
  state: string | null;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (filter: LocationFilter) => void;
  onClear: () => void;
  onUseMyLocation: () => void;
  currentFilter: LocationFilter | null;
  detectedCity: string | null;
  detectedState: string | null;
}

export function LocationFilterModal({
  visible,
  onClose,
  onSelect,
  onClear,
  onUseMyLocation,
  currentFilter,
  detectedCity,
  detectedState,
}: Props) {
  const [locations, setLocations] = useState<LocationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!visible) return;
    setSearch('');
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('job_requests')
        .select('city, state')
        .in('status', ['open', 'in_progress']);

      if (error) {
        console.error('Error fetching locations:', error);
        setLoading(false);
        return;
      }

      const seen = new Set<string>();
      const unique: LocationEntry[] = [];
      for (const row of data ?? []) {
        if (!row.city && !row.state) continue;
        const key = `${row.city ?? ''}|${row.state ?? ''}`;
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(row);
      }
      unique.sort((a, b) => {
        const sa = a.state ?? '';
        const sb = b.state ?? '';
        if (sa !== sb) return sa.localeCompare(sb);
        return (a.city ?? '').localeCompare(b.city ?? '');
      });
      setLocations(unique);
      setLoading(false);
    })();
  }, [visible]);

  const filtered = useMemo(() => {
    if (!search.trim()) return locations;
    const q = search.toLowerCase();
    return locations.filter(
      (l) =>
        (l.city ?? '').toLowerCase().includes(q) ||
        (l.state ?? '').toLowerCase().includes(q)
    );
  }, [locations, search]);

  const isSelected = (loc: LocationEntry) =>
    currentFilter?.city === loc.city && currentFilter?.state === (loc.state ?? undefined);

  const detectedLabel =
    detectedCity && detectedState
      ? `${detectedCity}, ${detectedState}`
      : detectedCity ?? detectedState ?? null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Filter by Location</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* My Location */}
        {detectedLabel && (
          <TouchableOpacity
            style={styles.myLocationBtn}
            onPress={() => {
              onUseMyLocation();
              onClose();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.myLocationIcon}>
              <Ionicons name="navigate" size={18} color={colors.primary} />
            </View>
            <View style={styles.myLocationText}>
              <Text style={styles.myLocationLabel}>Use My Location</Text>
              <Text style={styles.myLocationValue}>{detectedLabel}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        )}

        {/* Search */}
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={16} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search city or state..."
            placeholderTextColor={colors.textTertiary}
            autoCorrect={false}
          />
        </View>

        {/* Clear */}
        {currentFilter && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => {
              onClear();
              onClose();
            }}
          >
            <Ionicons name="close-circle-outline" size={16} color={colors.danger} />
            <Text style={styles.clearText}>Clear Filter</Text>
          </TouchableOpacity>
        )}

        {/* List */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loader}
          />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item, i) => `${item.state}-${item.city}-${i}`}
            renderItem={({ item }) => {
              const selected = isSelected(item);
              const label = [item.city, item.state].filter(Boolean).join(', ');
              return (
                <TouchableOpacity
                  style={[styles.locationItem, selected && styles.locationItemActive]}
                  onPress={() => {
                    onSelect({
                      city: item.city ?? undefined,
                      state: item.state ?? undefined,
                    });
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="location-outline"
                    size={18}
                    color={selected ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.locationText,
                      selected && styles.locationTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                  {selected && (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No locations found</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },

  myLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow.sm,
  },
  myLocationIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  myLocationText: {
    flex: 1,
  },
  myLocationLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  myLocationValue: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 42,
    gap: spacing.sm,
    ...shadow.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    paddingVertical: 0,
  },

  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  clearText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.danger,
  },

  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  locationItemActive: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  locationText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  locationTextActive: {
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },

  loader: {
    marginTop: spacing['3xl'],
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },
});
