import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { Snackbar, useTheme } from 'react-native-paper';

type SnackbarType = 'success' | 'error';

type SnackbarMessage = {
	id: number;
	text: string;
	type: SnackbarType;
};

type SnackbarContextValue = {
	showSuccess: (text: string) => void;
	showError: (text: string) => void;
};

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function SnackbarProvider({ children }: PropsWithChildren) {
	const theme = useTheme();
	const [message, setMessage] = useState<SnackbarMessage | null>(null);
	const [visible, setVisible] = useState(false);

	const show = useCallback((text: string, type: SnackbarType) => {
		setMessage({ id: Date.now(), text, type });
		setVisible(true);
	}, []);

	const value = useMemo<SnackbarContextValue>(
		() => ({
			showSuccess: (text) => show(text, 'success'),
			showError: (text) => show(text, 'error'),
		}),
		[show],
	);

	const isError = message?.type === 'error';

	return (
		<SnackbarContext.Provider value={value}>
			{children}
			<Snackbar
				// A new key restarts the timer when a message replaces the visible one.
				key={message?.id}
				visible={visible}
				onDismiss={() => setVisible(false)}
				duration={isError ? Snackbar.DURATION_MEDIUM : Snackbar.DURATION_SHORT}
				action={isError ? { label: 'Cerrar', textColor: theme.colors.onErrorContainer } : undefined}
				style={isError ? { backgroundColor: theme.colors.errorContainer } : undefined}
				theme={isError ? { colors: { inverseOnSurface: theme.colors.onErrorContainer } } : undefined}
			>
				{message?.text}
			</Snackbar>
		</SnackbarContext.Provider>
	);
}

export function useSnackbar() {
	const context = useContext(SnackbarContext);
	if (!context) {
		throw new Error('useSnackbar must be used within a SnackbarProvider');
	}
	return context;
}
