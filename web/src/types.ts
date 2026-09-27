export type Confidence = "literary" | "disputed" | "anchored" | "firm";

export type Epoch = {
  id: string;
  label_ru: string;
  order: number;
  year_start: number | null;
  year_end: number | null;
  span_note_ru: string;
  confidence: Confidence;
  anchors: string[];
  date_basis_ru: string;
  josephus_role: "none" | "background" | "point" | "primary";
};

export type Source = {
  id: string;
  label_ru: string;
  type: string;
  tradition_note_ru?: string;
  urls?: string[];
};

export type Citation = {
  id: string;
  label_ru: string;
  kind: "verse" | "inscription" | "josephus" | "web" | "handbook";
  source_id?: string;
  url?: string;
  ref?: string;
};

export type Claim = {
  id: string;
  epoch_id: string;
  statement_ru: string;
  confidence: Confidence;
  date_min: number | null;
  date_max: number | null;
  source_ids: string[];
  dissent_ru?: string;
  citations?: Citation[];
};

export type Place = {
  id: string;
  label_ru: string;
  epoch_ids: string[];
  confidence: Confidence;
  note_ru?: string;
  source_ids: string[];
  person_ids?: string[];
  citations?: Citation[];
};

export type HistEvent = {
  id: string;
  label_ru: string;
  epoch_id: string;
  place_ids?: string[];
  person_ids?: string[];
  date_min: number | null;
  date_max: number | null;
  confidence: Confidence;
  statement_ru: string;
  source_ids: string[];
  note_ru?: string;
  citations?: Citation[];
};

export type CandidatePerson = {
  id: string;
  label_ru: string;
  theographic_slug?: string;
  epoch_ids: string[];
  confidence: Confidence;
  note_ru?: string;
  upstream?: {
    found?: boolean;
    name?: string | null;
    alsoCalled?: string[];
    dictionaryLink?: string | null;
  };
};

export type InteractionRelation =
  | "kin"
  | "appoints"
  | "serves"
  | "opposes"
  | "meets"
  | "writes_to"
  | "judges"
  | "succeeds"
  | "allies"
  | "mentions";

export type Interaction = {
  id: string;
  epoch_id: string;
  from_person_id: string;
  to_person_id: string;
  relation: InteractionRelation;
  label_ru: string;
  confidence: Confidence;
  source_ids: string[];
  note_ru?: string;
  citations?: Citation[];
};

export const relationLabelRu: Record<InteractionRelation, string> = {
  kin: "родство",
  appoints: "назначает",
  serves: "служит",
  opposes: "противостоит",
  meets: "встречает",
  writes_to: "пишет",
  judges: "судит",
  succeeds: "наследует / сменяет",
  allies: "союз",
  mentions: "упоминает / свидетельствует",
};

export function formatYear(y: number | null | undefined): string {
  if (y === null || y === undefined) return "—";
  if (y < 0) return `${Math.abs(y)} до н.э.`;
  if (y === 0) return "1 н.э.?";
  return `${y} н.э.`;
}

export function formatSpan(
  start: number | null,
  end: number | null,
  note?: string
): string {
  if (start === null && end === null) return note || "без абсолютных дат";
  return `${formatYear(start)} – ${formatYear(end)}`;
}

export const confidenceLabel: Record<Confidence, string> = {
  literary: "literary-only",
  disputed: "disputed",
  anchored: "anchored",
  firm: "firm",
};
