/**
 * Shortest path between persons via undirected interaction edges.
 */
export type Edge = {
  id: string;
  from_person_id: string;
  to_person_id: string;
};

export function shortestPersonPath(
  edges: Edge[],
  fromId: string,
  toId: string
): string[] | null {
  if (fromId === toId) return [fromId];
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    if (!adj.has(e.from_person_id)) adj.set(e.from_person_id, []);
    if (!adj.has(e.to_person_id)) adj.set(e.to_person_id, []);
    adj.get(e.from_person_id)!.push(e.to_person_id);
    adj.get(e.to_person_id)!.push(e.from_person_id);
  }
  const queue = [fromId];
  const prev = new Map<string, string | null>([[fromId, null]]);
  while (queue.length) {
    const cur = queue.shift()!;
    for (const nxt of adj.get(cur) ?? []) {
      if (prev.has(nxt)) continue;
      prev.set(nxt, cur);
      if (nxt === toId) {
        const path = [toId];
        let p: string | null | undefined = toId;
        while (p && p !== fromId) {
          p = prev.get(p) ?? null;
          if (p) path.push(p);
        }
        return path.reverse();
      }
      queue.push(nxt);
    }
  }
  return null;
}
