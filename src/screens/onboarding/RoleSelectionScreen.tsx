import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';
import { OnboardingStackParamList } from '../../navigation/OnboardingStack';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'RoleSelection'>;

export function RoleSelectionScreen() {
  const navigation = useNavigation<Nav>();
  const { session, updateProfile } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'worker' | 'company' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedRole || !session?.user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: selectedRole })
        .eq('id', session.user.id);

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      updateProfile({ role: selectedRole });

      if (selectedRole === 'worker') {
        navigation.navigate('WorkerSetup');
      } else {
        navigation.navigate('CompanySetup');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Who are you?</Text>
        <Text style={styles.subtitle}>Choose how you want to use Jobee</Text>
      </View>

      <View style={styles.cards}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSelectedRole('worker')}
        >
          <Card
            style={[
              styles.roleCard,
              selectedRole === 'worker' && styles.selectedCard,
            ]}
          >
            <Ionicons
              name="construct-outline"
              size={40}
              color={selectedRole === 'worker' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.roleTitle,
                selectedRole === 'worker' && styles.selectedText,
              ]}
            >
              I'm a Worker
            </Text>
            <Text style={styles.roleDescription}>
              Find jobs, get hired, and build your career
            </Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSelectedRole('company')}
        >
          <Card
            style={[
              styles.roleCard,
              selectedRole === 'company' && styles.selectedCard,
            ]}
          >
            <Ionicons
              name="business-outline"
              size={40}
              color={selectedRole === 'company' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.roleTitle,
                selectedRole === 'company' && styles.selectedText,
              ]}
            >
              I'm a Company
            </Text>
            <Text style={styles.roleDescription}>
              Post jobs, find workers, and grow your business
            </Text>
          </Card>
        </TouchableOpacity>
      </View>

      <Button
        title="Continue"
        onPress={handleContinue}
        loading={loading}
        disabled={!selectedRole}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['5xl'],
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  cards: {
    gap: spacing.lg,
    marginBottom: spacing['3xl'],
  },
  roleCard: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  roleTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  selectedText: {
    color: colors.primary,
  },
  roleDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  button: {
    marginTop: 'auto' as any,
    marginBottom: spacing['3xl'],
  },
});
