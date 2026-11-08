import { router } from 'expo-router';
import { Button } from 'react-native-paper';

import { ScreenPlaceholder } from '@/shared/components/screen-placeholder';

export default function VenuesScreen() {
	return (
		<ScreenPlaceholder title="Sedes">
			<Button mode="contained" onPress={() => router.push('/venues/demo')}>
				Ver sede de ejemplo
			</Button>
		</ScreenPlaceholder>
	);
}
