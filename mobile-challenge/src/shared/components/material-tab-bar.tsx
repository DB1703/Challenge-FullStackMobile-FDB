import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { BottomNavigation } from 'react-native-paper';

/** Renders the JS tab bar with Paper's Material Design 3 `BottomNavigation.Bar`. */
export function MaterialTabBar({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
	return (
		<BottomNavigation.Bar
			navigationState={state}
			safeAreaInsets={insets}
			onTabPress={({ route, preventDefault }) => {
				const event = emitter.emit({
					type: 'tabPress',
					target: route.key,
					canPreventDefault: true,
				});

				if (event.defaultPrevented) {
					preventDefault();
				} else if (state.routes[state.index].key !== route.key) {
					navigateToTab(route.key);
				}
			}}
			onTabLongPress={({ route }) => {
				emitter.emit({ type: 'tabLongPress', target: route.key });
			}}
			renderIcon={({ route, focused, color }) =>
				descriptors[route.key].options.tabBarIcon?.({ focused, color, size: 24 }) ?? null
			}
			getLabelText={({ route }) => {
				const { tabBarLabel, title } = descriptors[route.key].options;
				return typeof tabBarLabel === 'string' ? tabBarLabel : (title ?? route.name);
			}}
		/>
	);
}
