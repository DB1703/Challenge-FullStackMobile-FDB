import { Button } from 'react-native-paper';

import { ScreenPlaceholder } from '@/shared/components/screen-placeholder';
import { useSnackbar } from '@/shared/components/snackbar-provider';

export default function HomeScreen() {
	const { showSuccess, showError } = useSnackbar();

	return (
		<ScreenPlaceholder title="Inicio">
			{/* TEMP: snackbar demo, removed when the home screen is built */}
			<Button mode="contained-tonal" onPress={() => showSuccess('Operación realizada con éxito.')}>
				Probar snackbar de éxito
			</Button>
			<Button mode="contained-tonal" onPress={() => showError('Ocurrió un error. Intentá de nuevo.')}>
				Probar snackbar de error
			</Button>
		</ScreenPlaceholder>
	);
}
