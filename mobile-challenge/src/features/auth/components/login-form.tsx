import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View, type TextInputInstance } from 'react-native';
import { Button, HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { z } from 'zod';

import { useSnackbar } from '@/shared/components/snackbar-provider';
import { isAppError } from '@/shared/errors/app-error';

import { loginSchema } from '../auth.schemas';
import { useAuthStore } from '../auth.store';

type LoginFormValues = z.input<typeof loginSchema>;

export function LoginForm() {
	const theme = useTheme();
	const login = useAuthStore((state) => state.login);
	const { showError } = useSnackbar();
	const passwordRef = useRef<TextInputInstance>(null);
	const [passwordVisible, setPasswordVisible] = useState(false);

	const {
		control,
		handleSubmit,
		setError,
		clearErrors,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormValues, unknown, z.output<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: '', password: '' },
	});

	// On success the protected routes switch to the app: no manual navigation.
	const onSubmit = handleSubmit(async (credentials) => {
		try {
			await login(credentials);
		} catch (error) {
			if (isAppError(error, 'INVALID_CREDENTIALS')) {
				setError('root', { message: 'Email o contraseña incorrectos.' });
			} else {
				showError('No pudimos iniciar sesión. Intentá de nuevo.');
			}
		}
	});

	// The credentials error refers to both fields, so editing either one clears it.
	const clearCredentialsError = () => {
		if (errors.root) {
			clearErrors('root');
		}
	};

	return (
		<SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.background }]}>
			<KeyboardAvoidingView style={styles.flex} behavior="padding">
				<ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
					<View style={styles.header}>
						<Text variant="headlineMedium">Iniciar sesión</Text>
						<Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
							Ingresá para reservar tus clases.
						</Text>
					</View>

					<View>
						<Controller
							control={control}
							name="email"
							render={({ field: { onChange, onBlur, value, ref } }) => (
								<TextInput
									ref={ref}
									mode="outlined"
									label="Email"
									value={value}
									onChangeText={(text) => {
										clearCredentialsError();
										onChange(text);
									}}
									onBlur={onBlur}
									error={!!errors.email}
									keyboardType="email-address"
									autoCapitalize="none"
									autoCorrect={false}
									autoComplete="email"
									textContentType="emailAddress"
									returnKeyType="next"
									submitBehavior="submit"
									onSubmitEditing={() => passwordRef.current?.focus()}
								/>
							)}
						/>
						<HelperText type="error" visible={!!errors.email}>
							{errors.email?.message}
						</HelperText>

						<Controller
							control={control}
							name="password"
							render={({ field: { onChange, onBlur, value } }) => (
								<TextInput
									ref={passwordRef}
									mode="outlined"
									label="Contraseña"
									value={value}
									onChangeText={(text) => {
										clearCredentialsError();
										onChange(text);
									}}
									onBlur={onBlur}
									error={!!errors.password}
									secureTextEntry={!passwordVisible}
									autoCapitalize="none"
									autoCorrect={false}
									autoComplete="current-password"
									textContentType="password"
									returnKeyType="done"
									onSubmitEditing={() => void onSubmit()}
									right={
										<TextInput.Icon
											icon={passwordVisible ? 'eye-off' : 'eye'}
											onPress={() => setPasswordVisible((visible) => !visible)}
											accessibilityLabel={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
										/>
									}
								/>
							)}
						/>
						<HelperText type="error" visible={!!errors.password}>
							{errors.password?.message}
						</HelperText>
					</View>

					<View style={styles.actions}>
						{errors.root && (
							<HelperText type="error" style={styles.rootError}>
								{errors.root.message}
							</HelperText>
						)}
						<Button mode="contained" onPress={() => void onSubmit()} loading={isSubmitting} disabled={isSubmitting}>
							Ingresar
						</Button>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	flex: {
		flex: 1,
	},
	content: {
		flexGrow: 1,
		justifyContent: 'center',
		padding: 24,
		gap: 24,
	},
	header: {
		gap: 8,
	},
	actions: {
		gap: 8,
	},
	rootError: {
		textAlign: 'center',
	},
});
