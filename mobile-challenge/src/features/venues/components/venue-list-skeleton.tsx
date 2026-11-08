import { StyleSheet, View } from 'react-native';
import { Card } from 'react-native-paper';

import { Skeleton } from '@/shared/components/skeleton';

export function VenueListSkeleton() {
	return (
		<View style={styles.list}>
			{[0, 1, 2].map((index) => (
				<Card key={index} mode="elevated">
					<Card.Content style={styles.content}>
						<Skeleton width="60%" height={24} />
						<Skeleton width="80%" height={16} />
						<Skeleton width="70%" height={16} />
					</Card.Content>
				</Card>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	list: {
		padding: 16,
		gap: 12,
	},
	content: {
		gap: 10,
	},
});
