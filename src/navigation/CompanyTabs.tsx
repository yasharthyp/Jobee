import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CompanyDashboardScreen } from '../screens/company/CompanyDashboardScreen';
import { CreateJobScreen } from '../screens/company/CreateJobScreen';
import { CompanyJobListScreen } from '../screens/company/CompanyJobListScreen';
import { ApplicantsScreen } from '../screens/company/ApplicantsScreen';
import { CompanyProfileScreen } from '../screens/company/CompanyProfileScreen';
import { colors } from '../theme';

export type CompanyJobsStackParamList = {
  CompanyJobList: { initialFilter?: string } | undefined;
  CreateJob: { jobId?: string } | undefined;
  Applicants: { jobId: string; jobTitle: string };
};

const JobsStack = createNativeStackNavigator<CompanyJobsStackParamList>();
const Tab = createBottomTabNavigator();

function JobsStackScreen() {
  return (
    <JobsStack.Navigator screenOptions={{ headerShown: false }}>
      <JobsStack.Screen name="CompanyJobList" component={CompanyJobListScreen} />
      <JobsStack.Screen name="CreateJob" component={CreateJobScreen} />
      <JobsStack.Screen name="Applicants" component={ApplicantsScreen} />
    </JobsStack.Navigator>
  );
}

export function CompanyTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          paddingBottom: 4,
          height: 56,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'grid';
          if (route.name === 'Dashboard') iconName = 'grid-outline';
          else if (route.name === 'Jobs') iconName = 'briefcase-outline';
          else if (route.name === 'Profile') iconName = 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={CompanyDashboardScreen} />
      <Tab.Screen name="Jobs" component={JobsStackScreen} />
      <Tab.Screen name="Profile" component={CompanyProfileScreen} />
    </Tab.Navigator>
  );
}
