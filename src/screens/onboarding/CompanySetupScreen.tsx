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

const SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'] as const;

export function CompanySetupScreen() {
  const { session, setCompany } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    company_name: '',
    industry: '',
    description: '',
    city: '',
    state: '',
    company_size: '' as string,
  });

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!session?.user) return;
    if (!form.company_name.trim()) {
      Alert.alert('Validation', 'Company name is required.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({
          profile_id: session.user.id,
          company_name: form.company_name.trim(),
          industry: form.industry.trim() || null,
          description: form.description.trim() || null,
          city: form.city.trim() || null,
          state: form.state.trim() || null,
          company_size: form.company_size || null,
        })
        .select()
        .single();

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      await supabase
        .from('profiles')
        .update({ is_profile_complete: true, city: form.city.trim() || null, state: form.state.trim() || null })
        .eq('id', session.user.id);

      if (data) setCompany(data);
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
        <Text style={styles.title}>Company Profile</Text>
        <Text style={styles.subtitle}>Tell us about your company</Text>

        <View style={styles.form}>
          <Input
            label="Company Name"
            placeholder="e.g. BuildCo Pvt Ltd"
            value={form.company_name}
            onChangeText={(v) => updateField('company_name', v)}
          />
          <Input
            label="Industry"
            placeholder="e.g. Construction, Manufacturing"
            value={form.industry}
            onChangeText={(v) => updateField('industry', v)}
          />
          <Input
            label="Description"
            placeholder="What does your company do?"
            value={form.description}
            onChangeText={(v) => updateField('description', v)}
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />
          <Input
            label="City"
            placeholder="e.g. Pune"
            value={form.city}
            onChangeText={(v) => updateField('city', v)}
          />
          <Input
            label="State"
            placeholder="e.g. Maharashtra"
            value={form.state}
            onChangeText={(v) => updateField('state', v)}
          />

          <Text style={styles.label}>Company Size</Text>
          <View style={styles.chipRow}>
            {SIZES.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.chip,
                  form.company_size === size && styles.chipSelected,
                ]}
                onPress={() => updateField('company_size', size)}
              >
                <Text
                  style={[
                    styles.chipText,
                    form.company_size === size && styles.chipTextSelected,
                  ]}
                >
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

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
