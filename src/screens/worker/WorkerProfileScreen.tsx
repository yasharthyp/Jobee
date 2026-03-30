import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';

export function WorkerProfileScreen() {
  const { profile, worker, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={colors.white} />
        </View>
        <Text style={styles.name}>{profile?.full_name ?? 'Employee'}</Text>
        <Text style={styles.email}>{profile?.email ?? ''}</Text>
        {worker?.availability && (
          <View style={styles.availabilityBadge}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor:
                    worker.availability === 'available' ? colors.success : colors.warning,
                },
              ]}
            />
            <Text style={styles.availabilityText}>
              {worker.availability.replace('_', ' ')}
            </Text>
          </View>
        )}
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Info</Text>
        <ProfileRow label="City" value={worker?.city ?? profile?.city ?? '-'} />
        <ProfileRow label="State" value={worker?.state ?? profile?.state ?? '-'} />
        <ProfileRow label="Gender" value={worker?.gender?.replace('_', ' ') ?? '-'} />
        <ProfileRow label="Phone" value={profile?.phone ?? '-'} />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Work Info</Text>
        <ProfileRow
          label="Experience"
          value={
            worker?.experience_years != null
              ? `${worker.experience_years} year(s)`
              : '-'
          }
        />
        <ProfileRow
          label="Daily Wage"
          value={
            worker?.expected_daily_wage != null
              ? `₹${worker.expected_daily_wage}`
              : '-'
          }
        />
        <ProfileRow
          label="Willing to Relocate"
          value={worker?.willing_to_relocate ? 'Yes' : 'No'}
        />
        <ProfileRow
          label="Max Travel"
          value={
            worker?.max_travel_distance_km != null
              ? `${worker.max_travel_distance_km} km`
              : '-'
          }
        />
      </Card>

      {worker?.bio && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <Text style={styles.bioText}>{worker.bio}</Text>
        </Card>
      )}

      <Button
        title="Sign Out"
        variant="outline"
        onPress={handleSignOut}
        style={styles.signOutButton}
      />
    </ScrollView>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
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
    alignItems: 'center',
    paddingTop: spacing['5xl'],
    paddingBottom: spacing['2xl'],
    backgroundColor: colors.white,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  email: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    backgroundColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  section: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  rowLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  rowValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  bioText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  signOutButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing['2xl'],
  },
});
