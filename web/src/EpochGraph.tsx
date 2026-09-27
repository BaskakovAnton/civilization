import { useMemo, useState } from "react";
import type { CandidatePerson, Confidence, Interaction } from "./types";
import {
  confidenceHintRu,
  confidenceLabel,
  relationLabelRu,
} from "./types";
import { ConfPill } from "./HoverTip";

type Props = {
  people: CandidatePerson[];
  interactions: Interaction[];
  selectedPersonId: string | null;
  onSelectPerson: (id: string | null) => void;
  /** Soft highlight from claim crosslink (does not replace selection). */
  relatedPersonIds?: string[];
  /** Scroll/focus an interaction card in the list below. */
  onFocusInteraction?: (id: string) => void;
};

type NodePos = { id: string; x: number; y: number; label: string };

type TipState = {
  title: string;
  lines: string[];
};

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

function personTip(p: CandidatePerson): TipState {
  return {
    title: p.label_ru,
    lines: [
      `${confidenceLabel[p.confidence]} — ${confidenceHintRu[p.confidence]}`,
      p.note_ru || "",
    ].filter(Boolean),
  };
}

function edgeTip(
  i: Interaction,
  from?: CandidatePerson,
  to?: CandidatePerson
): TipState {
  const a = from?.label_ru ?? i.from_person_id;
  const b = to?.label_ru ?? i.to_person_id;
  return {
    title: `${a} → ${b}`,
    lines: [
      `${relationLabelRu[i.relation]} · ${confidenceLabel[i.confidence]}`,
      confidenceHintRu[i.confidence],
      i.label_ru,
      i.note_ru || "",
    ].filter(Boolean),
  };
}

export default function EpochGraph({
  people,
  interactions,
  selectedPersonId,
  onSelectPerson,
  relatedPersonIds = [],
  onFocusInteraction,
}: Props) {
  const nodes = useMemo(() => layout(people), [people]);
  const byId = useMemo(
    () => Object.fromEntries(nodes.map((n) => [n.id, n])),
    [nodes]
  );
  const personMap = useMemo(
    () => Object.fromEntries(people.map((p) => [p.id, p])),
    [people]
  );
  const related = useMemo(
    () => new Set(relatedPersonIds),
    [relatedPersonIds]
  );
  const [tip, setTip] = useState<TipState | null>(null);
  const [pinnedTip, setPinnedTip] = useState(false);

  const selectedPerson = selectedPersonId
    ? personMap[selectedPersonId]
    : undefined;

  const selectedEdges = useMemo(() => {
    if (!selectedPersonId) return [];
    return interactions.filter(
      (i) =>
        i.from_person_id === selectedPersonId ||
        i.to_person_id === selectedPersonId
    );
  }, [interactions, selectedPersonId]);

  if (people.length === 0) {
    return <p className="empty">Нет лиц для графа в этой эпохе.</p>;
  }

  const activeEdge = (i: Interaction) =>
    !selectedPersonId ||
    i.from_person_id === selectedPersonId ||
    i.to_person_id === selectedPersonId;

  const showTip = (next: TipState, pin = false) => {
    setTip(next);
    if (pin) setPinnedTip(true);
  };

  const clearTip = (fromPin = false) => {
    if (pinnedTip && !fromPin) return;
    setTip(null);
    if (fromPin) setPinnedTip(false);
  };

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
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy) || 1;
          const pad = 28;
          const x1 = a.x + (dx / len) * pad;
          const y1 = a.y + (dy / len) * pad;
          const x2 = b.x - (dx / len) * pad;
          const y2 = b.y - (dy / len) * pad;
          const confClass = `edge-${i.confidence as Confidence}`;
          const tipData = edgeTip(
            i,
            personMap[i.from_person_id],
            personMap[i.to_person_id]
          );
          return (
            <g
              key={i.id}
              className={`graph-edge ${confClass}${on ? " on" : " dim"}`}
              onMouseEnter={() => showTip(tipData)}
              onMouseLeave={() => clearTip()}
              onClick={(e) => {
                e.stopPropagation();
                showTip(tipData, true);
                onFocusInteraction?.(i.id);
              }}
              style={{ cursor: "pointer" }}
            >
              <line
                className="edge-hit"
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
              />
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
          const person = personMap[n.id];
          const selected = selectedPersonId === n.id;
          const claimRelated = related.has(n.id);
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
          const dimByPerson = Boolean(selectedPersonId) && !linked;
          const dimByClaim =
            related.size > 0 && !claimRelated && !selected;
          const tipData = person ? personTip(person) : { title: n.label, lines: [] };
          return (
            <g
              key={n.id}
              className={
                selected
                  ? "graph-node selected"
                  : claimRelated
                    ? "graph-node related"
                    : dimByPerson || dimByClaim
                      ? "graph-node dim"
                      : "graph-node"
              }
              transform={`translate(${n.x},${n.y})`}
              onMouseEnter={() => showTip(tipData)}
              onMouseLeave={() => clearTip()}
              onClick={() => {
                const next = selectedPersonId === n.id ? null : n.id;
                onSelectPerson(next);
                if (next && person) showTip(personTip(person), true);
                else clearTip(true);
              }}
              style={{ cursor: "pointer" }}
            >
              <circle r={22} />
              <text className="node-label" y={5} textAnchor="middle">
                {shortenLabel(n.label)}
              </text>
            </g>
          );
        })}
      </svg>

      {tip ? (
        <div className="graph-float-tip" role="tooltip">
          <strong>{tip.title}</strong>
          {tip.lines.map((line, idx) => (
            <span key={idx}>{line}</span>
          ))}
          {pinnedTip ? (
            <button
              type="button"
              className="linkish"
              onClick={() => clearTip(true)}
            >
              закрыть подсказку
            </button>
          ) : null}
        </div>
      ) : null}

      <p className="graph-hint">
        <span className="graph-hint-desktop">
          Наведите на лицо или ребро · клик выбирает · цвет ребра = уверенность
        </span>
        <span className="graph-hint-mobile">
          Нажмите лицо или ребро · цвет = уверенность
        </span>
        {selectedPersonId
          ? ` · ${byId[selectedPersonId]?.label ?? selectedPersonId}`
          : ""}
        {selectedPersonId ? (
          <>
            {" · "}
            <button
              type="button"
              className="linkish"
              onClick={() => {
                onSelectPerson(null);
                clearTip(true);
              }}
            >
              сбросить
            </button>
          </>
        ) : null}
      </p>

      {selectedPerson ? (
        <div className="graph-inspector">
          <div className="graph-inspector-head">
            <strong>{selectedPerson.label_ru}</strong>
            <ConfPill level={selectedPerson.confidence} />
          </div>
          {selectedPerson.note_ru ? (
            <p className="graph-inspector-note">{selectedPerson.note_ru}</p>
          ) : null}
          {selectedEdges.length === 0 ? (
            <p className="empty">Нет рёбер у этого лица в эпохе.</p>
          ) : (
            <ul className="graph-inspector-edges">
              {selectedEdges.map((i) => {
                const from = personMap[i.from_person_id]?.label_ru ?? i.from_person_id;
                const to = personMap[i.to_person_id]?.label_ru ?? i.to_person_id;
                return (
                  <li key={i.id}>
                    <button
                      type="button"
                      className="graph-inspector-edge"
                      onClick={() => onFocusInteraction?.(i.id)}
                    >
                      <span>
                        {from} → {to}
                      </span>
                      <span className="pill relation">
                        {relationLabelRu[i.relation]}
                      </span>
                      <span className={`pill conf-${i.confidence}`}>
                        {confidenceLabel[i.confidence]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}

      <div className="graph-edge-legend" aria-label="Легенда рёбер">
        {(["firm", "anchored", "disputed", "literary"] as Confidence[]).map(
          (c) => (
            <span key={c} className={`graph-legend-item edge-${c}`}>
              <i />
              {confidenceLabel[c]}
            </span>
          )
        )}
      </div>
    </div>
  );
}
