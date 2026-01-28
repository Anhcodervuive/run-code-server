// Number of cities
const N = 15

// ---------- Seeded random (deterministic) ----------
let seed = 123456
const rand = () => {
	seed = (seed * 16807) % 2147483647
	return seed / 2147483647
}

// ---------- Distance matrix ----------
const dist = Array.from({ length: N }, () =>
	Array.from({ length: N }, () => Math.floor(rand() * 100)),
)

// ---------- DP table ----------
// dp[mask][u]: minimum cost to visit cities in "mask" and end at city u
const dp = Array.from({ length: 1 << N }, () => Array(N).fill(Infinity))

// Start from city 0
dp[1][0] = 0

// ---------- DP over subsets ----------
for (let mask = 1; mask < 1 << N; mask++) {
	for (let u = 0; u < N; u++) {
		if (!(mask & (1 << u))) continue

		const curCost = dp[mask][u]
		if (curCost === Infinity) continue

		for (let v = 0; v < N; v++) {
			if (mask & (1 << v)) continue

			const nextMask = mask | (1 << v)
			dp[nextMask][v] = Math.min(dp[nextMask][v], curCost + dist[u][v])
		}
	}
}

// ---------- Result ----------
const fullMask = (1 << N) - 1
const answer = Math.min(...dp[fullMask])

console.log('TSP minimum cost:', answer)
