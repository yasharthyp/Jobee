import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../theme';
import { Tables } from '../types/database';

type JobRequest = Tables<'job_requests'>;

interface JobCardProps {
  job: JobRequest & { companies?: { company_name: string } | null };
  onPress?: () => void;
}

export function JobCard({ job, onPress }: JobCardProps) {
  const wageText =
    job.daily_wage_min && job.daily_wage_max
      ? `₹${job.daily_wage_min} - ₹${job.daily_wage_max}/day`
      : job.daily_wage_min
        ? `From ₹${job.daily_wage_min}/day`
        : null;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {job.title}
            </Text>
            {job.is_urgent && (
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentText}>Urgent</Text>
              </View>
            )}
          </View>
          {job.companies?.company_name && (
            <Text style={styles.company}>{job.companies.company_name}</Text>
          )}
        </View>

        {job.description && (
          <Text style={styles.description} numberOfLines={2}>
            {job.description}
          </Text>
        )}

        <View style={styles.details}>
          {(job.city || job.state) && (
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.detailText}>
                {[job.city, job.state].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}
          {wageText && (
            <View style={styles.detailItem}>
              <Ionicons name="cash-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.detailText}>{wageText}</Text>
            </View>
          )}
          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              {job.workers_needed} employee{job.workers_needed > 1 ? 's' : ''} needed
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.benefitsRow}>
            {job.accommodation_provided && (
              <View style={styles.benefitChip}>
                <Text style={styles.benefitText}>Accommodation</Text>
              </View>
            )}
            {job.transport_provided && (
              <View style={styles.benefitChip}>
                <Text style={styles.benefitText}>Transport</Text>
              </View>
            )}
            {job.meals_provided && (
              <View style={styles.benefitChip}>
                <Text style={styles.benefitText}>Meals</Text>
              </View>
            )}
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(job.status).bg },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(job.status).text },
              ]}
            >
              {job.status.replace('_', ' ')}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

function getStatusColor(status: string) {
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
  card: {
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    flex: 1,
  },
  urgentBadge: {
    backgroundColor: colors.dangerLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  urgentText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.danger,
  },
  company: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  details: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  benefitsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flex: 1,
    flexWrap: 'wrap',
  },
  benefitChip: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  benefitText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: fontWeight.medium,
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
});
