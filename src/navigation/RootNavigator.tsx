import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { AuthStack } from './AuthStack';
import { OnboardingStack } from './OnboardingStack';
import { WorkerTabs } from './WorkerTabs';
import { CompanyTabs } from './CompanyTabs';

export function RootNavigator() {
  const { session, profile, loading, isOnboarded } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {!session ? (
        <AuthStack />
      ) : !profile || !profile.is_profile_complete || !isOnboarded ? (
        <OnboardingStack />
      ) : profile.role === 'company' ? (
        <CompanyTabs />
      ) : (
        <WorkerTabs />
      )}
    </NavigationContainer>
  );
}
