import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors, fontSize, fontWeight, spacing } from '../../theme';

export function CompanyProfileScreen() {
  const { profile, company, signOut } = useAuth();

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
          <Ionicons name="business" size={40} color={colors.white} />
        </View>
        <Text style={styles.name}>
          {company?.company_name ?? profile?.full_name ?? 'Company'}
        </Text>
        {company?.industry && (
          <Text style={styles.industry}>{company.industry}</Text>
        )}
        <Text style={styles.email}>{profile?.email ?? ''}</Text>
      </View>

      {company?.description && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.descriptionText}>{company.description}</Text>
        </Card>
      )}

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Company Details</Text>
        <ProfileRow label="City" value={company?.city ?? '-'} />
        <ProfileRow label="State" value={company?.state ?? '-'} />
        <ProfileRow label="Size" value={company?.company_size ?? '-'} />
        <ProfileRow label="Registration" value={company?.registration_number ?? '-'} />
        <ProfileRow label="Website" value={company?.website ?? '-'} />
        {company?.established_year && (
          <ProfileRow label="Established" value={String(company.established_year)} />
        )}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <ProfileRow label="Name" value={profile?.full_name ?? '-'} />
        <ProfileRow label="Email" value={profile?.email ?? '-'} />
        <ProfileRow label="Phone" value={profile?.phone ?? '-'} />
      </Card>

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
  industry: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  email: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.xs,
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
  descriptionText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
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
    maxWidth: '60%',
    textAlign: 'right',
  },
  signOutButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing['2xl'],
  },
});
