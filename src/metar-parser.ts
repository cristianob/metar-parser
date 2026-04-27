type ParserError = Error & {
  tokenIndex?: number;
  token?: string | null;
};

export interface ParseWarning {
  message: string;
  token: string;
  tokenIndex: number;
}

type Maybe<T> = T | null;

export type ReportType = "METAR" | "SPECI";
export type CardinalDirection = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";
export type WindDirection = number | "VRB";
export type WindValueOperator = "P" | null;
export type CloudType = "clear" | "layer" | "obscuredCb";
export type TrendType = "NOSIG" | "BECMG" | "TEMPO";
export type TrendTimeKind = "FM" | "TL" | "AT";
export type AltimeterUnit = "hPa" | "inHg";
export type VisibilityUnit = "m" | "SM";
export type VerticalVisibilityUnit = "ft";
export type QfeUnit = "mmHg" | "hPa";

export interface ParsedAbbreviation {
  abbreviation: string;
  meaning: string;
}

export interface DateTimeGroup {
  raw: string;
  day: number;
  hour: number;
  minute: number;
  date: Date;
}

export interface ParsedWindSpeedPart {
  raw: string;
  value: number;
  greaterThan: boolean;
}

export interface WindVariationRange {
  raw?: string;
  min: number;
  max: number;
}

export interface WindGroup {
  raw: Maybe<string>;
  speed: Maybe<number>;
  gust: Maybe<number>;
  direction: Maybe<WindDirection>;
  variation: Maybe<true | WindVariationRange>;
  unit: Maybe<string>;
  speedOperator: WindValueOperator;
  gustOperator: WindValueOperator;
  calm: boolean;
}

export interface BaseVisibility {
  raw: string;
  value: Maybe<number>;
  unit: VisibilityUnit;
  unavailable: boolean;
  greaterThan?: boolean;
}

export interface VisibilityGroup extends BaseVisibility {
  lessThan: boolean;
  consumed: number;
}

export interface PrevailingVisibility {
  raw: string;
  value: Maybe<number>;
  unit: VisibilityUnit;
  greaterThan: boolean;
  lessThan: boolean;
  unavailable: boolean;
}

export interface DirectionalVisibility {
  raw: string;
  value: number;
  direction: CardinalDirection;
  unit: "m";
}

export interface VerticalVisibility {
  raw: string;
  value: Maybe<number>;
  unit: VerticalVisibilityUnit;
  unavailable: boolean;
}

export interface VisibilityBlock {
  prevailing: Maybe<PrevailingVisibility>;
  minimum: Maybe<DirectionalVisibility>;
  vertical: Maybe<VerticalVisibility>;
}

export interface RvrGroup {
  raw: string;
  runway: string;
  direction: Maybe<"L" | "R" | "C">;
  separator: "/";
  minIndicator: Maybe<"P" | "M">;
  minValue: Maybe<string>;
  variableIndicator: Maybe<"V">;
  maxIndicator: Maybe<"P" | "M">;
  maxValue: Maybe<string>;
  trend: Maybe<"N" | "U" | "D">;
  unitsOfMeasure: Maybe<"FT" | "M">;
  unit: string;
}

export interface RunwayStateGroup {
  raw: string;
  runway: string;
  direction: Maybe<"L" | "R" | "C">;
  cleared: boolean;
  fromRunway: Maybe<string>;
  depositCode: Maybe<string>;
  contaminationCode: Maybe<string>;
  depthCode: Maybe<string>;
  frictionCode: Maybe<string>;
}

export interface WeatherPhenomenon {
  code: string;
  description: string;
}

export interface WeatherGroup {
  raw: string;
  intensity: Maybe<string>;
  intensityDescription: Maybe<string>;
  descriptor: Maybe<string>;
  descriptorDescription: Maybe<string>;
  proximity: Maybe<string>;
  proximityDescription: Maybe<string>;
  phenomena: WeatherPhenomenon[];
}

export interface CloudClearGroup {
  raw: string;
  abbreviation: string;
  meaning: string;
  altitude: null;
  cumulonimbus: false;
  toweringCumulus: false;
  type: "clear";
}

export interface CloudLayerGroup {
  raw: string;
  abbreviation: string;
  meaning: string;
  altitude: Maybe<number>;
  cumulonimbus: boolean;
  toweringCumulus: boolean;
  type: "layer";
  baseUnavailable: boolean;
  convectiveType: Maybe<"CB" | "TCU">;
  convectiveTypeUnavailable?: true;
}

export interface ObscuredCbGroup {
  raw: string;
  abbreviation: "CB";
  meaning: string;
  altitude: null;
  cumulonimbus: true;
  toweringCumulus: false;
  type: "obscuredCb";
  unavailable: true;
}

export interface CloudVerticalVisibilityGroup {
  raw: string;
  abbreviation: "VV";
  meaning: string;
  altitude: Maybe<number>;
  cumulonimbus: false;
  toweringCumulus: false;
  type: "verticalVisibility";
  verticalVisibility: Maybe<number>;
  unavailable: boolean;
}

export type CloudGroup = CloudClearGroup | CloudLayerGroup | ObscuredCbGroup;
type ParsedCloudToken = CloudGroup | CloudVerticalVisibilityGroup;

export interface TemperatureDewpointParse {
  raw: string;
  temperature: number;
  dewpoint: number;
}

export interface TemperatureGroup {
  raw: Maybe<string>;
  air: Maybe<number>;
  dewpoint: Maybe<number>;
}

export interface AltimeterParse {
  raw: string;
  value: number;
  unit: AltimeterUnit;
  altimeterInHg: number;
  altimeterInHpa: number;
}

export interface AltimeterGroup {
  raw: Maybe<string>;
  value: Maybe<number>;
  unit: Maybe<AltimeterUnit>;
  inHg: Maybe<number>;
  hPa: Maybe<number>;
}

export interface RecentWeatherGroup {
  raw: string;
  code: string;
  description: Maybe<string>;
}

export interface WindShearGroup {
  raw: string;
  allRunways: boolean;
  runway: Maybe<string>;
}

export interface SeaStateGroup {
  raw: string;
  seaSurfaceTemperatureC: Maybe<number>;
  seaConditionCode: Maybe<number>;
  waveHeightDm: Maybe<number>;
}

export interface QfeGroup {
  raw: string;
  value: number;
  unit: QfeUnit;
  description: string;
}

export interface RemarksGroup {
  raw: string;
  tokens: string[];
  automatic: boolean;
  qfe: Maybe<QfeGroup>;
  unparsedTokens: string[];
}

export interface TrendTimeIndicator {
  raw: string;
  kind: TrendTimeKind;
  value: string;
}

export interface TrendGroup {
  raw: string;
  type: TrendType;
  timeIndicators: TrendTimeIndicator[];
  wind: Maybe<WindGroup>;
  visibility: Maybe<PrevailingVisibility>;
  weather: WeatherGroup[];
  clouds: CloudGroup[];
  cavok: boolean;
  unparsedTokens: string[];
}

export interface MetarParseResult {
  original: string;
  type: ReportType;
  station: Maybe<string>;
  time: Maybe<Date>;
  auto: boolean;
  correction: boolean | string;
  wind: WindGroup;
  cavok: boolean;
  visibility: VisibilityBlock;
  rvr: Maybe<RvrGroup[]>;
  runwayState: Maybe<RunwayStateGroup[]>;
  weather: Maybe<WeatherGroup[]>;
  trend: Maybe<TrendGroup[]>;
  clouds: Maybe<CloudGroup[]>;
  temperature: TemperatureGroup;
  altimeter: AltimeterGroup;
  recentWeather: Maybe<RecentWeatherGroup[]>;
  windShear: Maybe<WindShearGroup[]>;
  seaState: Maybe<SeaStateGroup>;
  remarks: Maybe<RemarksGroup>;
  errors: ParseWarning[];
}

export interface TrendParseResult {
  consumed: number;
  value: TrendGroup;
}

export interface WindShearParseResult {
  consumed: number;
  value: WindShearGroup;
}

const REPORT_TYPES = new Set(["METAR", "SPECI"]);
const CARDINAL_DIRECTIONS = new Set(["N", "NE", "E", "SE", "S", "SW", "W", "NW"]);

const CLOUDS = {
  NCD: "no clouds detected",
  NSC: "no significant clouds",
  SKC: "sky clear",
  CLR: "no clouds below 12,000 ft",
  FEW: "few",
  SCT: "scattered",
  BKN: "broken",
  OVC: "overcast",
  VV: "vertical visibility",
};

const WEATHER = {
  "-": "light intensity",
  "+": "heavy intensity",
  VC: "in the vicinity",
  MI: "shallow",
  PR: "partial",
  BC: "patches",
  DR: "low drifting",
  BL: "blowing",
  SH: "showers",
  TS: "thunderstorm",
  FZ: "freezing",
  DZ: "drizzle",
  RA: "rain",
  SN: "snow",
  SG: "snow grains",
  IC: "ice crystals",
  PL: "ice pellets",
  GR: "hail",
  GS: "small hail",
  UP: "unknown precipitation",
  FG: "fog",
  VA: "volcanic ash",
  BR: "mist",
  HZ: "haze",
  DU: "widespread dust",
  FU: "smoke",
  SA: "sand",
  PY: "spray",
  SQ: "squall",
  PO: "dust or sand whirls",
  DS: "duststorm",
  SS: "sandstorm",
  FC: "funnel cloud",
};

const RECENT_WEATHER = {
  REBLSN: "moderate or heavy blowing snow",
  REDS: "dust storm",
  REFC: "funnel cloud",
  REFZDZ: "freezing drizzle",
  REFZRA: "freezing rain",
  REFZUP: "freezing unidentified precipitation",
  REGP: "moderate or heavy snow pellets",
  REGR: "moderate or heavy hail",
  REGS: "moderate or heavy small hail",
  REIC: "moderate or heavy ice crystals",
  REPL: "moderate or heavy ice pellets",
  RERA: "moderate or heavy rain",
  RESG: "moderate or heavy snow grains",
  RESHGR: "moderate or heavy hail showers",
  RESHGS: "moderate or heavy small hail showers",
  RESHPL: "moderate or heavy ice pellet showers",
  RESHRA: "moderate or heavy rain showers",
  RESHSN: "moderate or heavy snow showers",
  RESHUP: "moderate or heavy unidentified precipitation showers",
  RESN: "moderate or heavy snow",
  RESS: "sandstorm",
  RETS: "thunderstorm",
  RETSUP: "thunderstorm with unidentified precipitation",
  REUP: "unidentified precipitation",
  REVA: "volcanic ash",
};

const WEATHER_DESCRIPTOR_CODES = new Set(["MI", "PR", "BC", "DR", "BL", "SH", "TS", "FZ"]);
const WEATHER_PHENOMENA_CODES = new Set([
  "DZ",
  "RA",
  "SN",
  "SG",
  "IC",
  "PL",
  "GR",
  "GS",
  "UP",
  "FG",
  "BR",
  "HZ",
  "DU",
  "FU",
  "SA",
  "VA",
  "PY",
  "PO",
  "SQ",
  "FC",
  "DS",
  "SS",
]);

const MAX_WEATHER_KEY_LENGTH = Object.keys(WEATHER).reduce((max, key) => Math.max(max, key.length), 0);

function createError(message: string, tokenIndex: number, token: string | null): ParserError {
  const err = new Error(message) as ParserError;
  err.tokenIndex = tokenIndex;
  err.token = token;
  return err;
}

function toInt(value: string): number {
  return parseInt(value, 10);
}

function normalizeInput(input: unknown): string {
  return String(input || "")
    .trim()
    .replace(/\s+/g, " ");
}

function tokenize(input: unknown): string[] {
  return normalizeInput(input)
    .split(" ")
    .filter(Boolean);
}

function parseAbbreviation(source: string | undefined, map: Record<string, string>): ParsedAbbreviation | null {
  if (!source) return null;
  for (let length = Math.min(MAX_WEATHER_KEY_LENGTH, source.length); length >= 1; length--) {
    const abbreviation = source.slice(0, length);
    const meaning = map[abbreviation];
    if (meaning) {
      return {
        abbreviation,
        meaning,
      };
    }
  }
  return null;
}

function parseWeatherAbbreviations(token: string | undefined, result: ParsedAbbreviation[] = []): ParsedAbbreviation[] | null {
  const parsed = parseAbbreviation(token, WEATHER);
  if (!parsed) {
    return token.length === 0 ? result : null;
  }

  result.push(parsed);
  return parseWeatherAbbreviations(token.slice(parsed.abbreviation.length), result);
}

function buildReportTime(day: number, hour: number, minute: number): Date {
  const now = new Date();
  const time = new Date(now.getTime());
  time.setUTCSeconds(0, 0);
  time.setUTCDate(day);
  time.setUTCHours(hour, minute, 0, 0);
  return time;
}

function parseDateTimeGroup(token: string | undefined): DateTimeGroup | null {
  const match = /^(\d{2})(\d{2})(\d{2})Z$/.exec(token);
  if (!match) return null;

  const day = toInt(match[1]);
  const hour = toInt(match[2]);
  const minute = toInt(match[3]);

  return {
    raw: token,
    day,
    hour,
    minute,
    date: buildReportTime(day, hour, minute),
  };
}

function parseCorrectionToken(token: string | undefined): boolean | string | null {
  if (!token) return null;
  if (token === "COR") return true;
  if (/^CC[A-Z0-9]?$/.test(token)) {
    return token.length > 2 ? token.slice(2) : true;
  }
  return null;
}

function parseWindSpeedPart(raw: string | undefined): ParsedWindSpeedPart | null {
  if (!raw) return null;
  return {
    raw,
    value: toInt(raw.replace(/^P/, "")),
    greaterThan: raw.startsWith("P"),
  };
}

function parseWind(token: string | undefined): WindGroup | null {
  const match = /^(VRB|\d{3}|000)(P?\d{2,3}|P99)(G(P?\d{2,3}|P99))?([A-Z]{2,4})$/.exec(token);
  if (!match) return null;

  const speed = parseWindSpeedPart(match[2]);
  const gust = parseWindSpeedPart(match[4]);
  const direction = match[1] === "VRB" ? "VRB" : toInt(match[1]);

  return {
    raw: token,
    speed: speed ? speed.value : null,
    gust: gust ? gust.value : null,
    direction,
    variation: match[1] === "VRB" ? true : null,
    unit: match[5],
    speedOperator: speed && speed.greaterThan ? "P" : null,
    gustOperator: gust && gust.greaterThan ? "P" : null,
    calm: match[1] === "000" && match[2] === "00",
  };
}

function parseWindVariation(token: string | undefined): WindVariationRange | null {
  const match = /^(\d{3})V(\d{3})$/.exec(token);
  if (!match) return null;
  return {
    raw: token,
    min: toInt(match[1]),
    max: toInt(match[2]),
  };
}

function parseVisibility(token: string | undefined): BaseVisibility | null {
  if (token === "////") {
    return {
      raw: token,
      value: null,
      unit: "m",
      unavailable: true,
    };
  }

  if (/^\d{4}$/.test(token)) {
    return {
      raw: token,
      value: toInt(token),
      unit: "m",
      unavailable: false,
    };
  }

  const statuteMatch = /^(P?\d+)(SM)$/.exec(token);
  if (statuteMatch) {
    return {
      raw: token,
      value: toInt(statuteMatch[1].replace(/^P/, "")),
      unit: statuteMatch[2] as VisibilityUnit,
      unavailable: false,
      greaterThan: statuteMatch[1].startsWith("P"),
    };
  }

  return null;
}

function parseFraction(raw: string | undefined): number | null {
  const match = /^(\d+)\/(\d+)$/.exec(raw || "");
  if (!match) return null;
  return toInt(match[1]) / toInt(match[2]);
}

function parseVisibilityGroup(token: string | undefined, nextToken: string | undefined): VisibilityGroup | null {
  const metric = parseVisibility(token);
  if (metric) {
    return {
      ...metric,
      consumed: 1,
      lessThan: false,
    };
  }

  let match = /^(P|M)?(\d+)SM$/.exec(token || "");
  if (match) {
    return {
      raw: token,
      value: toInt(match[2]),
      unit: "SM",
      unavailable: false,
      greaterThan: match[1] === "P",
      lessThan: match[1] === "M",
      consumed: 1,
    };
  }

  match = /^(P|M)?(\d+)\/(\d+)SM$/.exec(token || "");
  if (match) {
    return {
      raw: token,
      value: toInt(match[2]) / toInt(match[3]),
      unit: "SM",
      unavailable: false,
      greaterThan: match[1] === "P",
      lessThan: match[1] === "M",
      consumed: 1,
    };
  }

  const whole = /^\d+$/.test(token || "") ? toInt(token) : null;
  const fractionMatch = /^(\d+)\/(\d+)SM$/.exec(nextToken || "");
  if (whole !== null && fractionMatch) {
    return {
      raw: `${token} ${nextToken}`,
      value: whole + parseFraction(`${fractionMatch[1]}/${fractionMatch[2]}`),
      unit: "SM",
      unavailable: false,
      greaterThan: false,
      lessThan: false,
      consumed: 2,
    };
  }

  return null;
}

function parseDirectionalVisibility(token: string | undefined): DirectionalVisibility | null {
  const match = /^(\d{4})(N|NE|E|SE|S|SW|W|NW)$/.exec(token);
  if (!match) return null;
  return {
    raw: token,
    value: toInt(match[1]),
    direction: match[2] as CardinalDirection,
    unit: "m",
  };
}

function isTrendStartToken(token: string | undefined): token is TrendType {
  return token === "NOSIG" || token === "BECMG" || token === "TEMPO";
}

function parseTrendTimeToken(token: string | undefined): TrendTimeIndicator | null {
  const match = /^(FM|TL|AT)(\d{4})$/.exec(token || "");
  if (!match) return null;
  return {
    raw: token,
    kind: match[1] as TrendTimeKind,
    value: match[2],
  };
}

function parseRVR(token: string | undefined): RvrGroup | null {
  const match = /^(R\d{2})([LRC])?(\/)([PM])?(\d{4})(?:([V])([PM])?(\d{4}))?([NUD])?(FT|M)?$/.exec(token);
  if (!match) return null;

  return {
    raw: token,
    runway: match[1],
    direction: (match[2] as "L" | "R" | "C" | undefined) || null,
    separator: ((match[3] as "/") || "/"),
    minIndicator: (match[4] as "P" | "M" | undefined) || null,
    minValue: match[5] || null,
    variableIndicator: (match[6] as "V" | undefined) || null,
    maxIndicator: (match[7] as "P" | "M" | undefined) || null,
    maxValue: match[8] || null,
    trend: (match[9] as "N" | "U" | "D" | undefined) || null,
    unitsOfMeasure: (match[10] as "FT" | "M" | undefined) || null,
    unit: match[10] || "m",
  };
}

function parseRunwayState(token: string | undefined): RunwayStateGroup | null {
  if (!token) return null;

  let match = /^(R\d{2})([LRC])?\/(CLRD)(\d{2})$/.exec(token);
  if (match) {
    return {
      raw: token,
      runway: match[1],
      direction: (match[2] as "L" | "R" | "C" | undefined) || null,
      cleared: true,
      fromRunway: match[4],
      depositCode: null,
      contaminationCode: null,
      depthCode: null,
      frictionCode: null,
    };
  }

  match = /^(R\d{2})([LRC])?\/([\d\/])([\d\/])(\d{2}|\/\/)(\d{2}|\/\/)?$/.exec(token);
  if (!match) return null;

  return {
    raw: token,
    runway: match[1],
    direction: (match[2] as "L" | "R" | "C" | undefined) || null,
    cleared: false,
    fromRunway: null,
    depositCode: match[3],
    contaminationCode: match[4],
    depthCode: match[5],
    frictionCode: match[6] || null,
  };
}

function parseWeatherGroup(token: string, parts: ParsedAbbreviation[] | null): WeatherGroup | null {
  if (!parts || parts.length === 0) return null;

  const detail = {
    raw: token,
    intensity: null,
    intensityDescription: null,
    descriptor: null,
    descriptorDescription: null,
    proximity: null,
    proximityDescription: null,
    phenomena: [],
  };

  for (const part of parts) {
    if (part.abbreviation === "+" || part.abbreviation === "-") {
      detail.intensity = part.abbreviation;
      detail.intensityDescription = part.meaning;
      continue;
    }
    if (part.abbreviation === "VC") {
      detail.proximity = part.abbreviation;
      detail.proximityDescription = part.meaning;
      continue;
    }
    if (WEATHER_DESCRIPTOR_CODES.has(part.abbreviation)) {
      detail.descriptor = part.abbreviation;
      detail.descriptorDescription = part.meaning;
      continue;
    }
    if (WEATHER_PHENOMENA_CODES.has(part.abbreviation)) {
      detail.phenomena.push({
        code: part.abbreviation,
        description: part.meaning,
      });
    }
  }

  return detail;
}

function parseCloud(token: string | undefined): ParsedCloudToken | null {
  if (!token) return null;

  if (token === "NCD" || token === "NSC" || token === "SKC" || token === "CLR") {
    return {
      raw: token,
      abbreviation: token,
      meaning: CLOUDS[token],
      altitude: null,
      cumulonimbus: false,
      toweringCumulus: false,
      type: "clear",
    };
  }

  if (token === "VV///") {
    return {
      raw: token,
      abbreviation: "VV",
      meaning: CLOUDS.VV,
      altitude: null,
      cumulonimbus: false,
      toweringCumulus: false,
      type: "verticalVisibility",
      verticalVisibility: null,
      unavailable: true,
    };
  }

  let match = /^(VV)(\d{3})$/.exec(token);
  if (match) {
    return {
      raw: token,
      abbreviation: match[1] as "VV",
      meaning: CLOUDS.VV,
      altitude: toInt(match[2]) * 100,
      cumulonimbus: false,
      toweringCumulus: false,
      type: "verticalVisibility",
      verticalVisibility: toInt(match[2]) * 100,
      unavailable: false,
    };
  }

  match = /^(\/{6})CB$/.exec(token);
  if (match) {
    return {
      raw: token,
      abbreviation: "CB",
      meaning: "cumulonimbus obscured",
      altitude: null,
      cumulonimbus: true,
      toweringCumulus: false,
      type: "obscuredCb",
      unavailable: true,
    };
  }

  match = /^(FEW|SCT|BKN|OVC)(\d{3}|\/{3})(CB|TCU|\/{3})?$/.exec(token);
  if (!match) return null;

  return {
    raw: token,
    abbreviation: match[1],
    meaning: CLOUDS[match[1]],
    altitude: /^\d{3}$/.test(match[2]) ? toInt(match[2]) * 100 : null,
    cumulonimbus: match[3] === "CB",
    toweringCumulus: match[3] === "TCU",
    type: "layer",
    baseUnavailable: match[2] === "///",
    convectiveType: match[3] && match[3] !== "///" ? (match[3] as "CB" | "TCU") : null,
    convectiveTypeUnavailable: match[3] === "///" ? true : undefined,
  };
}

function parseTemperatureDewpoint(token: string | undefined): TemperatureDewpointParse | null {
  const match = /^(M?\d{2})\/(M?\d{2})$/.exec(token);
  if (!match) return null;

  return {
    raw: token,
    temperature: parseSignedTemperature(match[1]),
    dewpoint: parseSignedTemperature(match[2]),
  };
}

function parseSignedTemperature(part: string): number | null {
  if (!/^(M)?\d{2}$/.test(part)) return null;
  const negative = part.startsWith("M");
  const value = toInt(part.replace("M", ""));
  return negative ? -value : value;
}

function parseAltimeter(token: string | undefined): AltimeterParse | null {
  let match = /^Q(\d{4})=?$/.exec(token);
  if (match) {
    const hPa = toInt(match[1]);
    const inHg = parseFloat((hPa * 0.0295299830714).toFixed(2));
    return {
      raw: token,
      value: hPa,
      unit: "hPa",
      altimeterInHg: inHg,
      altimeterInHpa: hPa,
    };
  }

  match = /^A(\d{4})=?$/.exec(token);
  if (match) {
    const value = parseFloat(`${match[1].slice(0, 2)}.${match[1].slice(2)}`);
    const hPa = Math.round(value / 0.0295299830714);
    return {
      raw: token,
      value,
      unit: "inHg",
      altimeterInHg: value,
      altimeterInHpa: hPa,
    };
  }

  return null;
}

function parseRecentWeather(token: string | undefined): RecentWeatherGroup | null {
  if (!token || !token.startsWith("RE")) return null;
  return {
    raw: token,
    code: token,
    description: RECENT_WEATHER[token] || null,
  };
}

function parseWindShear(tokens: string[], index: number): WindShearParseResult | null {
  if (tokens[index] !== "WS") return null;

  const next = tokens[index + 1];
  const nextTwo = tokens[index + 2];

  if (next === "ALL" && nextTwo === "RWY") {
    return {
      consumed: 3,
      value: {
        raw: "WS ALL RWY",
        allRunways: true,
        runway: null,
      },
    };
  }

  if (next && /^R\d{2}[LCR]?$/.test(next)) {
    return {
      consumed: 2,
      value: {
        raw: `WS ${next}`,
        allRunways: false,
        runway: next.slice(1),
      },
    };
  }

  return null;
}

function parseSeaState(token: string | undefined): SeaStateGroup | null {
  let match = /^W(M?\d{2})\/S(\d)$/.exec(token);
  if (match) {
    return {
      raw: token,
      seaSurfaceTemperatureC: parseSignedTemperature(match[1]),
      seaConditionCode: toInt(match[2]),
      waveHeightDm: null,
    };
  }

  match = /^W(M?\d{2})\/H(\d{3})$/.exec(token);
  if (match) {
    return {
      raw: token,
      seaSurfaceTemperatureC: parseSignedTemperature(match[1]),
      seaConditionCode: null,
      waveHeightDm: toInt(match[2]),
    };
  }

  return null;
}

function parseQfe(token: string | undefined): QfeGroup | null {
  const match = /^QFE(\d{3,4})$/.exec(token);
  if (!match) return null;

  const value = toInt(match[1]);
  const unit = match[1].length === 3 ? "mmHg" : "hPa";

  return {
    raw: token,
    value,
    unit,
    description: "field elevation pressure",
  };
}

function parseRemarks(tokens: string[]): RemarksGroup {
  const result: RemarksGroup = {
    raw: tokens.join(" "),
    tokens: tokens.slice(),
    automatic: false,
    qfe: null,
    unparsedTokens: [],
  };

  for (const token of tokens) {
    if (token === "AUT") {
      result.automatic = true;
      continue;
    }

    const qfe = parseQfe(token);
    if (qfe) {
      result.qfe = qfe;
      continue;
    }

    result.unparsedTokens.push(token);
  }

  return result;
}

function isTrendBoundary(token: string | undefined): boolean {
  if (!token) return true;
  if (token === "RMK") return true;
  if (isTrendStartToken(token)) return true;
  if (parseRecentWeather(token)) return true;
  if (parseSeaState(token)) return true;
  if (token === "WS") return true;
  return false;
}

function parseTrendSection(tokens: string[], startIndex: number): TrendParseResult | null {
  const first = tokens[startIndex];
  if (!isTrendStartToken(first)) return null;

  if (first === "NOSIG") {
    return {
      consumed: 1,
      value: {
        raw: first,
        type: first,
        timeIndicators: [],
        wind: null,
        visibility: null,
        weather: [],
        clouds: [],
        cavok: false,
        unparsedTokens: [],
      },
    };
  }

  const trend: TrendGroup = {
    raw: first,
    type: first,
    timeIndicators: [],
    wind: null,
    visibility: null,
    weather: [],
    clouds: [],
    cavok: false,
    unparsedTokens: [],
  };

  let i = startIndex + 1;
  while (i < tokens.length) {
    const token = tokens[i];
    if (isTrendBoundary(token)) break;

    const timeToken = parseTrendTimeToken(token);
    if (timeToken) {
      trend.timeIndicators.push(timeToken);
      i += 1;
      continue;
    }

    if (token === "CAVOK") {
      trend.cavok = true;
      i += 1;
      continue;
    }

    if (!trend.wind) {
      const wind = parseWind(token);
      if (wind) {
        trend.wind = wind;
        i += 1;
        continue;
      }
    }

    if (!trend.visibility) {
      const visibility = parseVisibilityGroup(token, tokens[i + 1]);
      if (visibility) {
        trend.visibility = {
          raw: visibility.raw,
          value: visibility.value,
          unit: visibility.unit,
          greaterThan: !!visibility.greaterThan,
          lessThan: !!visibility.lessThan,
          unavailable: !!visibility.unavailable,
        };
        i += visibility.consumed;
        continue;
      }
    }

    const weatherParts = parseWeatherAbbreviations(token);
    if (weatherParts && weatherParts.length > 0) {
      const weatherGroup = parseWeatherGroup(token, weatherParts);
      if (weatherGroup) {
        trend.weather.push(weatherGroup);
      }
      i += 1;
      continue;
    }

    const cloud = parseCloud(token);
    if (cloud) {
      if (cloud.type !== "verticalVisibility") {
        trend.clouds.push(cloud);
      }
      i += 1;
      continue;
    }

    trend.unparsedTokens.push(token);
    i += 1;
  }

  trend.raw = tokens.slice(startIndex, i).join(" ");

  return {
    consumed: i - startIndex,
    value: trend,
  };
}

class MetarParser {
  original: string;
  tokens: string[];
  i: number;
  result: MetarParseResult;

  constructor(message: string) {
    this.original = normalizeInput(message);
    this.tokens = tokenize(message);
    this.i = 0;
    this.result = {
      original: this.original,
      type: "METAR",
      station: null,
      time: null,
      auto: false,
      correction: false,
      wind: {
        raw: null,
        speed: null,
        gust: null,
        direction: null,
        variation: null,
        unit: null,
        speedOperator: null,
        gustOperator: null,
        calm: false,
      },
      cavok: false,
      visibility: {
        prevailing: null,
        minimum: null,
        vertical: null,
      },
      rvr: null,
      runwayState: null,
      weather: null,
      trend: null,
      clouds: null,
      temperature: {
        raw: null,
        air: null,
        dewpoint: null,
      },
      altimeter: {
        raw: null,
        value: null,
        unit: null,
        inHg: null,
        hPa: null,
      },
      recentWeather: null,
      windShear: null,
      seaState: null,
      remarks: null,
      errors: [],
    };
  }

  parse(): MetarParseResult {
    if (this.tokens.length === 0) {
      throw createError("Empty METAR message", 0, null);
    }

    this.parseType();
    this.parseCorrection();
    this.parseStation();
    this.parseCorrection();
    this.parseDateTime();
    this.parseAuto();
    this.parseCorrection();
    this.parseWind();
    this.parseCavok();

    if (!this.result.cavok) {
      this.parseVisibility();
      this.parseRvrSection();
      this.parseWeatherSection();
      this.parseCloudSection();
    }

    this.parseRunwayStateSection();
    this.parseTemperatureDewpoint();
    this.parseAltimeter();
    this.parseSupplementary();
    this.finalize();

    return this.result;
  }

  peek(offset = 0): string | undefined {
    return this.tokens[this.i + offset];
  }

  next(): string | undefined {
    const token = this.tokens[this.i];
    this.i += 1;
    return token;
  }

  hasMore(): boolean {
    return this.i < this.tokens.length;
  }

  parseType(): void {
    const token = this.peek();
    if (REPORT_TYPES.has(token)) {
      this.result.type = this.next() as ReportType;
    }
  }

  parseCorrection(): void {
    while (true) {
      const correction = parseCorrectionToken(this.peek());
      if (correction === null) return;
      this.result.correction = correction;
      this.next();
    }
  }

  parseStation(): void {
    const token = this.next();
    if (!/^[A-Z]{4}$/.test(token || "")) {
      throw createError("Invalid station token", this.i - 1, token);
    }
    this.result.station = token;
  }

  parseDateTime(): void {
    const token = this.next();
    const parsed = parseDateTimeGroup(token);
    if (!parsed) {
      throw createError("Invalid time token", this.i - 1, token);
    }
    this.result.time = parsed.date;
  }

  parseAuto(): void {
    if (this.peek() === "AUTO") {
      this.result.auto = true;
      this.next();
    }
  }

  parseWind(): void {
    const token = this.next();
    const parsed = parseWind(token);
    if (!parsed) {
      throw createError("Invalid wind token", this.i - 1, token);
    }

    this.result.wind = parsed;

    const variation = parseWindVariation(this.peek());
    if (variation) {
      this.result.wind.variation = {
        min: variation.min,
        max: variation.max,
      };
      this.next();
    }
  }

  parseCavok(): void {
    if (this.peek() === "CAVOK") {
      this.result.cavok = true;
      this.next();
    }
  }

  parseVisibility(): void {
    const parsed = parseVisibilityGroup(this.peek(), this.peek(1));
    if (!parsed) {
      throw createError("Invalid visibility token", this.i, this.peek());
    }

    this.result.visibility.prevailing = {
      raw: parsed.raw,
      value: parsed.value,
      unit: parsed.unit,
      greaterThan: !!parsed.greaterThan,
      lessThan: !!parsed.lessThan,
      unavailable: !!parsed.unavailable,
    };
    for (let consumed = 0; consumed < parsed.consumed; consumed++) {
      this.next();
    }

    const directional = parseDirectionalVisibility(this.peek());
    if (directional) {
      this.result.visibility.minimum = directional;
      this.next();
    }
  }

  parseRvrSection(): void {
    const list: RvrGroup[] = [];
    while (true) {
      const rvr = parseRVR(this.peek());
      if (rvr) {
        list.push(rvr);
        this.next();
        continue;
      }
      const rs = parseRunwayState(this.peek());
      if (rs) {
        if (!this.result.runwayState) this.result.runwayState = [];
        this.result.runwayState.push(rs);
        this.next();
        continue;
      }
      break;
    }
    this.result.rvr = list.length > 0 ? list : null;
  }

  parseWeatherSection(): void {
    const groups: WeatherGroup[] = [];

    while (true) {
      const token = this.peek();
      const parsedParts = parseWeatherAbbreviations(token);
      if (!parsedParts || parsedParts.length === 0) break;
      const group = parseWeatherGroup(token, parsedParts);
      if (group) groups.push(group);
      this.next();
    }

    this.result.weather = groups.length > 0 ? groups : null;
  }

  parseCloudSection(): void {
    const clouds: CloudGroup[] = [];

    while (true) {
      const parsed = parseCloud(this.peek());
      if (!parsed) break;
      if (parsed.type === "verticalVisibility") {
        this.result.visibility.vertical = {
          raw: parsed.raw,
          value: parsed.verticalVisibility,
          unit: "ft",
          unavailable: !!parsed.unavailable,
        };
      } else {
        clouds.push(parsed);
      }
      this.next();
    }

    this.result.clouds = clouds.length > 0 ? clouds : null;
  }

  parseRunwayStateSection(): void {
    while (true) {
      const group = parseRunwayState(this.peek());
      if (!group) break;
      if (!this.result.runwayState) this.result.runwayState = [];
      this.result.runwayState.push(group);
      this.next();
    }
  }

  parseTemperatureDewpoint(): void {
    const parsed = parseTemperatureDewpoint(this.peek());
    if (!parsed) return;
    this.result.temperature = {
      raw: parsed.raw,
      air: parsed.temperature,
      dewpoint: parsed.dewpoint,
    };
    this.next();
  }

  parseAltimeter(): void {
    const parsed = parseAltimeter(this.peek());
    if (!parsed) return;
    this.result.altimeter = {
      raw: parsed.raw,
      value: parsed.value,
      unit: parsed.unit,
      inHg: parsed.altimeterInHg,
      hPa: parsed.altimeterInHpa,
    };
    this.next();
  }

  parseSupplementary(): void {
    const recentWeather: RecentWeatherGroup[] = [];
    const windShear: WindShearGroup[] = [];
    const trend: TrendGroup[] = [];
    const runwayState: RunwayStateGroup[] = [];

    while (this.hasMore()) {
      if (this.peek() === "RMK") {
        this.next();
        this.result.remarks = parseRemarks(this.tokens.slice(this.i));
        this.i = this.tokens.length;
        break;
      }

      const runwayStateGroup = parseRunwayState(this.peek());
      if (runwayStateGroup) {
        runwayState.push(runwayStateGroup);
        this.next();
        continue;
      }

      const rvr = parseRVR(this.peek());
      if (rvr) {
        if (!this.result.rvr) this.result.rvr = [];
        this.result.rvr.push(rvr);
        this.next();
        continue;
      }

      const recent = parseRecentWeather(this.peek());
      if (recent) {
        recentWeather.push(recent);
        this.next();
        continue;
      }

      const trendGroup = parseTrendSection(this.tokens, this.i);
      if (trendGroup) {
        trend.push(trendGroup.value);
        this.i += trendGroup.consumed;
        continue;
      }

      const windShearGroup = parseWindShear(this.tokens, this.i);
      if (windShearGroup) {
        windShear.push(windShearGroup.value);
        this.i += windShearGroup.consumed;
        continue;
      }

      const seaState = parseSeaState(this.peek());
      if (seaState) {
        this.result.seaState = seaState;
        this.next();
        continue;
      }

      const tokenIndex = this.i;
      const token = this.next()!;
      this.result.errors.push({ message: "Unrecognized token", token, tokenIndex });
    }

    if (recentWeather.length > 0) {
      this.result.recentWeather = recentWeather;
    }

    if (windShear.length > 0) {
      this.result.windShear = windShear;
    }

    if (trend.length > 0) {
      this.result.trend = trend;
    }

    if (runwayState.length > 0) {
      if (this.result.runwayState) {
        this.result.runwayState.push(...runwayState);
      } else {
        this.result.runwayState = runwayState;
      }
    }
  }

  finalize(): void {
    if (this.result.wind && this.result.wind.variation === null && this.result.wind.direction === "VRB") {
      this.result.wind.variation = true;
    }

    if (this.result.recentWeather === null) {
      this.result.recentWeather = null;
    }

    if (this.result.windShear === null) {
      this.result.windShear = null;
    }
  }
}

export type ParseMetarFunction = (message: string) => MetarParseResult;

const parseMETAR: ParseMetarFunction = (message: string) => new MetarParser(message).parse();

export default parseMETAR;
