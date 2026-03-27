import parseMETAR from "./metar-parser";

declare global {
  interface Window {
    parseMETAR?: typeof parseMETAR;
  }
}

globalThis.parseMETAR = parseMETAR;
