import { Stack } from 'expo-router';

export const unstable_settings = {
	anchor: '(tabs)',
};

export default function AppLayout() {
	return (
		<Stack>
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			<Stack.Screen name="booking" options={{ presentation: 'modal', title: 'Confirmar reserva' }} />
		</Stack>
	);
}
