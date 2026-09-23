import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Keyboard } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen } from '../screens/dashboard/HomeScreen';
import { AIScreen } from '../screens/ai/AIScreen';
import { ToolsScreen } from '../screens/tools/ToolsScreen';
import { FullStackOverviewScreen } from '../screens/fullstack/FullStackOverviewScreen';
import { TabIcon, TabIconName } from '../components/TabIcon';

const Tab = createBottomTabNavigator();

const AnimatedTabButton = ({ label, iconName, isFocused, onPress }: any) => {
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: isFocused ? 1.15 : 0.95,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  return (
    <TouchableOpacity
      accessibilityRole="tab"
      accessibilityLabel={typeof label === 'string' ? label : undefined}
      accessibilityState={{selected: isFocused}}
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.tabBtnContainer}
    >
      <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
        <TabIcon
          name={iconName}
          size={24}
          color={isFocused ? '#6D28D9' : '#94A3B8'}
        />
      </Animated.View>

      <Text
        style={[
          styles.tabLabelText,
          isFocused ? styles.tabLabelTextFocused : styles.tabLabelTextUnfocused,
        ]}
      >
        {label}
      </Text>

      {/* Smooth Top Active Line Indicator */}
      {isFocused && <View style={styles.topActiveIndicator} />}
    </TouchableOpacity>
  );
};

export const MainTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = React.useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardWillShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardWillHide', () => setKeyboardVisible(false));
    return () => {show.remove(); hide.remove();};
  }, []);

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      tabBar={({ state, descriptors, navigation }) => {
        if (keyboardVisible) return null;
        return (
          <View style={[styles.customTabBarContainer, { height: 60 + Math.max(insets.bottom, 6), paddingBottom: Math.max(insets.bottom, 6) }]}>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const isFocused = state.index === index;

              const label =
                options.tabBarLabel !== undefined
                  ? options.tabBarLabel
                  : options.title !== undefined
                  ? options.title
                  : route.name;

              let iconName: TabIconName = 'home';
              if (route.name === 'HomeTab') iconName = 'home';
              else if (route.name === 'FullStackTab') iconName = 'code';
              else if (route.name === 'AITab') iconName = 'workspace';
              else if (route.name === 'ToolsTab') iconName = 'tools';

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              return (
                <AnimatedTabButton
                  key={route.key}
                  label={label}
                  iconName={iconName}
                  isFocused={isFocused}
                  onPress={onPress}
                />
              );
            })}
          </View>
        );
      }}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="FullStackTab" component={FullStackOverviewScreen} options={{ tabBarLabel: 'Learning' }} />
      <Tab.Screen name="AITab" component={AIScreen} options={{ tabBarLabel: 'AI Workspace' }} />
      <Tab.Screen name="ToolsTab" component={ToolsScreen} options={{ tabBarLabel: 'Tools' }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  customTabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    elevation: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  tabBtnContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: 6,
  },
  topActiveIndicator: {
    position: 'absolute',
    top: 0,
    width: 22,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#6D28D9',
  },
  tabLabelText: {
    fontSize: 10.5,
    marginTop: 5,
  },
  tabLabelTextFocused: {
    color: '#6D28D9',
    fontWeight: '700',
  },
  tabLabelTextUnfocused: {
    color: '#94A3B8',
    fontWeight: '600',
  },
});
