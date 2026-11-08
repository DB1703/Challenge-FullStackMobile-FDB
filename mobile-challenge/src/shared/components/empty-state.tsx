import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

export type StateIcon = ComponentProps<typeof MaterialCommunityIcons>['name'];

type EmptyStateProps = {
	icon: StateIcon;
	title: string;
	message?: string;
	action?: { label: string; onPress: () => void };
};

/** Message for a screen or section without content, with an optional next action. */
export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
	const theme = useTheme();

	return (
		<View style={styles.container}>
			<MaterialCommunityIcons name={icon} size={48} color={theme.colors.onSurfaceVariant} />
			<Text variant="titleMedium" style={styles.centered}>
				{title}
			</Text>
			{message && (
				<Text variant="bodyMedium" style={[styles.centered, { color: theme.colors.onSurfaceVariant }]}>
					{message}
				</Text>
			)}
			{action && (
				<Button mode="contained-tonal" onPress={action.onPress} style={styles.action}>
					{action.label}
				</Button>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		padding: 24,
	},
	centered: {
		textAlign: 'center',
	},
	action: {
		marginTop: 8,
	},
});
