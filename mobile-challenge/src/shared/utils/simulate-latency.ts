/** Fixed delay of the local repositories, so loading states are visible as with the API. */
export const SIMULATED_LATENCY_MS = 500;

export function simulateLatency(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
}
