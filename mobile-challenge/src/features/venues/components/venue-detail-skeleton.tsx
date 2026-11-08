import { StyleSheet, View } from 'react-native';

import { Skeleton } from '@/shared/components/skeleton';

export function VenueDetailSkeleton() {
	return (
		<View style={styles.container}>
			<Skeleton width="60%" height={28} />
			<Skeleton width="80%" height={16} />
			<Skeleton width="70%" height={16} />
			<Skeleton height={48} />
			<View style={styles.section}>
				<Skeleton width="40%" height={20} />
				{[0, 1, 2, 3, 4, 5, 6].map((index) => (
					<Skeleton key={index} height={16} />
				))}
			</View>
			<Skeleton height={140} radius={12} />
			<Skeleton height={140} radius={12} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 16,
		gap: 12,
	},
	section: {
		gap: 8,
		marginVertical: 8,
	},
});
