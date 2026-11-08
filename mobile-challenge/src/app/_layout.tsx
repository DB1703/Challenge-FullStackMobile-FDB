import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';

import { SnackbarProvider } from '@/shared/components/snackbar-provider';
import { useAppTheme } from '@/shared/theme/use-app-theme';

export default function RootLayout() {
	const { paperTheme, navigationTheme } = useAppTheme();

	return (
		<PaperProvider theme={paperTheme}>
			<ThemeProvider value={navigationTheme}>
				<SnackbarProvider>
					<Stack screenOptions={{ headerShown: false }}>
						<Stack.Screen name="(app)" />
						<Stack.Screen name="login" />
					</Stack>
				</SnackbarProvider>
				<StatusBar style="auto" />
			</ThemeProvider>
		</PaperProvider>
	);
}
