import { describe, it, expect } from "vitest";

import parseMETAR from "../src/metar-parser";
import METAR_EXAMPLES from "./metar-examples.js";

describe("shared HTML examples", () => {
  for (const example of METAR_EXAMPLES) {
    it(`parses ${example.label}`, () => {
      const result = parseMETAR(example.metar);

      expect(result.station).toBeTypeOf("string");
      expect(result.type === "METAR" || result.type === "SPECI").toBe(true);
      expect(result.time instanceof Date).toBe(true);
      expect(result.wind).toBeTruthy();
      expect(result.wind.unit).toBeTypeOf("string");
    });
  }

  it("keeps the original HTML examples plus all METAR regression cases", () => {
    expect(METAR_EXAMPLES).toHaveLength(44);
  });
});

describe("parser behavior", () => {
  it("parses a standard metric report with old-like top-level fields", () => {
    const result = parseMETAR("METAR SBGR 261200Z 35008KT 9999 SCT040 28/18 Q1012");

    expect(result.type).toBe("METAR");
    expect(result.station).toBe("SBGR");
    expect(result.time instanceof Date).toBe(true);
    expect(result.auto).toBe(false);
    expect(result.correction).toBe(false);
    expect(result.wind.speed).toBe(8);
    expect(result.wind.direction).toBe(350);
    expect(result.visibility.prevailing.value).toBe(9999);
    expect(result.visibility.prevailing.unit).toBe("m");
    expect(result.temperature.air).toBe(28);
    expect(result.temperature.dewpoint).toBe(18);
    expect(result.altimeter.value).toBe(1012);
    expect(result.altimeter.unit).toBe("hPa");
    expect(result.altimeter.hPa).toBe(1012);
    expect(result.altimeter.inHg).toBe(29.88);
  });

  it("parses altimeter with A prefix and specifies the unit", () => {
    const result = parseMETAR("METAR KJFK 261651Z 18012KT 10SM -RA BKN020 OVC050 18/16 A2992");

    expect(result.altimeter.value).toBe(29.92);
    expect(result.altimeter.unit).toBe("inHg");
    expect(result.altimeter.inHg).toBe(29.92);
    expect(result.altimeter.hPa).toBe(1013);
    expect(result.visibility.prevailing.value).toBe(10);
    expect(result.visibility.prevailing.unit).toBe("SM");
  });

  it("parses american visibility with fractions and less-than operator", () => {
    const result = parseMETAR("METAR KCRW 271454Z 35008G22KT M1/4SM -RA OVC008 08/07 A3008");

    expect(result.visibility.prevailing.value).toBe(0.25);
    expect(result.visibility.prevailing.unit).toBe("SM");
    expect(result.visibility.prevailing.lessThan).toBe(true);
  });

  it("parses american visibility with whole and fraction statute miles", () => {
    const result = parseMETAR("METAR KCRW 271454Z 35008G22KT 1 1/2SM -RA OVC008 08/07 A3008");

    expect(result.visibility.prevailing.raw).toBe("1 1/2SM");
    expect(result.visibility.prevailing.value).toBe(1.5);
    expect(result.visibility.prevailing.unit).toBe("SM");
  });

  it("accepts looser wind units and correction tokens in extra positions", () => {
    const result = parseMETAR("METAR CCA SBGL 261300Z AUTO COR 18010KMH CAVOK 30/20 Q1015");

    expect(result.station).toBe("SBGL");
    expect(result.auto).toBe(true);
    expect(result.correction).toBe(true);
    expect(result.wind.unit).toBe("KMH");
    expect(result.wind.speed).toBe(10);
    expect(result.cavok).toBe(true);
  });

  it("supports an unlimited number of RVR groups", () => {
    const result = parseMETAR(
      "METAR SBVT 260700Z 19008KT 0600 R10/P2000U R28/0400D R09/0600V1000U R11/0300N R29/P1500U FG OVC001 15/15 A2992"
    );

    expect(Array.isArray(result.rvr)).toBe(true);
    expect(result.rvr).toHaveLength(5);
    expect(result.rvr[0].raw).toBe("R10/P2000U");
    expect(result.rvr[2].variableIndicator).toBe("V");
    expect(result.rvr[4].minIndicator).toBe("P");
  });

  it("ignores leftover tokens instead of throwing", () => {
    const result = parseMETAR("METAR SBSP 261600Z 27012KT 9999 SCT030 BKN060 25/18 Q1012 NOSIG EXTRA TOKEN");

    expect(result.station).toBe("SBSP");
    expect(result.altimeter.value).toBe(1012);
    expect(result.remarks).toBe(null);
    expect(result.recentWeather).toBe(null);
  });

  it("keeps weather semantic by group", () => {
    const result = parseMETAR("METAR SBCF 261730Z 31020G35KT 3000 -TSRA BR SCT015 BKN040CB 20/18 Q1010");

    expect(result.weather.map((item) => item.raw)).toEqual(["-TSRA", "BR"]);
    expect(result.weather[0].intensity).toBe("-");
    expect(result.weather[0].descriptor).toBe("TS");
    expect(result.weather[0].phenomena).toEqual([{ code: "RA", description: "rain" }]);
    expect(result.weather[1].phenomena).toEqual([{ code: "BR", description: "mist" }]);
  });

  it("parses PY as weather phenomenon", () => {
    const result = parseMETAR("METAR SBFN 271200Z 12012KT 4000 PY SCT020 26/24 Q1011");

    expect(result.weather).toEqual([
      {
        raw: "PY",
        intensity: null,
        intensityDescription: null,
        descriptor: null,
        descriptorDescription: null,
        proximity: null,
        proximityDescription: null,
        phenomena: [{ code: "PY", description: "spray" }],
      },
    ]);
  });

  it("stores VV inside the visibility block instead of clouds", () => {
    const result = parseMETAR("METAR SBRJ 260900Z 00000KT 0400 FG VV002 18/18 Q1018");

    expect(result.visibility.vertical).toEqual({
      raw: "VV002",
      value: 200,
      unit: "ft",
      unavailable: false,
    });
    expect(result.clouds).toBe(null);
    expect(result.weather[0].raw).toBe("FG");
  });

  it("captures supplementary groups without dropping RMK or WS", () => {
    const result = parseMETAR("METAR SBMN 261200Z 04008KT 9999 SCT025 BKN100 30/24 Q1012 RERA WS ALL RWY RMK AUT QFE750");

    expect(result.recentWeather).toEqual([{ raw: "RERA", code: "RERA", description: "moderate or heavy rain" }]);
    expect(result.windShear[0].raw).toBe("WS ALL RWY");
    expect(result.remarks).toEqual({
      raw: "AUT QFE750",
      tokens: ["AUT", "QFE750"],
      automatic: true,
      qfe: {
        raw: "QFE750",
        value: 750,
        unit: "mmHg",
        description: "field elevation pressure",
      },
      unparsedTokens: [],
    });
  });

  it("parses trend groups including time indicators and weather changes", () => {
    const result = parseMETAR("METAR EGLL 271420Z 25012KT 9999 SCT030 18/10 Q1013 TEMPO FM1430 TL1530 4000 SHRA BKN014 NOSIG");

    expect(result.trend).toHaveLength(2);
    expect(result.trend[0].type).toBe("TEMPO");
    expect(result.trend[0].timeIndicators).toEqual([
      { raw: "FM1430", kind: "FM", value: "1430" },
      { raw: "TL1530", kind: "TL", value: "1530" },
    ]);
    expect(result.trend[0].visibility).toEqual({
      raw: "4000",
      value: 4000,
      unit: "m",
      greaterThan: false,
      lessThan: false,
      unavailable: false,
    });
    expect(result.trend[0].weather[0].raw).toBe("SHRA");
    expect(result.trend[0].clouds[0].raw).toBe("BKN014");
    expect(result.trend[1]).toEqual({
      raw: "NOSIG",
      type: "NOSIG",
      timeIndicators: [],
      wind: null,
      visibility: null,
      weather: [],
      clouds: [],
      cavok: false,
      unparsedTokens: [],
    });
  });

  it("parses an AUTO american report with negative temperatures and remarks ignored structurally", () => {
    const result = parseMETAR("PAQT 271653Z AUTO 23013KT 10SM OVC008 M07/M09 A3033 RMK AO2 UPB1555E1556SNE1555B1556E24 SLP271 P0000");

    expect(result.station).toBe("PAQT");
    expect(result.auto).toBe(true);
    expect(result.wind.raw).toBe("23013KT");
    expect(result.visibility.prevailing.raw).toBe("10SM");
    expect(result.clouds[0].raw).toBe("OVC008");
    expect(result.temperature).toEqual({
      raw: "M07/M09",
      air: -7,
      dewpoint: -9,
    });
    expect(result.altimeter).toEqual({
      raw: "A3033",
      value: 30.33,
      unit: "inHg",
      inHg: 30.33,
      hPa: 1027,
    });
  });

  it("parses an AUTO american report with mixed whole and fractional visibility in statute miles", () => {
    const result = parseMETAR("CYPE 271709Z AUTO 03011KT 1 3/4SM -SN FEW025 OVC033 M13/M15 A3010 RMK SLP252");

    expect(result.station).toBe("CYPE");
    expect(result.auto).toBe(true);
    expect(result.wind.raw).toBe("03011KT");
    expect(result.visibility.prevailing).toEqual({
      raw: "1 3/4SM",
      value: 1.75,
      unit: "SM",
      greaterThan: false,
      lessThan: false,
      unavailable: false,
    });
    expect(result.weather[0].raw).toBe("-SN");
    expect(result.clouds.map((cloud) => cloud.raw)).toEqual(["FEW025", "OVC033"]);
    expect(result.temperature).toEqual({
      raw: "M13/M15",
      air: -13,
      dewpoint: -15,
    });
    expect(result.altimeter).toEqual({
      raw: "A3010",
      value: 30.1,
      unit: "inHg",
      inHg: 30.1,
      hPa: 1019,
    });
  });

  it("parses a corrected report with a simple BECMG cloud trend", () => {
    const result = parseMETAR("EGSH 271650Z COR 22009KT 9999 BKN007 BKN023 11/10 Q1015 BECMG BKN011");

    expect(result.station).toBe("EGSH");
    expect(result.correction).toBe(true);
    expect(result.wind.raw).toBe("22009KT");
    expect(result.visibility.prevailing.raw).toBe("9999");
    expect(result.clouds.map((cloud) => cloud.raw)).toEqual(["BKN007", "BKN023"]);
    expect(result.temperature).toEqual({
      raw: "11/10",
      air: 11,
      dewpoint: 10,
    });
    expect(result.altimeter).toEqual({
      raw: "Q1015",
      value: 1015,
      unit: "hPa",
      inHg: 29.97,
      hPa: 1015,
    });
    expect(result.trend).toEqual([
      {
        raw: "BECMG BKN011",
        type: "BECMG",
        timeIndicators: [],
        wind: null,
        visibility: null,
        weather: [],
        clouds: [
          {
            raw: "BKN011",
            abbreviation: "BKN",
            meaning: "broken",
            altitude: 1100,
            cumulonimbus: false,
            toweringCumulus: false,
            type: "layer",
            baseUnavailable: false,
            convectiveType: null,
          },
        ],
        cavok: false,
        unparsedTokens: [],
      },
    ]);
  });

  it("parses a report without altimeter by keeping the body fields and null altimeter values", () => {
    const result = parseMETAR("EGKA 271650Z 23012KT 4000 -DZ BKN005 10/10");

    expect(result.station).toBe("EGKA");
    expect(result.wind.raw).toBe("23012KT");
    expect(result.visibility.prevailing).toEqual({
      raw: "4000",
      value: 4000,
      unit: "m",
      greaterThan: false,
      lessThan: false,
      unavailable: false,
    });
    expect(result.weather[0].raw).toBe("-DZ");
    expect(result.clouds.map((cloud) => cloud.raw)).toEqual(["BKN005"]);
    expect(result.temperature).toEqual({
      raw: "10/10",
      air: 10,
      dewpoint: 10,
    });
    expect(result.altimeter).toEqual({
      raw: null,
      value: null,
      unit: null,
      inHg: null,
      hPa: null,
    });
  });

  it("parses a basic metric report with a single broken cloud layer", () => {
    const result = parseMETAR("SBPK 271700Z 09006KT 9999 BKN020 30/24 Q1015");

    expect(result.station).toBe("SBPK");
    expect(result.wind.raw).toBe("09006KT");
    expect(result.visibility.prevailing).toEqual({
      raw: "9999",
      value: 9999,
      unit: "m",
      greaterThan: false,
      lessThan: false,
      unavailable: false,
    });
    expect(result.weather).toBeNull();
    expect(result.clouds).toEqual([
      {
        raw: "BKN020",
        abbreviation: "BKN",
        meaning: "broken",
        altitude: 2000,
        cumulonimbus: false,
        toweringCumulus: false,
        type: "layer",
        baseUnavailable: false,
        convectiveType: null,
      },
    ]);
    expect(result.temperature).toEqual({
      raw: "30/24",
      air: 30,
      dewpoint: 24,
    });
    expect(result.altimeter).toEqual({
      raw: "Q1015",
      value: 1015,
      unit: "hPa",
      inHg: 29.97,
      hPa: 1015,
    });
  });

  it("parses convective cloud annotations like TCU within cloud layers", () => {
    const result = parseMETAR("SBSN 271700Z 09010KT 9999 SCT020 FEW030TCU SCT100 30/26 Q1008");

    expect(result.station).toBe("SBSN");
    expect(result.wind.raw).toBe("09010KT");
    expect(result.visibility.prevailing.raw).toBe("9999");
    expect(result.weather).toBeNull();
    expect(result.clouds).toEqual([
      {
        raw: "SCT020",
        abbreviation: "SCT",
        meaning: "scattered",
        altitude: 2000,
        cumulonimbus: false,
        toweringCumulus: false,
        type: "layer",
        baseUnavailable: false,
        convectiveType: null,
      },
      {
        raw: "FEW030TCU",
        abbreviation: "FEW",
        meaning: "few",
        altitude: 3000,
        cumulonimbus: false,
        toweringCumulus: true,
        type: "layer",
        baseUnavailable: false,
        convectiveType: "TCU",
      },
      {
        raw: "SCT100",
        abbreviation: "SCT",
        meaning: "scattered",
        altitude: 10000,
        cumulonimbus: false,
        toweringCumulus: false,
        type: "layer",
        baseUnavailable: false,
        convectiveType: null,
      },
    ]);
    expect(result.temperature).toEqual({
      raw: "30/26",
      air: 30,
      dewpoint: 26,
    });
    expect(result.altimeter).toEqual({
      raw: "Q1008",
      value: 1008,
      unit: "hPa",
      inHg: 29.77,
      hPa: 1008,
    });
  });

  it("parses wind direction variation without letting free-form remarks interfere with the body", () => {
    const result = parseMETAR("SPJJ 271700Z 11003KT 050V190 9999 -RA SCT035 SCT050 15/07 Q1031 RMK BIRD HAZARD RWY 13/31");

    expect(result.station).toBe("SPJJ");
    expect(result.wind).toEqual({
      raw: "11003KT",
      speed: 3,
      gust: null,
      direction: 110,
      variation: {
        min: 50,
        max: 190,
      },
      unit: "KT",
      speedOperator: null,
      gustOperator: null,
      calm: false,
    });
    expect(result.visibility.prevailing.raw).toBe("9999");
    expect(result.weather[0].raw).toBe("-RA");
    expect(result.clouds.map((cloud) => cloud.raw)).toEqual(["SCT035", "SCT050"]);
    expect(result.temperature).toEqual({
      raw: "15/07",
      air: 15,
      dewpoint: 7,
    });
    expect(result.altimeter).toEqual({
      raw: "Q1031",
      value: 1031,
      unit: "hPa",
      inHg: 30.45,
      hPa: 1031,
    });
    expect(result.remarks).toEqual({
      raw: "BIRD HAZARD RWY 13/31",
      tokens: ["BIRD", "HAZARD", "RWY", "13/31"],
      automatic: false,
      qfe: null,
      unparsedTokens: ["BIRD", "HAZARD", "RWY", "13/31"],
    });
  });

  it("parses a corrected report with a simple TEMPO cloud trend", () => {
    const result = parseMETAR("SFAL 271650Z COR 31016KT 9999 BKN014 13/11 Q0999 TEMPO FEW014");

    expect(result.station).toBe("SFAL");
    expect(result.correction).toBe(true);
    expect(result.wind.raw).toBe("31016KT");
    expect(result.visibility.prevailing.raw).toBe("9999");
    expect(result.clouds).toEqual([
      {
        raw: "BKN014",
        abbreviation: "BKN",
        meaning: "broken",
        altitude: 1400,
        cumulonimbus: false,
        toweringCumulus: false,
        type: "layer",
        baseUnavailable: false,
        convectiveType: null,
      },
    ]);
    expect(result.temperature).toEqual({
      raw: "13/11",
      air: 13,
      dewpoint: 11,
    });
    expect(result.altimeter).toEqual({
      raw: "Q0999",
      value: 999,
      unit: "hPa",
      inHg: 29.5,
      hPa: 999,
    });
    expect(result.trend).toEqual([
      {
        raw: "TEMPO FEW014",
        type: "TEMPO",
        timeIndicators: [],
        wind: null,
        visibility: null,
        weather: [],
        clouds: [
          {
            raw: "FEW014",
            abbreviation: "FEW",
            meaning: "few",
            altitude: 1400,
            cumulonimbus: false,
            toweringCumulus: false,
            type: "layer",
            baseUnavailable: false,
            convectiveType: null,
          },
        ],
        cavok: false,
        unparsedTokens: [],
      },
    ]);
  });

  it("parses a simple report with NOSIG and light rain", () => {
    const result = parseMETAR("SCCI 271700Z 03008KT 9999 -RA FEW015 OVC045 10/08 Q0993 NOSIG");

    expect(result.station).toBe("SCCI");
    expect(result.wind.raw).toBe("03008KT");
    expect(result.visibility.prevailing.raw).toBe("9999");
    expect(result.weather).toEqual([
      {
        raw: "-RA",
        intensity: "-",
        intensityDescription: "light intensity",
        descriptor: null,
        descriptorDescription: null,
        proximity: null,
        proximityDescription: null,
        phenomena: [
          {
            code: "RA",
            description: "rain",
          },
        ],
      },
    ]);
    expect(result.clouds.map((cloud) => cloud.raw)).toEqual(["FEW015", "OVC045"]);
    expect(result.temperature).toEqual({
      raw: "10/08",
      air: 10,
      dewpoint: 8,
    });
    expect(result.altimeter).toEqual({
      raw: "Q0993",
      value: 993,
      unit: "hPa",
      inHg: 29.32,
      hPa: 993,
    });
    expect(result.trend).toEqual([
      {
        raw: "NOSIG",
        type: "NOSIG",
        timeIndicators: [],
        wind: null,
        visibility: null,
        weather: [],
        clouds: [],
        cavok: false,
        unparsedTokens: [],
      },
    ]);
  });

  it("parses wind variation with multiple weather groups and NOSIG", () => {
    const result = parseMETAR("SACO 271700Z 08006KT 350V110 4000 -DZ BR OVC019 20/18 Q1015 NOSIG");

    expect(result.station).toBe("SACO");
    expect(result.wind).toEqual({
      raw: "08006KT",
      speed: 6,
      gust: null,
      direction: 80,
      variation: {
        min: 350,
        max: 110,
      },
      unit: "KT",
      speedOperator: null,
      gustOperator: null,
      calm: false,
    });
    expect(result.visibility.prevailing).toEqual({
      raw: "4000",
      value: 4000,
      unit: "m",
      greaterThan: false,
      lessThan: false,
      unavailable: false,
    });
    expect(result.weather).toEqual([
      {
        raw: "-DZ",
        intensity: "-",
        intensityDescription: "light intensity",
        descriptor: null,
        descriptorDescription: null,
        proximity: null,
        proximityDescription: null,
        phenomena: [
          {
            code: "DZ",
            description: "drizzle",
          },
        ],
      },
      {
        raw: "BR",
        intensity: null,
        intensityDescription: null,
        descriptor: null,
        descriptorDescription: null,
        proximity: null,
        proximityDescription: null,
        phenomena: [
          {
            code: "BR",
            description: "mist",
          },
        ],
      },
    ]);
    expect(result.clouds).toEqual([
      {
        raw: "OVC019",
        abbreviation: "OVC",
        meaning: "overcast",
        altitude: 1900,
        cumulonimbus: false,
        toweringCumulus: false,
        type: "layer",
        baseUnavailable: false,
        convectiveType: null,
      },
    ]);
    expect(result.temperature).toEqual({
      raw: "20/18",
      air: 20,
      dewpoint: 18,
    });
    expect(result.altimeter).toEqual({
      raw: "Q1015",
      value: 1015,
      unit: "hPa",
      inHg: 29.97,
      hPa: 1015,
    });
    expect(result.trend).toEqual([
      {
        raw: "NOSIG",
        type: "NOSIG",
        timeIndicators: [],
        wind: null,
        visibility: null,
        weather: [],
        clouds: [],
        cavok: false,
        unparsedTokens: [],
      },
    ]);
  });

  it("parses haze with reduced metric visibility and wind direction variation", () => {
    const result = parseMETAR("DAUU 271300Z 06013KT 030V090 4500 HZ SCT046 BKN100 19/05 Q1009");

    expect(result.station).toBe("DAUU");
    expect(result.wind).toEqual({
      raw: "06013KT",
      speed: 13,
      gust: null,
      direction: 60,
      variation: {
        min: 30,
        max: 90,
      },
      unit: "KT",
      speedOperator: null,
      gustOperator: null,
      calm: false,
    });
    expect(result.visibility.prevailing).toEqual({
      raw: "4500",
      value: 4500,
      unit: "m",
      greaterThan: false,
      lessThan: false,
      unavailable: false,
    });
    expect(result.weather).toEqual([
      {
        raw: "HZ",
        intensity: null,
        intensityDescription: null,
        descriptor: null,
        descriptorDescription: null,
        proximity: null,
        proximityDescription: null,
        phenomena: [
          {
            code: "HZ",
            description: "haze",
          },
        ],
      },
    ]);
    expect(result.clouds.map((cloud) => cloud.raw)).toEqual(["SCT046", "BKN100"]);
    expect(result.temperature).toEqual({
      raw: "19/05",
      air: 19,
      dewpoint: 5,
    });
    expect(result.altimeter).toEqual({
      raw: "Q1009",
      value: 1009,
      unit: "hPa",
      inHg: 29.8,
      hPa: 1009,
    });
  });

  it("parses cloud layers with unavailable convective suffixes and a simple TEMPO rain trend", () => {
    const result = parseMETAR("LBWN 271700Z AUTO 10011KT 9999 -SHRA OVC009/// 09/09 Q1005 TEMPO 4000 RA");

    expect(result.station).toBe("LBWN");
    expect(result.auto).toBe(true);
    expect(result.wind.raw).toBe("10011KT");
    expect(result.visibility.prevailing.raw).toBe("9999");
    expect(result.weather).toEqual([
      {
        raw: "-SHRA",
        intensity: "-",
        intensityDescription: "light intensity",
        descriptor: "SH",
        descriptorDescription: "showers",
        proximity: null,
        proximityDescription: null,
        phenomena: [
          {
            code: "RA",
            description: "rain",
          },
        ],
      },
    ]);
    expect(result.clouds).toEqual([
      {
        raw: "OVC009///",
        abbreviation: "OVC",
        meaning: "overcast",
        altitude: 900,
        cumulonimbus: false,
        toweringCumulus: false,
        type: "layer",
        baseUnavailable: false,
        convectiveType: null,
        convectiveTypeUnavailable: true,
      },
    ]);
    expect(result.temperature).toEqual({
      raw: "09/09",
      air: 9,
      dewpoint: 9,
    });
    expect(result.altimeter).toEqual({
      raw: "Q1005",
      value: 1005,
      unit: "hPa",
      inHg: 29.68,
      hPa: 1005,
    });
    expect(result.trend).toEqual([
      {
        raw: "TEMPO 4000 RA",
        type: "TEMPO",
        timeIndicators: [],
        wind: null,
        visibility: {
          raw: "4000",
          value: 4000,
          unit: "m",
          greaterThan: false,
          lessThan: false,
          unavailable: false,
        },
        weather: [
          {
            raw: "RA",
            intensity: null,
            intensityDescription: null,
            descriptor: null,
            descriptorDescription: null,
            proximity: null,
            proximityDescription: null,
            phenomena: [
              {
                code: "RA",
                description: "rain",
              },
            ],
          },
        ],
        clouds: [],
        cavok: false,
        unparsedTokens: [],
      },
    ]);
  });

  it("parses calm wind and keeps heavy american remarks isolated from the body", () => {
    const result = parseMETAR("RJTY 271633Z 00000KT 8SM -RA FEW003 OVC009 10/09 A2999 RMK AO2A RAB1555E05DZB05E16RAB16E17RAB27 CIG 006V010 CIG 009 RWY36 SLP159 $");

    expect(result.station).toBe("RJTY");
    expect(result.wind).toEqual({
      raw: "00000KT",
      speed: 0,
      gust: null,
      direction: 0,
      variation: null,
      unit: "KT",
      speedOperator: null,
      gustOperator: null,
      calm: true,
    });
    expect(result.visibility.prevailing).toEqual({
      raw: "8SM",
      value: 8,
      unit: "SM",
      greaterThan: false,
      lessThan: false,
      unavailable: false,
    });
    expect(result.weather[0].raw).toBe("-RA");
    expect(result.clouds.map((cloud) => cloud.raw)).toEqual(["FEW003", "OVC009"]);
    expect(result.temperature).toEqual({
      raw: "10/09",
      air: 10,
      dewpoint: 9,
    });
    expect(result.altimeter).toEqual({
      raw: "A2999",
      value: 29.99,
      unit: "inHg",
      inHg: 29.99,
      hPa: 1016,
    });
    expect(result.remarks).toEqual({
      raw: "AO2A RAB1555E05DZB05E16RAB16E17RAB27 CIG 006V010 CIG 009 RWY36 SLP159 $",
      tokens: ["AO2A", "RAB1555E05DZB05E16RAB16E17RAB27", "CIG", "006V010", "CIG", "009", "RWY36", "SLP159", "$"],
      automatic: false,
      qfe: null,
      unparsedTokens: ["AO2A", "RAB1555E05DZB05E16RAB16E17RAB27", "CIG", "006V010", "CIG", "009", "RWY36", "SLP159", "$"],
    });
  });

  it("parses an AUTO calm-wind report with mist and low ceiling while keeping remarks isolated", () => {
    const result = parseMETAR("RJTR 271710Z AUTO 00000KT 5SM BR SCT005 OVC009 11/10 A2996 RMK AO2 CIG 005V009 SLP148 $");

    expect(result.station).toBe("RJTR");
    expect(result.auto).toBe(true);
    expect(result.wind).toEqual({
      raw: "00000KT",
      speed: 0,
      gust: null,
      direction: 0,
      variation: null,
      unit: "KT",
      speedOperator: null,
      gustOperator: null,
      calm: true,
    });
    expect(result.visibility.prevailing).toEqual({
      raw: "5SM",
      value: 5,
      unit: "SM",
      greaterThan: false,
      lessThan: false,
      unavailable: false,
    });
    expect(result.weather).toEqual([
      {
        raw: "BR",
        intensity: null,
        intensityDescription: null,
        descriptor: null,
        descriptorDescription: null,
        proximity: null,
        proximityDescription: null,
        phenomena: [
          {
            code: "BR",
            description: "mist",
          },
        ],
      },
    ]);
    expect(result.clouds.map((cloud) => cloud.raw)).toEqual(["SCT005", "OVC009"]);
    expect(result.temperature).toEqual({
      raw: "11/10",
      air: 11,
      dewpoint: 10,
    });
    expect(result.altimeter).toEqual({
      raw: "A2996",
      value: 29.96,
      unit: "inHg",
      inHg: 29.96,
      hPa: 1015,
    });
    expect(result.remarks).toEqual({
      raw: "AO2 CIG 005V009 SLP148 $",
      tokens: ["AO2", "CIG", "005V009", "SLP148", "$"],
      automatic: false,
      qfe: null,
      unparsedTokens: ["AO2", "CIG", "005V009", "SLP148", "$"],
    });
  });

  it("parses runway state groups separately from RVR and keeps QFE in remarks", () => {
    const result = parseMETAR("UNOO 271700Z 19002MPS 4600 BR FU NSC 03/01 Q1027 R25/190063 TEMPO 1000 BR FU RMK QFE762");

    expect(result.station).toBe("UNOO");
    expect(result.wind).toEqual({
      raw: "19002MPS",
      speed: 2,
      gust: null,
      direction: 190,
      variation: null,
      unit: "MPS",
      speedOperator: null,
      gustOperator: null,
      calm: false,
    });
    expect(result.visibility.prevailing).toEqual({
      raw: "4600",
      value: 4600,
      unit: "m",
      greaterThan: false,
      lessThan: false,
      unavailable: false,
    });
    expect(result.rvr).toBeNull();
    expect(result.runwayState).toEqual([
      {
        raw: "R25/190063",
        runway: "R25",
        direction: null,
        cleared: false,
        fromRunway: null,
        depositCode: "1",
        contaminationCode: "9",
        depthCode: "00",
        frictionCode: "63",
      },
    ]);
    expect(result.weather.map((item) => item.raw)).toEqual(["BR", "FU"]);
    expect(result.clouds).toEqual([
      {
        raw: "NSC",
        abbreviation: "NSC",
        meaning: "no significant clouds",
        altitude: null,
        cumulonimbus: false,
        toweringCumulus: false,
        type: "clear",
      },
    ]);
    expect(result.temperature).toEqual({
      raw: "03/01",
      air: 3,
      dewpoint: 1,
    });
    expect(result.altimeter).toEqual({
      raw: "Q1027",
      value: 1027,
      unit: "hPa",
      inHg: 30.33,
      hPa: 1027,
    });
    expect(result.trend).toEqual([
      {
        raw: "TEMPO 1000 BR FU",
        type: "TEMPO",
        timeIndicators: [],
        wind: null,
        visibility: {
          raw: "1000",
          value: 1000,
          unit: "m",
          greaterThan: false,
          lessThan: false,
          unavailable: false,
        },
        weather: [
          {
            raw: "BR",
            intensity: null,
            intensityDescription: null,
            descriptor: null,
            descriptorDescription: null,
            proximity: null,
            proximityDescription: null,
            phenomena: [
              {
                code: "BR",
                description: "mist",
              },
            ],
          },
          {
            raw: "FU",
            intensity: null,
            intensityDescription: null,
            descriptor: null,
            descriptorDescription: null,
            proximity: null,
            proximityDescription: null,
            phenomena: [
              {
                code: "FU",
                description: "smoke",
              },
            ],
          },
        ],
        clouds: [],
        cavok: false,
        unparsedTokens: [],
      },
    ]);
    expect(result.remarks).toEqual({
      raw: "QFE762",
      tokens: ["QFE762"],
      automatic: false,
      qfe: {
        raw: "QFE762",
        value: 762,
        unit: "mmHg",
        description: "field elevation pressure",
      },
      unparsedTokens: [],
    });
  });

  it("exports only the main parser function at runtime", () => {
    expect(typeof parseMETAR).toBe("function");
  });
});
