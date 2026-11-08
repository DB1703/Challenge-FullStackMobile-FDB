import { DarkTheme, DefaultTheme, type Theme } from 'expo-router';
import type { MD3Theme } from 'react-native-paper';

import { darkTheme, lightTheme } from './paper-theme';

/**
 * Same color mapping as Paper's `adaptNavigationTheme`, which can't be used directly:
 * its types expect string colors, while Expo Router's `Theme` uses `ColorValue`.
 */
function adaptTheme(navigationTheme: Theme, paperTheme: MD3Theme): Theme {
	return {
		...navigationTheme,
		colors: {
			...navigationTheme.colors,
			primary: paperTheme.colors.primary,
			background: paperTheme.colors.background,
			card: paperTheme.colors.elevation.level2,
			text: paperTheme.colors.onSurface,
			border: paperTheme.colors.outline,
			notification: paperTheme.colors.error,
		},
	};
}

export const navigationLightTheme = adaptTheme(DefaultTheme, lightTheme);
export const navigationDarkTheme = adaptTheme(DarkTheme, darkTheme);
