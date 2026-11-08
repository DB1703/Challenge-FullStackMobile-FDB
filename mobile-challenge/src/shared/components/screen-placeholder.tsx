import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type ScreenPlaceholderProps = PropsWithChildren<{
	title: string;
}>;

/** Temporary empty screen: a title plus optional navigation actions. */
export function ScreenPlaceholder({ title, children }: ScreenPlaceholderProps) {
	const theme = useTheme();

	return (
		<View style={[styles.container, { backgroundColor: theme.colors.background }]}>
			<Text variant="headlineSmall">{title}</Text>
			{children}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 16,
		padding: 24,
	},
});
