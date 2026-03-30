import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';
import { Tables } from '../../types/database';
import { WorkerHomeStackParamList } from '../../navigation/WorkerTabs';

type Job = Tables<'job_requests'> & {
  companies: { company_name: string } | null;
};
type Skill = { skill_id: string; is_mandatory: boolean; skills: { name: string; category: string } | null };

export function JobDetailScreen() {
  const route = useRoute<RouteProp<WorkerHomeStackParamList, 'JobDetail'>>();
  const navigation = useNavigation();
  const { worker } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const [jobRes, skillsRes] = await Promise.all([
        supabase
          .from('job_requests')
          .select('*, companies(company_name)')
          .eq('id', route.params.jobId)
          .single(),
        supabase
          .from('job_required_skills')
          .select('skill_id, is_mandatory, skills(name, category)')
          .eq('job_request_id', route.params.jobId),
      ]);

      if (jobRes.data) setJob(jobRes.data as Job);
      if (skillsRes.data) setSkills(skillsRes.data as Skill[]);

      if (worker) {
        const { data: existing } = await supabase
          .from('job_assignments')
          .select('id')
          .eq('job_request_id', route.params.jobId)
          .eq('worker_id', worker.id)
          .limit(1);
        if (existing && existing.length > 0) setHasApplied(true);
      }

      setLoading(false);
    };
    fetch();
  }, [route.params.jobId, worker]);

  const handleApply = async () => {
    if (!worker || !job) return;
    setApplying(true);
    try {
      const { error } = await supabase.from('job_assignments').insert({
        job_request_id: job.id,
        worker_id: worker.id,
      });
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setHasApplied(true);
        Alert.alert('Success', 'Application submitted!');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!job) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Job not found</Text>
      </View>
    );
  }

  const wageText =
    job.daily_wage_min && job.daily_wage_max
      ? `₹${job.daily_wage_min} - ₹${job.daily_wage_max}/day`
      : job.daily_wage_min
        ? `From ₹${job.daily_wage_min}/day`
        : 'Not specified';

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Job Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{job.title}</Text>
        {job.companies?.company_name && (
          <Text style={styles.company}>{job.companies.company_name}</Text>
        )}

        {job.is_urgent && (
          <View style={styles.urgentBanner}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <Text style={styles.urgentBannerText}>Urgent Hiring</Text>
          </View>
        )}

        {job.description && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.body}>{job.description}</Text>
          </Card>
        )}

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <DetailRow icon="cash-outline" label="Wage" value={wageText} />
          <DetailRow
            icon="location-outline"
            label="Location"
            value={[job.city, job.state].filter(Boolean).join(', ') || 'Not specified'}
          />
          <DetailRow
            icon="people-outline"
            label="Employees Needed"
            value={String(job.workers_needed)}
          />
          {job.minimum_experience_years != null && job.minimum_experience_years > 0 && (
            <DetailRow
              icon="time-outline"
              label="Min. Experience"
              value={`${job.minimum_experience_years} year(s)`}
            />
          )}
          {job.start_date && (
            <DetailRow icon="calendar-outline" label="Start Date" value={job.start_date} />
          )}
        </Card>

        {(job.accommodation_provided || job.transport_provided || job.meals_provided) && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Benefits</Text>
            <View style={styles.benefitsRow}>
              {job.accommodation_provided && <BenefitChip label="Accommodation" icon="home-outline" />}
              {job.transport_provided && <BenefitChip label="Transport" icon="bus-outline" />}
              {job.meals_provided && <BenefitChip label="Meals" icon="restaurant-outline" />}
            </View>
          </Card>
        )}

        {skills.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Required Skills</Text>
            <View style={styles.skillsRow}>
              {skills.map((s) => (
                <View
                  key={s.skill_id}
                  style={[styles.skillChip, s.is_mandatory && styles.mandatoryChip]}
                >
                  <Text
                    style={[styles.skillText, s.is_mandatory && styles.mandatoryText]}
                  >
                    {s.skills?.name ?? 'Unknown'}
                    {s.is_mandatory ? ' *' : ''}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={hasApplied ? 'Already Applied' : 'Apply Now'}
          onPress={handleApply}
          loading={applying}
          disabled={hasApplied || job.status !== 'open'}
        />
      </View>
    </View>
  );
}

function DetailRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLeft}>
        <Ionicons name={icon} size={18} color={colors.textSecondary} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function BenefitChip({ label, icon }: { label: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.benefitChip}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={styles.benefitText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['5xl'],
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
  },
  topBarTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  company: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  urgentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.dangerLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.md,
  },
  urgentBannerText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.danger,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  body: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  benefitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  benefitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
  },
  benefitText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  skillChip: {
    backgroundColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xl,
  },
  mandatoryChip: {
    backgroundColor: colors.warningLight,
  },
  skillText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  mandatoryText: {
    color: colors.warning,
    fontWeight: fontWeight.medium,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
