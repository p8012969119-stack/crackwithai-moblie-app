import React from 'react';
import { View, Image, ImageSourcePropType, StyleSheet } from 'react-native';

export type TabIconName =
  | 'home'
  | 'courses'
  | 'workspace'
  | 'tools'
  | 'code'
  | 'fullstack'
  | 'learning';

interface TabIconAssetPair {
  active: ImageSourcePropType;
  inactive: ImageSourcePropType;
}

const TAB_ICON_MAP: Record<string, TabIconAssetPair> = {
  home: {
    active: require('../assets/tab-icons/home_active.png'),
    inactive: require('../assets/tab-icons/home_inactive.png'),
  },
  learning: {
    active: require('../assets/tab-icons/learning_active.png'),
    inactive: require('../assets/tab-icons/learning_inactive.png'),
  },
  courses: {
    active: require('../assets/tab-icons/learning_active.png'),
    inactive: require('../assets/tab-icons/learning_inactive.png'),
  },
  code: {
    active: require('../assets/tab-icons/learning_active.png'),
    inactive: require('../assets/tab-icons/learning_inactive.png'),
  },
  fullstack: {
    active: require('../assets/tab-icons/learning_active.png'),
    inactive: require('../assets/tab-icons/learning_inactive.png'),
  },
  workspace: {
    active: require('../assets/tab-icons/workspace_active.png'),
    inactive: require('../assets/tab-icons/workspace_inactive.png'),
  },
  tools: {
    active: require('../assets/tab-icons/tools_active.png'),
    inactive: require('../assets/tab-icons/tools_inactive.png'),
  },
};

export const TabIcon: React.FC<{
  name: TabIconName;
  color?: string;
  isFocused?: boolean;
  size?: number;
}> = ({ name, isFocused = false, size = 26 }) => {
  const iconPair = TAB_ICON_MAP[name] || TAB_ICON_MAP.home;
  const source = isFocused ? iconPair.active : iconPair.inactive;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={source}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
