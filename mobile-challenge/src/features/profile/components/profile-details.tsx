import { StyleSheet, View } from 'react-native';
import { Avatar, List, Text, useTheme } from 'react-native-paper';

import { formatLongDate, parseDateOnly } from '@/shared/utils/dates';

import type { User } from '../profile.types';

type ProfileDetailsProps = {
	user: User;
};

export function ProfileDetails({ user }: ProfileDetailsProps) {
	const theme = useTheme();
	const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

	return (
		<View>
			<View style={styles.header}>
				<Avatar.Text size={72} label={initials} />
				<Text variant="headlineSmall" style={styles.fullName}>
					{user.firstName} {user.lastName}
				</Text>
			</View>

			<List.Section>
				<List.Item title="Nombre" description={user.firstName} left={(props) => <List.Icon {...props} icon="account-outline" />} />
				<List.Item title="Apellido" description={user.lastName} left={(props) => <List.Icon {...props} icon="account-outline" />} />
				<List.Item title="Email" description={user.email} left={(props) => <List.Icon {...props} icon="email-outline" />} />
				<List.Item
					title="Fecha de nacimiento"
					description={formatLongDate(parseDateOnly(user.birthDate))}
					left={(props) => <List.Icon {...props} icon="cake-variant-outline" />}
				/>
				<List.Item
					title="Dirección"
					description={user.address ?? 'Sin dirección cargada'}
					descriptionStyle={user.address ? undefined : { color: theme.colors.onSurfaceVariant, fontStyle: 'italic' }}
					left={(props) => <List.Icon {...props} icon="map-marker-outline" />}
				/>
			</List.Section>
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		alignItems: 'center',
		gap: 12,
		paddingTop: 24,
	},
	fullName: {
		textAlign: 'center',
	},
});
