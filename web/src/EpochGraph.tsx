import { useMemo } from "react";
import type { CandidatePerson, Interaction } from "./types";
import { relationLabelRu } from "./types";

type Props = {
  people: CandidatePerson[];
  interactions: Interaction[];
  selectedPersonId: string | null;
  onSelectPerson: (id: string | null) => void;
};

type NodePos = { id: string; x: number; y: number; label: string };

const W = 520;
const H = 300;
const CX = W / 2;
const CY = H / 2 + 8;
const R = 105;

function layout(people: CandidatePerson[]): NodePos[] {
  const n = people.length;
  if (n === 0) return [];
  if (n === 1) {
    return [{ id: people[0].id, x: CX, y: CY, label: people[0].label_ru }];
  }
  return people.map((p, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return {
      id: p.id,
      x: CX + R * Math.cos(a),
      y: CY + R * Math.sin(a),
      label: p.label_ru,
    };
  });
}

function shortenLabel(s: string, max = 14): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

export default function EpochGraph({
  people,
  interactions,
  selectedPersonId,
  onSelectPerson,
}: Props) {
  const nodes = useMemo(() => layout(people), [people]);
  const byId = useMemo(
    () => Object.fromEntries(nodes.map((n) => [n.id, n])),
    [nodes]
  );

  if (people.length === 0) {
    return <p className="empty">Нет лиц для графа в этой эпохе.</p>;
  }

  const activeEdge = (i: Interaction) =>
    !selectedPersonId ||
    i.from_person_id === selectedPersonId ||
    i.to_person_id === selectedPersonId;

  return (
    <div className="graph-wrap">
      <svg
        className="epoch-graph"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Граф лиц эпохи"
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
          </marker>
        </defs>

        {interactions.map((i) => {
          const a = byId[i.from_person_id];
          const b = byId[i.to_person_id];
          if (!a || !b) return null;
          const on = activeEdge(i);
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          // shorten line so arrow stops at node rim
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy) || 1;
          const pad = 28;
          const x1 = a.x + (dx / len) * pad;
          const y1 = a.y + (dy / len) * pad;
          const x2 = b.x - (dx / len) * pad;
          const y2 = b.y - (dy / len) * pad;
          return (
            <g
              key={i.id}
              className={on ? "graph-edge on" : "graph-edge dim"}
            >
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                markerEnd="url(#arrow)"
              />
              <text x={mx} y={my - 6} className="edge-label">
                {relationLabelRu[i.relation]}
              </text>
            </g>
          );
        })}

        {nodes.map((n) => {
          const selected = selectedPersonId === n.id;
          const linked =
            !selectedPersonId ||
            selected ||
            interactions.some(
              (i) =>
                (i.from_person_id === selectedPersonId &&
                  i.to_person_id === n.id) ||
                (i.to_person_id === selectedPersonId &&
                  i.from_person_id === n.id)
            );
          return (
            <g
              key={n.id}
              className={
                selected
                  ? "graph-node selected"
                  : linked
                    ? "graph-node"
                    : "graph-node dim"
              }
              transform={`translate(${n.x},${n.y})`}
              onClick={() =>
                onSelectPerson(selectedPersonId === n.id ? null : n.id)
              }
              style={{ cursor: "pointer" }}
            >
              <circle r={22} />
              <text className="node-label" y={5} textAnchor="middle">
                {shortenLabel(n.label)}
              </text>
              <title>{n.label}</title>
            </g>
          );
        })}
      </svg>
      <p className="graph-hint">
        Клик по лицу подсвечивает связи
        {selectedPersonId
          ? ` · выбрано: ${byId[selectedPersonId]?.label ?? selectedPersonId}`
          : ""}
        {selectedPersonId ? (
          <>
            {" · "}
            <button
              type="button"
              className="linkish"
              onClick={() => onSelectPerson(null)}
            >
              сбросить
            </button>
          </>
        ) : null}
      </p>
    </div>
  );
}
