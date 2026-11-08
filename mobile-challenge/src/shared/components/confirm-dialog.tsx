import { Button, Dialog, Portal, Text, useTheme } from 'react-native-paper';

type ConfirmDialogProps = {
	visible: boolean;
	title: string;
	message?: string;
	confirmLabel: string;
	cancelLabel?: string;
	/** Paints the confirm action with the error color (e.g. discarding changes). */
	destructive?: boolean;
	onConfirm: () => void;
	onDismiss: () => void;
};

export function ConfirmDialog({
	visible,
	title,
	message,
	confirmLabel,
	cancelLabel = 'Cancelar',
	destructive = false,
	onConfirm,
	onDismiss,
}: ConfirmDialogProps) {
	const theme = useTheme();

	return (
		<Portal>
			<Dialog visible={visible} onDismiss={onDismiss}>
				<Dialog.Title>{title}</Dialog.Title>
				{message && (
					<Dialog.Content>
						<Text variant="bodyMedium">{message}</Text>
					</Dialog.Content>
				)}
				<Dialog.Actions>
					<Button onPress={onDismiss}>{cancelLabel}</Button>
					<Button onPress={onConfirm} textColor={destructive ? theme.colors.error : undefined}>
						{confirmLabel}
					</Button>
				</Dialog.Actions>
			</Dialog>
		</Portal>
	);
}
