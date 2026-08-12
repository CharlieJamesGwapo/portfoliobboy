// ============================================================================
// heroGraph — the node/edge topology behind the hero "connected systems"
// visual.
//
// Both hero renderers consume this: the 2D canvas that paints immediately
// (see hero2d.js) and the Three.js scene that upgrades over it once it has
// loaded (see heroWebgl.js). Sharing the topology is what makes the crossfade
// between them read as one continuous graphic rather than two different
// pictures swapping.
//
// The layout is generated from a fixed seed rather than Math.random() so the
// graph is identical on every load, in both renderers, and in screenshots.
// ============================================================================

// mulberry32 — 32-bit seeded PRNG. Small, fast, good enough for layout jitter.
function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const GOLDEN_ANGLE = Math.PI * (1 + Math.sqrt(5))

/**
 * Build a deterministic 3D graph: one bright "core" node at the origin plus a
 * spherical-Fibonacci shell of satellites, wired to their nearest neighbours.
 *
 * @param {object}  options
 * @param {number}  options.count      total node count including the core
 * @param {number}  options.seed       PRNG seed; same seed ⇒ same graph
 * @param {number}  options.neighbours edges attempted per satellite node
 * @returns {{nodes: Array, edges: Array<[number, number]>, core: number}}
 */
export function buildHeroGraph({ count = 30, seed = 20260812, neighbours = 2 } = {}) {
  const random = mulberry32(seed)
  const total = Math.max(6, Math.round(count))

  const nodes = [{ x: 0, y: 0, z: 0, core: true, size: 1.75, seed: random() }]

  for (let i = 1; i < total; i += 1) {
    // Spherical Fibonacci distribution keeps the shell evenly covered no
    // matter how many nodes we ask for, so the mobile (sparser) graph still
    // looks like the desktop one rather than a lopsided cluster.
    const t = (i + 0.5) / total
    const phi = Math.acos(1 - 2 * t)
    const theta = GOLDEN_ANGLE * i
    const radius = 0.62 + random() * 0.42

    nodes.push({
      // Widened on x and flattened on y so the graph fills a landscape frame.
      x: Math.cos(theta) * Math.sin(phi) * radius * 1.28,
      y: Math.cos(phi) * radius * 0.82,
      z: Math.sin(theta) * Math.sin(phi) * radius,
      core: false,
      size: 0.66 + random() * 0.62,
      seed: random(),
    })
  }

  // Nearest-neighbour wiring. Deduplicated with a Set of sorted pairs so a
  // mutual "closest" relationship doesn't produce a doubled line — two
  // coincident additive lines render visibly brighter than their neighbours.
  const seen = new Set()
  const edges = []
  const addEdge = (a, b) => {
    if (a === b) return
    const key = a < b ? `${a}:${b}` : `${b}:${a}`
    if (seen.has(key)) return
    seen.add(key)
    edges.push([a, b])
  }

  const distance = (a, b) => {
    const dx = nodes[a].x - nodes[b].x
    const dy = nodes[a].y - nodes[b].y
    const dz = nodes[a].z - nodes[b].z
    return dx * dx + dy * dy + dz * dz
  }

  for (let i = 1; i < total; i += 1) {
    const ranked = []
    for (let j = 1; j < total; j += 1) {
      if (i === j) continue
      ranked.push([j, distance(i, j)])
    }
    ranked.sort((a, b) => a[1] - b[1])
    for (let k = 0; k < neighbours && k < ranked.length; k += 1) addEdge(i, ranked[k][0])

    // Every fourth satellite also reports to the core, which is what gives the
    // graphic its "everything routes through one system" reading.
    if (i % 4 === 1) addEdge(0, i)
  }

  return { nodes, edges, core: 0 }
}

// Palette, kept here so the two renderers can never drift apart.
export const HERO_COLORS = {
  mint: [0.404, 0.878, 0.757], // #67e0c1
  mintBright: [0.561, 0.941, 0.847], // #8ff0d8
  coral: [1.0, 0.612, 0.467], // #ff9c77
  coralBright: [1.0, 0.708, 0.58], // #ffb494
  signal: [0.961, 0.949, 0.914], // #f5f2e9
}

export const rgbString = ([r, g, b]) =>
  `${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}`
