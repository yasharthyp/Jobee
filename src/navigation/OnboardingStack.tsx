import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RoleSelectionScreen } from '../screens/onboarding/RoleSelectionScreen';
import { WorkerSetupScreen } from '../screens/onboarding/WorkerSetupScreen';
import { CompanySetupScreen } from '../screens/onboarding/CompanySetupScreen';

export type OnboardingStackParamList = {
  RoleSelection: undefined;
  WorkerSetup: undefined;
  CompanySetup: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F9FAFB' },
      }}
    >
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="WorkerSetup" component={WorkerSetupScreen} />
      <Stack.Screen name="CompanySetup" component={CompanySetupScreen} />
    </Stack.Navigator>
  );
}
