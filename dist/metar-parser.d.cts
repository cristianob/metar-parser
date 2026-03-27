type Maybe<T> = T | null;
type ReportType = "METAR" | "SPECI";
type CardinalDirection = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";
type WindDirection = number | "VRB";
type WindValueOperator = "P" | null;
type CloudType = "clear" | "layer" | "obscuredCb";
type TrendType = "NOSIG" | "BECMG" | "TEMPO";
type TrendTimeKind = "FM" | "TL" | "AT";
type AltimeterUnit = "hPa" | "inHg";
type VisibilityUnit = "m" | "SM";
type VerticalVisibilityUnit = "ft";
type QfeUnit = "mmHg" | "hPa";
interface ParsedAbbreviation {
    abbreviation: string;
    meaning: string;
}
interface DateTimeGroup {
    raw: string;
    day: number;
    hour: number;
    minute: number;
    date: Date;
}
interface ParsedWindSpeedPart {
    raw: string;
    value: number;
    greaterThan: boolean;
}
interface WindVariationRange {
    raw?: string;
    min: number;
    max: number;
}
interface WindGroup {
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
interface BaseVisibility {
    raw: string;
    value: Maybe<number>;
    unit: VisibilityUnit;
    unavailable: boolean;
    greaterThan?: boolean;
}
interface VisibilityGroup extends BaseVisibility {
    lessThan: boolean;
    consumed: number;
}
interface PrevailingVisibility {
    raw: string;
    value: Maybe<number>;
    unit: VisibilityUnit;
    greaterThan: boolean;
    lessThan: boolean;
    unavailable: boolean;
}
interface DirectionalVisibility {
    raw: string;
    value: number;
    direction: CardinalDirection;
    unit: "m";
}
interface VerticalVisibility {
    raw: string;
    value: Maybe<number>;
    unit: VerticalVisibilityUnit;
    unavailable: boolean;
}
interface VisibilityBlock {
    prevailing: Maybe<PrevailingVisibility>;
    minimum: Maybe<DirectionalVisibility>;
    vertical: Maybe<VerticalVisibility>;
}
interface RvrGroup {
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
interface RunwayStateGroup {
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
interface WeatherPhenomenon {
    code: string;
    description: string;
}
interface WeatherGroup {
    raw: string;
    intensity: Maybe<string>;
    intensityDescription: Maybe<string>;
    descriptor: Maybe<string>;
    descriptorDescription: Maybe<string>;
    proximity: Maybe<string>;
    proximityDescription: Maybe<string>;
    phenomena: WeatherPhenomenon[];
}
interface CloudClearGroup {
    raw: string;
    abbreviation: string;
    meaning: string;
    altitude: null;
    cumulonimbus: false;
    toweringCumulus: false;
    type: "clear";
}
interface CloudLayerGroup {
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
interface ObscuredCbGroup {
    raw: string;
    abbreviation: "CB";
    meaning: string;
    altitude: null;
    cumulonimbus: true;
    toweringCumulus: false;
    type: "obscuredCb";
    unavailable: true;
}
interface CloudVerticalVisibilityGroup {
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
type CloudGroup = CloudClearGroup | CloudLayerGroup | ObscuredCbGroup;
type ParsedCloudToken = CloudGroup | CloudVerticalVisibilityGroup;
interface TemperatureDewpointParse {
    raw: string;
    temperature: number;
    dewpoint: number;
}
interface TemperatureGroup {
    raw: Maybe<string>;
    air: Maybe<number>;
    dewpoint: Maybe<number>;
}
interface AltimeterParse {
    raw: string;
    value: number;
    unit: AltimeterUnit;
    altimeterInHg: number;
    altimeterInHpa: number;
}
interface AltimeterGroup {
    raw: Maybe<string>;
    value: Maybe<number>;
    unit: Maybe<AltimeterUnit>;
    inHg: Maybe<number>;
    hPa: Maybe<number>;
}
interface RecentWeatherGroup {
    raw: string;
    code: string;
    description: Maybe<string>;
}
interface WindShearGroup {
    raw: string;
    allRunways: boolean;
    runway: Maybe<string>;
}
interface SeaStateGroup {
    raw: string;
    seaSurfaceTemperatureC: Maybe<number>;
    seaConditionCode: Maybe<number>;
    waveHeightDm: Maybe<number>;
}
interface QfeGroup {
    raw: string;
    value: number;
    unit: QfeUnit;
    description: string;
}
interface RemarksGroup {
    raw: string;
    tokens: string[];
    automatic: boolean;
    qfe: Maybe<QfeGroup>;
    unparsedTokens: string[];
}
interface TrendTimeIndicator {
    raw: string;
    kind: TrendTimeKind;
    value: string;
}
interface TrendGroup {
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
interface MetarParseResult {
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
}
interface TrendParseResult {
    consumed: number;
    value: TrendGroup;
}
interface WindShearParseResult {
    consumed: number;
    value: WindShearGroup;
}
interface ParseMetarHelpers {
    parseDateTimeGroup: typeof parseDateTimeGroup;
    parseWind: typeof parseWind;
    parseWindVariation: typeof parseWindVariation;
    parseVisibility: typeof parseVisibility;
    parseVisibilityGroup: typeof parseVisibilityGroup;
    parseDirectionalVisibility: typeof parseDirectionalVisibility;
    parseRVR: typeof parseRVR;
    parseRunwayState: typeof parseRunwayState;
    parseCloud: typeof parseCloud;
    parseTemperatureDewpoint: typeof parseTemperatureDewpoint;
    parseAltimeter: typeof parseAltimeter;
    parseRecentWeather: typeof parseRecentWeather;
    parseWindShear: typeof parseWindShear;
    parseSeaState: typeof parseSeaState;
    parseQfe: typeof parseQfe;
    parseRemarks: typeof parseRemarks;
    parseTrendTimeToken: typeof parseTrendTimeToken;
    parseTrendSection: typeof parseTrendSection;
}
interface ParseMetarFunction {
    (message: string): MetarParseResult;
    Parser: typeof MetarParser;
    parseRVR: typeof parseRVR;
    helpers: ParseMetarHelpers;
}
declare function parseDateTimeGroup(token: string | undefined): DateTimeGroup | null;
declare function parseWind(token: string | undefined): WindGroup | null;
declare function parseWindVariation(token: string | undefined): WindVariationRange | null;
declare function parseVisibility(token: string | undefined): BaseVisibility | null;
declare function parseVisibilityGroup(token: string | undefined, nextToken: string | undefined): VisibilityGroup | null;
declare function parseDirectionalVisibility(token: string | undefined): DirectionalVisibility | null;
declare function parseTrendTimeToken(token: string | undefined): TrendTimeIndicator | null;
declare function parseRVR(token: string | undefined): RvrGroup | null;
declare function parseRunwayState(token: string | undefined): RunwayStateGroup | null;
declare function parseCloud(token: string | undefined): ParsedCloudToken | null;
declare function parseTemperatureDewpoint(token: string | undefined): TemperatureDewpointParse | null;
declare function parseAltimeter(token: string | undefined): AltimeterParse | null;
declare function parseRecentWeather(token: string | undefined): RecentWeatherGroup | null;
declare function parseWindShear(tokens: string[], index: number): WindShearParseResult | null;
declare function parseSeaState(token: string | undefined): SeaStateGroup | null;
declare function parseQfe(token: string | undefined): QfeGroup | null;
declare function parseRemarks(tokens: string[]): RemarksGroup;
declare function parseTrendSection(tokens: string[], startIndex: number): TrendParseResult | null;
declare class MetarParser {
    original: string;
    tokens: string[];
    i: number;
    result: MetarParseResult;
    constructor(message: string);
    parse(): MetarParseResult;
    peek(offset?: number): string | undefined;
    next(): string | undefined;
    hasMore(): boolean;
    parseType(): void;
    parseCorrection(): void;
    parseStation(): void;
    parseDateTime(): void;
    parseAuto(): void;
    parseWind(): void;
    parseCavok(): void;
    parseVisibility(): void;
    parseRvrSection(): void;
    parseWeatherSection(): void;
    parseCloudSection(): void;
    parseTemperatureDewpoint(): void;
    parseAltimeter(): void;
    parseSupplementary(): void;
    finalize(): void;
}
declare const parseMETAR: ParseMetarFunction;

export { type AltimeterGroup, type AltimeterParse, type AltimeterUnit, type BaseVisibility, type CardinalDirection, type CloudClearGroup, type CloudGroup, type CloudLayerGroup, type CloudType, type CloudVerticalVisibilityGroup, type DateTimeGroup, type DirectionalVisibility, type MetarParseResult, type ObscuredCbGroup, type ParseMetarFunction, type ParseMetarHelpers, type ParsedAbbreviation, type ParsedWindSpeedPart, type PrevailingVisibility, type QfeGroup, type QfeUnit, type RecentWeatherGroup, type RemarksGroup, type ReportType, type RunwayStateGroup, type RvrGroup, type SeaStateGroup, type TemperatureDewpointParse, type TemperatureGroup, type TrendGroup, type TrendParseResult, type TrendTimeIndicator, type TrendTimeKind, type TrendType, type VerticalVisibility, type VerticalVisibilityUnit, type VisibilityBlock, type VisibilityGroup, type VisibilityUnit, type WeatherGroup, type WeatherPhenomenon, type WindDirection, type WindGroup, type WindShearGroup, type WindShearParseResult, type WindValueOperator, type WindVariationRange, parseMETAR as default };
