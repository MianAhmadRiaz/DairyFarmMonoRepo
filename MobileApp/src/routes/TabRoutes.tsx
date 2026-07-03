import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Home from 'screens/Main/Home';
import AnyIcon, { Icons } from 'shared/components/AnyIcon';
import CowMonitoring from 'screens/Main/CowMonitoring';
import ProfileScreen from 'screens/Main/ProfileScreen';
import { COLORS } from 'shared/theme';
import { RF } from 'shared/theme/responsive';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  const size = 26;
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false, // Hide labels for a clean look
        tabBarStyle: styles.tabBar, // Custom floating style
        headerShown: false, // Hide header
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnyIcon
              disabled
              type={Icons.Entypo}
              name={'home'}
              size={size}
              style={{ top: 12 }}
              color={focused ? COLORS.secondaryMain : COLORS.labelGrey}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnyIcon
              disabled
              type={Icons.MaterialCommunityIcons}
              name={'cow'}
              size={size}
              style={{ top: 12 }}
              color={focused ? COLORS.secondaryMain : COLORS.labelGrey}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnyIcon
              disabled
              type={Icons.Ionicons}
              name={'person'}
              size={size}
              style={{ top: 12 }}
              color={focused ? COLORS.secondaryMain : COLORS.labelGrey}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs;
const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 0,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    height: RF(50),
    borderRadius: 100,
    backgroundColor: COLORS.white, // Customize your background color
    shadowColor: COLORS.labelGrey,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8, // For Android shadow
    paddingHorizontal: 10,
  },
});
