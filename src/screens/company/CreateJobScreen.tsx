import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { colors, fontSize, fontWeight, spacing } from '../../theme';
import { CompanyJobsStackParamList } from '../../navigation/CompanyTabs';

type RouteParams = RouteProp<CompanyJobsStackParamList, 'CreateJob'>;

const INITIAL_FORM = {
  title: '',
  description: '',
  city: '',
  state: '',
  workers_needed: '1',
  daily_wage_min: '',
  daily_wage_max: '',
  start_date: '',
  end_date: '',
  minimum_experience_years: '0',
  is_urgent: false,
  accommodation_provided: false,
  transport_provided: false,
  meals_provided: false,
};

export function CreateJobScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteParams>();
  const { company } = useAuth();

  const jobId = route.params?.jobId;
  const isEditMode = !!jobId;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [currentStatus, setCurrentStatus] = useState<string>('draft');
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (!jobId) return;
    (async () => {
      const { data, error } = await supabase
        .from('job_requests')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error || !data) {
        Alert.alert('Error', 'Could not load job details.');
        navigation.goBack();
        return;
      }

      setCurrentStatus(data.status);
      setForm({
        title: data.title ?? '',
        description: data.description ?? '',
        city: data.city ?? '',
        state: data.state ?? '',
        workers_needed: String(data.workers_needed ?? 1),
        daily_wage_min: data.daily_wage_min != null ? String(data.daily_wage_min) : '',
        daily_wage_max: data.daily_wage_max != null ? String(data.daily_wage_max) : '',
        start_date: data.start_date ?? '',
        end_date: data.end_date ?? '',
        minimum_experience_years: String(data.minimum_experience_years ?? 0),
        is_urgent: data.is_urgent,
        accommodation_provided: data.accommodation_provided,
        transport_provided: data.transport_provided,
        meals_provided: data.meals_provided,
      });
      setFetching(false);
    })();
  }, [jobId, navigation]);

  const updateField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    description: form.description.trim() || null,
    city: form.city.trim() || null,
    state: form.state.trim() || null,
    workers_needed: parseInt(form.workers_needed, 10) || 1,
    daily_wage_min: form.daily_wage_min ? parseFloat(form.daily_wage_min) : null,
    daily_wage_max: form.daily_wage_max ? parseFloat(form.daily_wage_max) : null,
    start_date: form.start_date || null,
    end_date: form.end_date || null,
    minimum_experience_years: parseInt(form.minimum_experience_years, 10) || 0,
    is_urgent: form.is_urgent,
    accommodation_provided: form.accommodation_provided,
    transport_provided: form.transport_provided,
    meals_provided: form.meals_provided,
  });

  const handleSave = async (publish: boolean) => {
    if (!company) return;
    if (!form.title.trim()) {
      Alert.alert('Validation', 'Job title is required.');
      return;
    }

    setLoading(true);
    try {
      const payload = buildPayload();

      if (isEditMode) {
        const updates: any = { ...payload };
        if (publish && currentStatus === 'draft') {
          updates.status = 'open';
          updates.published_at = new Date().toISOString();
        }
        const { error } = await supabase
          .from('job_requests')
          .update(updates)
          .eq('id', jobId);

        if (error) {
          Alert.alert('Error', error.message);
          return;
        }
        Alert.alert('Success', 'Job updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        const now = new Date().toISOString();
        const { error } = await supabase.from('job_requests').insert({
          company_id: company.id,
          ...payload,
          status: publish ? 'open' : 'draft',
          published_at: publish ? now : null,
        });

        if (error) {
          Alert.alert('Error', error.message);
          return;
        }
        Alert.alert('Success', publish ? 'Job published!' : 'Draft saved!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={[styles.flex, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>
          {isEditMode ? 'Edit Job' : 'Create Job'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label="Job Title"
          placeholder="e.g. Welder, Electrician"
          value={form.title}
          onChangeText={(v) => updateField('title', v)}
        />
        <Input
          label="Description"
          placeholder="Describe the job requirements"
          value={form.description}
          onChangeText={(v) => updateField('description', v)}
          multiline
          numberOfLines={4}
          style={{ minHeight: 100, textAlignVertical: 'top' }}
        />

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Input
              label="City"
              placeholder="e.g. Mumbai"
              value={form.city}
              onChangeText={(v) => updateField('city', v)}
            />
          </View>
          <View style={styles.halfInput}>
            <Input
              label="State"
              placeholder="e.g. Maharashtra"
              value={form.state}
              onChangeText={(v) => updateField('state', v)}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Input
              label="Employees Needed"
              placeholder="1"
              value={form.workers_needed}
              onChangeText={(v) => updateField('workers_needed', v)}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfInput}>
            <Input
              label="Min. Experience (yrs)"
              placeholder="0"
              value={form.minimum_experience_years}
              onChangeText={(v) => updateField('minimum_experience_years', v)}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Input
              label="Min Wage/Day (₹)"
              placeholder="e.g. 500"
              value={form.daily_wage_min}
              onChangeText={(v) => updateField('daily_wage_min', v)}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfInput}>
            <Input
              label="Max Wage/Day (₹)"
              placeholder="e.g. 1000"
              value={form.daily_wage_max}
              onChangeText={(v) => updateField('daily_wage_max', v)}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Input
              label="Start Date"
              placeholder="YYYY-MM-DD"
              value={form.start_date}
              onChangeText={(v) => updateField('start_date', v)}
            />
          </View>
          <View style={styles.halfInput}>
            <Input
              label="End Date"
              placeholder="YYYY-MM-DD"
              value={form.end_date}
              onChangeText={(v) => updateField('end_date', v)}
            />
          </View>
        </View>

        <View style={styles.switchSection}>
          <SwitchRow
            label="Urgent Hiring"
            value={form.is_urgent}
            onToggle={(v) => updateField('is_urgent', v)}
          />
          <SwitchRow
            label="Accommodation Provided"
            value={form.accommodation_provided}
            onToggle={(v) => updateField('accommodation_provided', v)}
          />
          <SwitchRow
            label="Transport Provided"
            value={form.transport_provided}
            onToggle={(v) => updateField('transport_provided', v)}
          />
          <SwitchRow
            label="Meals Provided"
            value={form.meals_provided}
            onToggle={(v) => updateField('meals_provided', v)}
          />
        </View>

        {isEditMode ? (
          <>
            <Button
              title="Save Changes"
              onPress={() => handleSave(false)}
              loading={loading}
              style={styles.button}
            />
            {currentStatus === 'draft' && (
              <Button
                title="Publish Now"
                variant="outline"
                onPress={() => handleSave(true)}
                disabled={loading}
                style={styles.button}
              />
            )}
          </>
        ) : (
          <>
            <Button
              title="Publish Job"
              onPress={() => handleSave(true)}
              loading={loading}
              style={styles.button}
            />
            <Button
              title="Save as Draft"
              variant="outline"
              onPress={() => handleSave(false)}
              disabled={loading}
              style={styles.button}
            />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SwitchRow({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primaryLight }}
        thumbColor={value ? colors.primary : colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  center: { justifyContent: 'center', alignItems: 'center' },
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
    paddingBottom: spacing['5xl'],
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  switchSection: {
    marginBottom: spacing.lg,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  switchLabel: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  button: {
    marginBottom: spacing.md,
  },
});
