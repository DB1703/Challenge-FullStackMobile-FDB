import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';

import { useAuthStore, useIsLoggedIn } from '@/features/auth/auth.store';
import { SessionExpiredNotifier } from '@/features/auth/components/session-expired-notifier';
import { SnackbarProvider } from '@/shared/components/snackbar-provider';
import { useAppTheme } from '@/shared/theme/use-app-theme';

// Kept visible until the session store is hydrated.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const { paperTheme, navigationTheme } = useAppTheme();

	return (
		<PaperProvider theme={paperTheme}>
			<ThemeProvider value={navigationTheme}>
				<SnackbarProvider>
					<SessionExpiredNotifier />
					<RootNavigator />
				</SnackbarProvider>
				<StatusBar style="auto" />
			</ThemeProvider>
		</PaperProvider>
	);
}

function RootNavigator() {
	const isHydrated = useAuthStore((state) => state.isHydrated);
	const isLoggedIn = useIsLoggedIn();

	useEffect(() => {
		if (isHydrated) {
			SplashScreen.hide();
		}
	}, [isHydrated]);

	// Navigation doesn't decide between the login and the app until the saved session is loaded.
	if (!isHydrated) {
		return null;
	}

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Protected guard={isLoggedIn}>
				<Stack.Screen name="(app)" />
			</Stack.Protected>
			<Stack.Protected guard={!isLoggedIn}>
				<Stack.Screen name="login" />
			</Stack.Protected>
		</Stack>
	);
}
