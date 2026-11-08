import { useColorScheme } from 'react-native';

import { navigationDarkTheme, navigationLightTheme } from './navigation-theme';
import { darkTheme, lightTheme } from './paper-theme';

export function useAppTheme() {
	const isDark = useColorScheme() === 'dark';

	return {
		paperTheme: isDark ? darkTheme : lightTheme,
		navigationTheme: isDark ? navigationDarkTheme : navigationLightTheme,
	};
}
