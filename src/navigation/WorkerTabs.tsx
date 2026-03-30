import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { WorkerHomeScreen } from '../screens/worker/WorkerHomeScreen';
import { JobDetailScreen } from '../screens/worker/JobDetailScreen';
import { MyJobsScreen } from '../screens/worker/MyJobsScreen';
import { WorkerProfileScreen } from '../screens/worker/WorkerProfileScreen';
import { colors } from '../theme';

export type WorkerHomeStackParamList = {
  WorkerHome: undefined;
  JobDetail: { jobId: string };
};

export type WorkerJobsStackParamList = {
  MyJobs: undefined;
  JobDetail: { jobId: string };
};

const HomeStack = createNativeStackNavigator<WorkerHomeStackParamList>();
const JobsStack = createNativeStackNavigator<WorkerJobsStackParamList>();
const Tab = createBottomTabNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="WorkerHome" component={WorkerHomeScreen} />
      <HomeStack.Screen name="JobDetail" component={JobDetailScreen} />
    </HomeStack.Navigator>
  );
}

function JobsStackScreen() {
  return (
    <JobsStack.Navigator screenOptions={{ headerShown: false }}>
      <JobsStack.Screen name="MyJobs" component={MyJobsScreen} />
      <JobsStack.Screen name="JobDetail" component={JobDetailScreen} />
    </JobsStack.Navigator>
  );
}

export function WorkerTabs() {
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
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Jobs') iconName = 'briefcase-outline';
          else if (route.name === 'Profile') iconName = 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Jobs" component={JobsStackScreen} />
      <Tab.Screen name="Profile" component={WorkerProfileScreen} />
    </Tab.Navigator>
  );
}
