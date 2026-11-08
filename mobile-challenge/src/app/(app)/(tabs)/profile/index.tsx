import { router } from 'expo-router';
import { Button } from 'react-native-paper';

import { ScreenPlaceholder } from '@/shared/components/screen-placeholder';

export default function ProfileScreen() {
	return (
		<ScreenPlaceholder title="Perfil">
			<Button mode="contained" onPress={() => router.push('/profile/edit')}>
				Editar perfil
			</Button>
			{/* TEMP: replaced by protected routes in the session task */}
			<Button mode="outlined" onPress={() => router.replace('/login')}>
				Ir al login
			</Button>
		</ScreenPlaceholder>
	);
}
