import { router } from 'expo-router';
import { Button } from 'react-native-paper';

import { ScreenPlaceholder } from '@/shared/components/screen-placeholder';

export default function LoginScreen() {
	return (
		<ScreenPlaceholder title="Iniciar sesión">
			{/* TEMP: replaced by protected routes in the session task */}
			<Button mode="contained" onPress={() => router.replace('/')}>
				Ingresar
			</Button>
		</ScreenPlaceholder>
	);
}
