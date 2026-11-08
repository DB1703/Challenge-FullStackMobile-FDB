import { router, useLocalSearchParams } from 'expo-router';
import { Button, Text } from 'react-native-paper';

import { ScreenPlaceholder } from '@/shared/components/screen-placeholder';

// Phase A placeholder: shows the received params to check the navigation. The booking form comes next.
export default function BookingScreen() {
	const { venueId, sessionId } = useLocalSearchParams<{ venueId: string; sessionId: string }>();

	return (
		<ScreenPlaceholder title="Confirmar reserva">
			<Text variant="bodyMedium">
				Sede {venueId} · Sesión {sessionId}
			</Text>
			<Button mode="outlined" onPress={() => router.back()}>
				Cerrar
			</Button>
		</ScreenPlaceholder>
	);
}
