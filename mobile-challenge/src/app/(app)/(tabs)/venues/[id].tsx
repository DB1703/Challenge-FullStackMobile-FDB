import { router, useLocalSearchParams } from 'expo-router';
import { Button, Text } from 'react-native-paper';

import { ScreenPlaceholder } from '@/shared/components/screen-placeholder';

export default function VenueDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();

	return (
		<ScreenPlaceholder title="Detalle de sede">
			<Text variant="bodyMedium">Sede: {id}</Text>
			<Button mode="contained" onPress={() => router.push('/booking')}>
				Reservar
			</Button>
		</ScreenPlaceholder>
	);
}
