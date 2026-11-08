import { router } from 'expo-router';
import { Button } from 'react-native-paper';

import { ScreenPlaceholder } from '@/shared/components/screen-placeholder';

export default function BookingScreen() {
	return (
		<ScreenPlaceholder title="Confirmar reserva">
			<Button mode="outlined" onPress={() => router.back()}>
				Cerrar
			</Button>
		</ScreenPlaceholder>
	);
}
