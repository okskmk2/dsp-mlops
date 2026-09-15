// Drops nodes of the given kinds and rewires edges so upstream/downstream
// nodes connect directly through them (e.g. dataset -> job -> model becomes dataset -> model).
export function collapseLineage(nodes, edges, dropKinds = ['job']) {
  const dropSet = new Set(dropKinds)
  const keepNodes = nodes.filter((n) => !dropSet.has(n.kind))
  const keepIds = new Set(keepNodes.map((n) => n.id))

  const adjacency = new Map()
  for (const e of edges) {
    if (!adjacency.has(e.from)) adjacency.set(e.from, [])
    adjacency.get(e.from).push(e.to)
  }

  function reachableKeptTargets(startId) {
    const out = new Set()
    const visited = new Set()
    const stack = [...(adjacency.get(startId) || [])]
    while (stack.length) {
      const cur = stack.pop()
      if (visited.has(cur)) continue
      visited.add(cur)
      if (keepIds.has(cur)) out.add(cur)
      else for (const next of adjacency.get(cur) || []) stack.push(next)
    }
    return out
  }

  const seen = new Set()
  const resultEdges = []
  for (const n of keepNodes) {
    for (const target of reachableKeptTargets(n.id)) {
      const key = `${n.id}->${target}`
      if (seen.has(key)) continue
      seen.add(key)
      resultEdges.push({ from: n.id, to: target })
    }
  }

  return { nodes: keepNodes, edges: resultEdges }
}
