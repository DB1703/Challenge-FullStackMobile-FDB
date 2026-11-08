import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePreventRemove } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { useState } from 'react';
import { Controller, useForm, type FieldPath } from 'react-hook-form';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, TextInput, useTheme, type TextInputProps } from 'react-native-paper';
import type { z } from 'zod';

import { useAuthStore, useIsLoggedIn } from '@/features/auth/auth.store';
import { ConfirmDialog } from '@/shared/components/confirm-dialog';
import { useSnackbar } from '@/shared/components/snackbar-provider';
import { isAppError } from '@/shared/errors/app-error';
import { formatLongDate, parseDateOnly } from '@/shared/utils/dates';

import { updateProfileSchema } from '../profile.schemas';
import type { User } from '../profile.types';

type FormValues = z.input<typeof updateProfileSchema>;

const FIELDS = ['firstName', 'lastName', 'email', 'address'] as const satisfies readonly FieldPath<FormValues>[];

function isFormField(field: string | null): field is (typeof FIELDS)[number] {
	return FIELDS.includes(field as (typeof FIELDS)[number]);
}

type EditProfileFormProps = {
	user: User;
};

export function EditProfileForm({ user }: EditProfileFormProps) {
	const theme = useTheme();
	const headerHeight = useHeaderHeight();
	const updateProfile = useAuthStore((state) => state.updateProfile);
	const isLoggedIn = useIsLoggedIn();
	const { showSuccess, showError } = useSnackbar();
	const [pendingLeave, setPendingLeave] = useState<(() => void) | null>(null);

	const {
		control,
		handleSubmit,
		setError,
		setFocus,
		reset,
		formState: { errors, isDirty, isSubmitting },
	} = useForm<FormValues, unknown, z.output<typeof updateProfileSchema>>({
		resolver: zodResolver(updateProfileSchema),
		defaultValues: {
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			// The input needs a string; the schema turns '' back into null.
			address: user.address ?? '',
		},
	});

	// Leaving with unsaved changes asks first. Not while submitting, and not when the session ended:
	// the protected routes must be able to remove the screen without asking.
	const disablePrevention = usePreventRemove(isDirty && !isSubmitting && isLoggedIn, ({ repeat }) => {
		setPendingLeave(() => repeat);
	});

	const onSubmit = handleSubmit(async (values) => {
		try {
			await updateProfile(values);
		} catch (error) {
			if (isAppError(error, 'TOKEN_EXPIRED') || isAppError(error, 'TOKEN_INVALID')) {
				// Handled centrally: the session ended and the login shows the notice.
				return;
			}
			if (isAppError(error, 'EMAIL_ALREADY_IN_USE')) {
				setError('email', { message: 'Ese email ya está en uso.' }, { shouldFocus: true });
				return;
			}
			// The form validates with the same rules; only the field of each detail is used, not its text.
			const fields = isAppError(error, 'INVALID_INPUT')
				? (error.details ?? []).map((detail) => detail.field).filter(isFormField)
				: [];
			if (fields.length > 0) {
				fields.forEach((field) => setError(field, { message: 'Revisá este campo.' }));
				return;
			}
			showError('No pudimos guardar los cambios. Intentá de nuevo.');
			return;
		}

		reset(values);
		disablePrevention();
		showSuccess('Perfil actualizado.');
		router.back();
	});

	const submit = () => void onSubmit();

	const textField = (
		name: (typeof FIELDS)[number],
		label: string,
		props: Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur' | 'error' | 'label' | 'mode'>,
	) => (
		<View>
			<Controller
				control={control}
				name={name}
				render={({ field: { onChange, onBlur, value, ref } }) => (
					<TextInput
						ref={ref}
						mode="outlined"
						label={label}
						value={value ?? ''}
						onChangeText={onChange}
						onBlur={onBlur}
						error={!!errors[name]}
						{...props}
					/>
				)}
			/>
			<HelperText type="error" visible={!!errors[name]}>
				{errors[name]?.message}
			</HelperText>
		</View>
	);

	return (
		<KeyboardAvoidingView
			style={[styles.flex, { backgroundColor: theme.colors.background }]}
			behavior="padding"
			keyboardVerticalOffset={headerHeight}
		>
			<ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
				{textField('firstName', 'Nombre', {
					autoCapitalize: 'words',
					autoComplete: 'given-name',
					returnKeyType: 'next',
					submitBehavior: 'submit',
					onSubmitEditing: () => setFocus('lastName'),
				})}
				{textField('lastName', 'Apellido', {
					autoCapitalize: 'words',
					autoComplete: 'family-name',
					returnKeyType: 'next',
					submitBehavior: 'submit',
					onSubmitEditing: () => setFocus('email'),
				})}
				{textField('email', 'Email', {
					keyboardType: 'email-address',
					autoCapitalize: 'none',
					autoCorrect: false,
					autoComplete: 'email',
					textContentType: 'emailAddress',
					returnKeyType: 'next',
					submitBehavior: 'submit',
					onSubmitEditing: () => setFocus('address'),
				})}
				{textField('address', 'Dirección (opcional)', {
					autoComplete: 'street-address',
					returnKeyType: 'done',
					onSubmitEditing: submit,
				})}

				<View>
					<TextInput
						mode="outlined"
						label="Fecha de nacimiento"
						value={formatLongDate(parseDateOnly(user.birthDate))}
						disabled
					/>
					<HelperText type="info">La fecha de nacimiento no se puede modificar.</HelperText>
				</View>

				<Button
					mode="contained"
					onPress={submit}
					loading={isSubmitting}
					disabled={isSubmitting || !isDirty}
					style={styles.submit}
				>
					Guardar cambios
				</Button>
			</ScrollView>

			<ConfirmDialog
				visible={pendingLeave !== null}
				title="¿Descartar los cambios?"
				message="Tenés cambios sin guardar."
				confirmLabel="Descartar"
				cancelLabel="Seguir editando"
				destructive
				onConfirm={() => {
					const leave = pendingLeave;
					setPendingLeave(null);
					reset();
					disablePrevention();
					leave?.();
				}}
				onDismiss={() => setPendingLeave(null)}
			/>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	flex: {
		flex: 1,
	},
	content: {
		padding: 16,
		gap: 4,
	},
	submit: {
		marginTop: 12,
	},
});
