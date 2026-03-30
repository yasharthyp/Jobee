import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';

const GENDERS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
] as const;

export function WorkerSetupScreen() {
  const { session, setWorker } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    city: '',
    state: '',
    gender: '' as string,
    experience_years: '',
    expected_daily_wage: '',
    bio: '',
  });

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!session?.user) return;
    if (!form.city.trim()) {
      Alert.alert('Validation', 'Please enter your city.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workers')
        .insert({
          profile_id: session.user.id,
          city: form.city.trim(),
          state: form.state.trim() || null,
          gender: (form.gender as any) || null,
          experience_years: form.experience_years
            ? parseInt(form.experience_years, 10)
            : null,
          expected_daily_wage: form.expected_daily_wage
            ? parseFloat(form.expected_daily_wage)
            : null,
          bio: form.bio.trim() || null,
        })
        .select()
        .single();

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      await supabase
        .from('profiles')
        .update({ is_profile_complete: true, city: form.city.trim(), state: form.state.trim() || null })
        .eq('id', session.user.id);

      if (data) setWorker(data);
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Worker Profile</Text>
        <Text style={styles.subtitle}>Tell us about yourself</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.chipRow}>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g.value}
                style={[
                  styles.chip,
                  form.gender === g.value && styles.chipSelected,
                ]}
                onPress={() => updateField('gender', g.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    form.gender === g.value && styles.chipTextSelected,
                  ]}
                >
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="City"
            placeholder="e.g. Mumbai"
            value={form.city}
            onChangeText={(v) => updateField('city', v)}
          />
          <Input
            label="State"
            placeholder="e.g. Maharashtra"
            value={form.state}
            onChangeText={(v) => updateField('state', v)}
          />
          <Input
            label="Years of Experience"
            placeholder="e.g. 3"
            value={form.experience_years}
            onChangeText={(v) => updateField('experience_years', v)}
            keyboardType="numeric"
          />
          <Input
            label="Expected Daily Wage (INR)"
            placeholder="e.g. 800"
            value={form.expected_daily_wage}
            onChangeText={(v) => updateField('expected_daily_wage', v)}
            keyboardType="numeric"
          />
          <Input
            label="Bio"
            placeholder="A short description about yourself"
            value={form.bio}
            onChangeText={(v) => updateField('bio', v)}
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />

          <Button title="Complete Setup" onPress={handleSubmit} loading={loading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['5xl'],
    paddingBottom: spacing['3xl'],
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing['3xl'],
  },
  form: {},
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
});
