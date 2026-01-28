// Number of nodes
const N = 50000

// Build adjacency list
const adj = Array.from({ length: N }, () => [])

// Create a DAG: each node points to 3 random nodes with higher index
for (let i = 0; i < N; i++) {
	for (let j = 0; j < 3; j++) {
		const offset = Math.floor(Math.random() * (N - i - 1 || 1))
		const v = i + 1 + offset
		if (v < N) {
			adj[i].push(v)
		}
	}
}

// Compute indegrees
const indeg = Array(N).fill(0)
for (let u = 0; u < N; u++) {
	for (const v of adj[u]) {
		indeg[v]++
	}
}

// Kahn's algorithm for topological sort
const queue = []
for (let i = 0; i < N; i++) {
	if (indeg[i] === 0) {
		queue.push(i)
	}
}

const topo = []
while (queue.length > 0) {
	const u = queue.shift()
	topo.push(u)
	for (const v of adj[u]) {
		indeg[v]--
		if (indeg[v] === 0) {
			queue.push(v)
		}
	}
}

// Longest path DP on DAG
const dp = Array(N).fill(0)
for (const u of topo) {
	for (const v of adj[u]) {
		dp[v] = Math.max(dp[v], dp[u] + 1)
	}
}

// Result
const longestPath = Math.max(...dp)
console.log('Longest path length:', longestPath)
