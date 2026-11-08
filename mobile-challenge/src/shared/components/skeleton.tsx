import { useEffect } from 'react';
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

type SkeletonProps = {
	width?: DimensionValue;
	height: number;
	radius?: number;
	style?: StyleProp<ViewStyle>;
};

/** Pulsing placeholder block for content that is loading. */
export function Skeleton({ width = '100%', height, radius = 8, style }: SkeletonProps) {
	const theme = useTheme();
	const opacity = useSharedValue(1);

	useEffect(() => {
		opacity.set(withRepeat(withTiming(0.4, { duration: 800 }), -1, true));
	}, [opacity]);

	const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.get() }));

	return (
		<Animated.View
			accessibilityLabel="Cargando"
			style={[
				{ width, height, borderRadius: radius, backgroundColor: theme.colors.surfaceVariant },
				animatedStyle,
				style,
			]}
		/>
	);
}
