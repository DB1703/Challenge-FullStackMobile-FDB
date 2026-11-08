import { EmptyState } from './empty-state';

type ErrorStateProps = {
	message: string;
	onRetry?: () => void;
};

/** Load error with an optional "Reintentar" action. */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
	return (
		<EmptyState
			icon="alert-circle-outline"
			title={message}
			message="Revisá tu conexión e intentá de nuevo."
			action={onRetry ? { label: 'Reintentar', onPress: onRetry } : undefined}
		/>
	);
}
