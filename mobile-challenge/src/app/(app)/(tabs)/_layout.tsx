import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

import { MaterialTabBar } from '@/shared/components/material-tab-bar';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

function tabIcon(focusedIcon: IconName, unfocusedIcon: IconName) {
	return ({ focused, color, size }: { focused: boolean; color: ColorValue; size: number }) => (
		<MaterialCommunityIcons
			name={focused ? focusedIcon : unfocusedIcon}
			// MaterialTabBar always passes Paper's string colors.
			color={typeof color === 'string' ? color : undefined}
			size={size}
		/>
	);
}

export default function TabsLayout() {
	return (
		<Tabs tabBar={(props) => <MaterialTabBar {...props} />}>
			<Tabs.Screen
				name="index"
				options={{ title: 'Inicio', tabBarIcon: tabIcon('home', 'home-outline') }}
			/>
			<Tabs.Screen
				name="venues"
				options={{
					title: 'Sedes',
					headerShown: false,
					tabBarIcon: tabIcon('map-marker', 'map-marker-outline'),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: 'Perfil',
					headerShown: false,
					tabBarIcon: tabIcon('account', 'account-outline'),
				}}
			/>
		</Tabs>
	);
}
