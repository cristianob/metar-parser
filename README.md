# Metar Parser

Parser de METAR em TypeScript com saída estruturada, sem dependências de runtime e pronto para:

- aplicações web com bundlers
- React na web
- React Native
- HTML puro via bundle global

O objetivo da biblioteca é transformar o METAR bruto em um objeto consistente, semântico e fácil de consumir em interfaces, regras de negócio, automações e agentes de AI.

## Instalação

```bash
pnpm add @cristianob/metar-parser
```

## Uso rápido

### ESM / TypeScript

```ts
import parseMETAR, { type MetarParseResult } from "@cristianob/metar-parser";

const result: MetarParseResult = parseMETAR(
  "METAR SBGR 261200Z 35008KT 9999 SCT040 28/18 Q1012"
);

console.log(result.station); // "SBGR"
console.log(result.wind.speed); // 8
console.log(result.altimeter.hPa); // 1012
```

### React / React Native

```ts
import parseMETAR from "@cristianob/metar-parser";

export function parseReport(message: string) {
  return parseMETAR(message);
}
```

### HTML puro

Depois do build, use o bundle global:

```html
<script src="./dist/metar-parser.global.js"></script>
<script>
  const result = window.parseMETAR(
    "METAR SBGL 261300Z 18010KT CAVOK 30/20 Q1015"
  );

  console.log(result);
</script>
```

O bundle global expõe:

- `window.parseMETAR`

## O que a biblioteca parseia

- `METAR` e `SPECI`
- estação ICAO
- data/hora do relatório
- `AUTO`
- correções `COR` e variações `CCx`
- vento, rajada, operadores `P`, direção variável e faixa `dddVddd`
- `CAVOK`
- visibilidade em metros e em `SM`, incluindo:
  - `9999`
  - `////`
  - `10SM`
  - `P6SM`
  - `M1/4SM`
  - `1 1/2SM`
  - visibilidade mínima direcional como `2000SW`
- `RVR` com quantidade ilimitada
- estado de pista suplementar
- weather por grupo semântico
- nuvens, `CB`, `TCU`, bases indisponíveis e `//////CB`
- visibilidade vertical `VV`
- temperatura e dew point, inclusive negativos
- altímetro `Q` e `A`, sempre com `hPa` e `inHg`
- tempo recente `RE...`
- wind shear
- sea state
- tendências `NOSIG`, `BECMG`, `TEMPO`, com `FM`, `TL` e `AT`
- `RMK` parcial com suporte semântico atual para:
  - `AUT`
  - `QFE###`
  - `QFE####`

## Comportamento do parser

- O núcleo do METAR é validado. Estação, hora, vento e visibilidade obrigatória inválidos geram erro.
- A parte suplementar é permissiva. Tokens desconhecidos são ignorados.
- `RMK` é preservado mesmo quando não é totalmente interpretado.
- `weather` é semântico por grupo, não uma lista achatada de abreviações.
- `VV` fica em `visibility.vertical`, não em `clouds`.
- O altímetro sempre expõe:
  - valor na unidade original
  - conversão para `inHg`
  - conversão para `hPa`

## Limitações atuais

- `RMK` americano ainda não é decodificado por completo.
- A propriedade `time` é um `Date` construído com:
  - dia/hora/minuto do METAR
  - mês e ano atuais do ambiente em UTC

Isso funciona bem para consumo operacional corrente, mas não reconstrói contexto histórico completo sem informação externa.

## API

### `parseMETAR(message: string): MetarParseResult`

Recebe um METAR bruto e retorna um objeto estruturado.

```ts
import parseMETAR from "@cristianob/metar-parser";

const result = parseMETAR(
  "METAR SBMN 261200Z 04008KT 9999 SCT025 BKN100 30/24 Q1012 RERA WS ALL RWY RMK AUT QFE750"
);
```

### Erros

Quando o parser falha no núcleo obrigatório do relatório, ele lança `Error` com metadados adicionais:

- `tokenIndex?: number`
- `token?: string | null`

```ts
try {
  parseMETAR("METAR INVALID");
} catch (error) {
  const err = error as Error & { tokenIndex?: number; token?: string | null };

  console.error(err.message);
  console.error(err.tokenIndex);
  console.error(err.token);
}
```

## Exemplo completo

Entrada:

```txt
METAR SBMN 261200Z 04008KT 9999 SCT025 BKN100 30/24 Q1012 RERA WS ALL RWY RMK AUT QFE750
```

Saída resumida:

```json
{
  "original": "METAR SBMN 261200Z 04008KT 9999 SCT025 BKN100 30/24 Q1012 RERA WS ALL RWY RMK AUT QFE750",
  "type": "METAR",
  "station": "SBMN",
  "time": "Date(...)",
  "auto": false,
  "correction": false,
  "wind": {
    "raw": "04008KT",
    "speed": 8,
    "gust": null,
    "direction": 40,
    "variation": null,
    "unit": "KT",
    "speedOperator": null,
    "gustOperator": null,
    "calm": false
  },
  "visibility": {
    "prevailing": {
      "raw": "9999",
      "value": 9999,
      "unit": "m",
      "greaterThan": false,
      "lessThan": false,
      "unavailable": false
    },
    "minimum": null,
    "vertical": null
  },
  "clouds": [
    {
      "raw": "SCT025",
      "abbreviation": "SCT",
      "meaning": "scattered",
      "altitude": 2500,
      "cumulonimbus": false,
      "toweringCumulus": false,
      "type": "layer",
      "baseUnavailable": false,
      "convectiveType": null
    },
    {
      "raw": "BKN100",
      "abbreviation": "BKN",
      "meaning": "broken",
      "altitude": 10000,
      "cumulonimbus": false,
      "toweringCumulus": false,
      "type": "layer",
      "baseUnavailable": false,
      "convectiveType": null
    }
  ],
  "temperature": {
    "raw": "30/24",
    "air": 30,
    "dewpoint": 24
  },
  "altimeter": {
    "raw": "Q1012",
    "value": 1012,
    "unit": "hPa",
    "inHg": 29.88,
    "hPa": 1012
  },
  "recentWeather": [
    {
      "raw": "RERA",
      "code": "RERA",
      "description": "moderate or heavy rain"
    }
  ],
  "windShear": [
    {
      "raw": "WS ALL RWY",
      "allRunways": true,
      "runway": null
    }
  ],
  "remarks": {
    "raw": "AUT QFE750",
    "tokens": ["AUT", "QFE750"],
    "automatic": true,
    "qfe": {
      "raw": "QFE750",
      "value": 750,
      "unit": "mmHg",
      "description": "field elevation pressure"
    },
    "unparsedTokens": []
  }
}
```

## Tipos de saída

As tabelas abaixo descrevem o contrato público da saída.

Convenções:

- `T | null` significa que a propriedade pode existir sem valor
- `[]` representa itens de array
- quando um campo só existe em um subtipo, isso é indicado na descrição

## Resultado principal

| Propriedade | Tipo | Descrição | Exemplo |
| --- | --- | --- | --- |
| `original` | `string` | METAR normalizado, com espaços colapsados. | `"METAR SBGR 261200Z 35008KT 9999 SCT040 28/18 Q1012"` |
| `type` | `"METAR" \| "SPECI"` | Tipo do relatório. | `"METAR"` |
| `station` | `string \| null` | Código ICAO de 4 letras. | `"SBGR"` |
| `time` | `Date \| null` | Data UTC montada a partir de dia/hora/minuto do METAR e mês/ano atuais do ambiente. | `new Date("2026-03-26T12:00:00.000Z")` |
| `auto` | `boolean` | Indica presença de `AUTO`. | `true` |
| `correction` | `boolean \| string` | `true` para `COR` ou `CC`; string quando vier `CCA`, `CCB` etc. | `true`, `"A"` |
| `cavok` | `boolean` | Indica presença de `CAVOK`. | `true` |
| `wind` | `WindGroup` | Bloco de vento. | `{ raw: "35008KT", ... }` |
| `visibility` | `VisibilityBlock` | Bloco de visibilidade. | `{ prevailing: {...}, minimum: null, vertical: null }` |
| `rvr` | `RvrGroup[] \| null` | Lista de RVR. | `[{ raw: "R27L/0800N", ... }]` |
| `runwayState` | `RunwayStateGroup[] \| null` | Estado de pista suplementar. | `[{ raw: "R25/190063", ... }]` |
| `weather` | `WeatherGroup[] \| null` | Weather do corpo principal. | `[{ raw: "-TSRA", ... }]` |
| `trend` | `TrendGroup[] \| null` | Tendências do relatório. | `[{ raw: "NOSIG", ... }]` |
| `clouds` | `CloudGroup[] \| null` | Nuvens do corpo principal. | `[{ raw: "BKN040CB", ... }]` |
| `temperature` | `TemperatureGroup` | Temperatura e dew point. | `{ raw: "28/18", air: 28, dewpoint: 18 }` |
| `altimeter` | `AltimeterGroup` | Altímetro com unidade original e conversões. | `{ raw: "Q1012", value: 1012, unit: "hPa", inHg: 29.88, hPa: 1012 }` |
| `recentWeather` | `RecentWeatherGroup[] \| null` | Tempo recente `RE...`. | `[{ raw: "RERA", code: "RERA", description: "moderate or heavy rain" }]` |
| `windShear` | `WindShearGroup[] \| null` | Wind shear suplementar. | `[{ raw: "WS ALL RWY", allRunways: true, runway: null }]` |
| `seaState` | `SeaStateGroup \| null` | Estado do mar. | `{ raw: "W18/S4", seaSurfaceTemperatureC: 18, seaConditionCode: 4, waveHeightDm: null }` |
| `remarks` | `RemarksGroup \| null` | Grupo `RMK` preservado e parcialmente enriquecido. | `{ raw: "AUT QFE750", ... }` |

## Vento

| Propriedade | Tipo | Descrição | Exemplo |
| --- | --- | --- | --- |
| `wind.raw` | `string \| null` | Grupo bruto de vento. | `"35008G22KT"` |
| `wind.speed` | `number \| null` | Velocidade média. | `8` |
| `wind.gust` | `number \| null` | Rajada. | `22` |
| `wind.direction` | `number \| "VRB" \| null` | Direção do vento ou `VRB`. | `350`, `"VRB"` |
| `wind.variation` | `true \| { min: number; max: number } \| null` | `true` para direção variável pura ou faixa `dddVddd`. | `true`, `{ min: 280, max: 360 }` |
| `wind.unit` | `string \| null` | Unidade original do grupo. | `"KT"`, `"MPS"`, `"KMH"` |
| `wind.speedOperator` | `"P" \| null` | Operador de velocidade maior que o valor. | `"P"` |
| `wind.gustOperator` | `"P" \| null` | Operador de rajada maior que o valor. | `"P"` |
| `wind.calm` | `boolean` | `true` para `00000KT`. | `true` |

## Visibilidade

### Bloco principal

| Propriedade | Tipo | Descrição | Exemplo |
| --- | --- | --- | --- |
| `visibility.prevailing` | `PrevailingVisibility \| null` | Visibilidade predominante. | `{ raw: "9999", value: 9999, unit: "m", greaterThan: false, lessThan: false, unavailable: false }` |
| `visibility.minimum` | `DirectionalVisibility \| null` | Visibilidade mínima direcional. | `{ raw: "2000SW", value: 2000, direction: "SW", unit: "m" }` |
| `visibility.vertical` | `VerticalVisibility \| null` | Visibilidade vertical a partir de `VV`. | `{ raw: "VV002", value: 200, unit: "ft", unavailable: false }` |

### Visibilidade predominante

| Propriedade | Tipo | Descrição | Exemplo |
| --- | --- | --- | --- |
| `visibility.prevailing.raw` | `string` | Grupo bruto. | `"1 3/4SM"` |
| `visibility.prevailing.value` | `number \| null` | Valor numérico. | `9999`, `1.75` |
| `visibility.prevailing.unit` | `"m" \| "SM"` | Unidade. | `"m"`, `"SM"` |
| `visibility.prevailing.greaterThan` | `boolean` | `true` para grupos como `P6SM`. | `true` |
| `visibility.prevailing.lessThan` | `boolean` | `true` para grupos como `M1/4SM`. | `true` |
| `visibility.prevailing.unavailable` | `boolean` | `true` para `////`. | `true` |

### Visibilidade mínima direcional

| Propriedade | Tipo | Descrição | Exemplo |
| --- | --- | --- | --- |
| `visibility.minimum.raw` | `string` | Grupo bruto. | `"2000SW"` |
| `visibility.minimum.value` | `number` | Valor numérico. | `2000` |
| `visibility.minimum.direction` | `"N" \| "NE" \| "E" \| "SE" \| "S" \| "SW" \| "W" \| "NW"` | Direção associada. | `"SW"` |
| `visibility.minimum.unit` | `"m"` | Unidade. | `"m"` |

### Visibilidade vertical

| Propriedade | Tipo | Descrição | Exemplo |
| --- | --- | --- | --- |
| `visibility.vertical.raw` | `string` | Grupo bruto. | `"VV002"` |
| `visibility.vertical.value` | `number \| null` | Valor em pés. | `200` |
| `visibility.vertical.unit` | `"ft"` | Unidade. | `"ft"` |
| `visibility.vertical.unavailable` | `boolean` | `true` para `VV///`. | `false` |

## RVR

| Propriedade | Tipo | Descrição | Exemplo |
| --- | --- | --- | --- |
| `rvr[].raw` | `string` | Grupo bruto de RVR. | `"R27L/0800N"` |
| `rvr[].runway` | `string` | Pista no formato `Rxx`. | `"R27"` |
| `rvr[].direction` | `"L" \| "R" \| "C" \| null` | Lado da pista. | `"L"` |
| `rvr[].separator` | `"/"` | Separador interno do grupo. | `"/"` |
| `rvr[].minIndicator` | `"P" \| "M" \| null` | Operador do valor mínimo. | `"P"` |
| `rvr[].minValue` | `string \| null` | Valor mínimo. | `"2000"` |
| `rvr[].variableIndicator` | `"V" \| null` | Indica faixa variável. | `"V"` |
| `rvr[].maxIndicator` | `"P" \| "M" \| null` | Operador do valor máximo. | `"M"` |
| `rvr[].maxValue` | `string \| null` | Valor máximo. | `"1000"` |
| `rvr[].trend` | `"N" \| "U" \| "D" \| null` | Tendência do RVR. | `"N"` |
| `rvr[].unitsOfMeasure` | `"FT" \| "M" \| null` | Unidade explicitamente declarada. | `"FT"` |
| `rvr[].unit` | `string` | Unidade final normalizada. | `"m"`, `"FT"` |

## Estado de pista

| Propriedade | Tipo | Descrição | Exemplo |
| --- | --- | --- | --- |
| `runwayState[].raw` | `string` | Grupo bruto de estado de pista. | `"R25/190063"` |
| `runwayState[].runway` | `string` | Pista no formato `Rxx`. | `"R25"` |
| `runwayState[].direction` | `"L" \| "R" \| "C" \| null` | Lado da pista. | `null` |
| `runwayState[].cleared` | `boolean` | `true` para grupos `CLRD`. | `false` |
| `runwayState[].fromRunway` | `string \| null` | Código `from runway` em grupos `CLRD`. | `"12"` |
| `runwayState[].depositCode` | `string \| null` | Código de depósito. | `"1"` |
| `runwayState[].contaminationCode` | `string \| null` | Código de contaminação. | `"9"` |
| `runwayState[].depthCode` | `string \| null` | Código de profundidade. | `"00"` |
| `runwayState[].frictionCode` | `string \| null` | Código de frenagem/fricção. | `"63"` |

## Weather

`weather` representa grupos meteorológicos completos. Isso evita perder a relação entre intensidade, descritor e fenômenos.

Exemplo:

```txt
-TSRA BR
```

Saída:

```json
[
  {
    "raw": "-TSRA",
    "intensity": "-",
    "descriptor": "TS",
    "phenomena": [{ "code": "RA", "description": "rain" }]
  },
  {
    "raw": "BR",
    "phenomena": [{ "code": "BR", "description": "mist" }]
  }
]
```

| Propriedade | Tipo | Descrição | Exemplo |
| --- | --- | --- | --- |
| `weather[].raw` | `string` | Grupo meteorológico bruto. | `"-TSRA"` |
| `weather[].intensity` | `string \| null` | Intensidade `-` ou `+`. | `"-"` |
| `weather[].intensityDescription` | `string \| null` | Descrição da intensidade. | `"light intensity"` |
| `weather[].descriptor` | `string \| null` | Descritor do grupo. | `"TS"`, `"SH"`, `"FZ"` |
| `weather[].descriptorDescription` | `string \| null` | Descrição do descritor. | `"thunderstorm"` |
| `weather[].proximity` | `string \| null` | Código de proximidade, hoje `VC`. | `"VC"` |
| `weather[].proximityDescription` | `string \| null` | Descrição da proximidade. | `"in the vicinity"` |
| `weather[].phenomena` | `WeatherPhenomenon[]` | Fenômenos do grupo. | `[{ code: "RA", description: "rain" }]` |
| `weather[].phenomena[].code` | `string` | Código do fenômeno. | `"RA"`, `"BR"`, `"PY"` |
| `weather[].phenomena[].description` | `string` | Descrição do fenômeno. | `"rain"` |

## Tendências

Os subblocos internos de `trend` reutilizam a mesma semântica de `wind`, `visibility.prevailing`, `weather` e `clouds`.

| Propriedade | Tipo | Descrição | Exemplo |
| --- | --- | --- | --- |
| `trend[].raw` | `string` | Grupo bruto de tendência. | `"TEMPO FM1430 TL1530 4000 SHRA BKN014"` |
| `trend[].type` | `"NOSIG" \| "BECMG" \| "TEMPO"` | Tipo da tendência. | `"TEMPO"` |
| `trend[].timeIndicators` | `TrendTimeIndicator[]` | Indicadores temporais. | `[{ raw: "FM1430", kind: "FM", value: "1430" }]` |
| `trend[].wind` | `WindGroup \| null` | Vento específico da tendência. | `{ raw: "25015KT", ... }` |
| `trend[].visibility` | `PrevailingVisibility \| null` | Visibilidade da tendência. | `{ raw: "4000", value: 4000, unit: "m", greaterThan: false, lessThan: false, unavailable: false }` |
| `trend[].weather` | `WeatherGroup[]` | Weather da tendência. | `[{ raw: "SHRA", ... }]` |
| `trend[].clouds` | `CloudGroup[]` | Nuvens da tendência. | `[{ raw: "BKN014", ... }]` |
| `trend[].cavok` | `boolean` | `true` se a tendência trouxer `CAVOK`. | `false` |
| `trend[].unparsedTokens` | `string[]` | Tokens não reconhecidos dentro da tendência. | `[]` |

### Indicadores de tempo da tendência

| Propriedade | Tipo | Descrição | Exemplo |
| --- | --- | --- | --- |
| `trend[].timeIndicators[].raw` | `string` | Grupo bruto do indicador. | `"TL1530"` |
| `trend[].timeIndicators[].kind` | `"FM" \| "TL" \| "AT"` | Tipo do indicador. | `"FM"` |
| `trend[].timeIndicators[].value` | `string` | Valor horário sem separadores. | `"1430"` |

## Nuvens

`VV` não entra em `clouds`. Ele é exposto em `visibility.vertical`.

| Propriedade | Tipo | Descrição | Exemplo |
| --- | --- | --- | --- |
| `clouds[].raw` | `string` | Grupo bruto de nuvem. | `"BKN040CB"` |
| `clouds[].abbreviation` | `"NCD" \| "NSC" \| "SKC" \| "CLR" \| "FEW" \| "SCT" \| "BKN" \| "OVC" \| "CB"` | Código principal do grupo. | `"BKN"` |
| `clouds[].meaning` | `string` | Descrição textual. | `"broken"` |
| `clouds[].altitude` | `number \| null` | Base em pés. | `4000` |
| `clouds[].cumulonimbus` | `boolean` | Marca `CB`. | `true` |
| `clouds[].toweringCumulus` | `boolean` | Marca `TCU`. | `true` |
| `clouds[].type` | `"clear" \| "layer" \| "obscuredCb"` | Subtipo do grupo. | `"layer"` |
| `clouds[].baseUnavailable` | `boolean` | Disponível apenas em grupos `layer`; indica base `///`. | `false` |
| `clouds[].convectiveType` | `"CB" \| "TCU" \| null` | Disponível apenas em grupos `layer`; tipo convectivo. | `"CB"` |
| `clouds[].convectiveTypeUnavailable` | `true \| undefined` | Disponível apenas em grupos `layer`; `true` quando o tipo convectivo veio como `///`. | `true` |
| `clouds[].unavailable` | `true` | Disponível apenas em `obscuredCb`; indica nuvem obscurecida. | `true` |

## Temperatura e altímetro

### Temperatura

| Propriedade | Tipo | Descrição | Exemplo |
| --- | --- | --- | --- |
| `temperature.raw` | `string \| null` | Grupo bruto de temperatura/dew point. | `"M07/M09"` |
| `temperature.air` | `number \| null` | Temperatura do ar em Celsius. | `-7` |
| `temperature.dewpoint` | `number \| null` | Dew point em Celsius. | `-9` |

### Altímetro

| Propriedade | Tipo | Descrição | Exemplo |
| --- | --- | --- | --- |
| `altimeter.raw` | `string \| null` | Grupo bruto do altímetro. | `"A2992"` |
| `altimeter.value` | `number \| null` | Valor na unidade original. | `29.92`, `1012` |
| `altimeter.unit` | `"hPa" \| "inHg" \| null` | Unidade original. | `"inHg"` |
| `altimeter.inHg` | `number \| null` | Valor calculado em polegadas de mercúrio. | `29.92` |
| `altimeter.hPa` | `number \| null` | Valor calculado em hectopascais. | `1013` |

## Grupos suplementares

### Recent weather

| Propriedade | Tipo | Descrição | Exemplo |
| --- | --- | --- | --- |
| `recentWeather[].raw` | `string` | Grupo bruto de tempo recente. | `"RERA"` |
| `recentWeather[].code` | `string` | Código completo do grupo. | `"RERA"` |
| `recentWeather[].description` | `string \| null` | Descrição textual, quando conhecida. | `"moderate or heavy rain"` |

### Wind shear

| Propriedade | Tipo | Descrição | Exemplo |
| --- | --- | --- | --- |
| `windShear[].raw` | `string` | Grupo bruto de wind shear. | `"WS R27L"` |
| `windShear[].allRunways` | `boolean` | `true` para `WS ALL RWY`. | `true` |
| `windShear[].runway` | `string \| null` | Identificador da pista sem o prefixo `R`. | `"27L"` |

### Sea state

| Propriedade | Tipo | Descrição | Exemplo |
| --- | --- | --- | --- |
| `seaState.raw` | `string` | Grupo bruto do estado do mar. | `"W18/H015"` |
| `seaState.seaSurfaceTemperatureC` | `number \| null` | Temperatura da superfície do mar em Celsius. | `18` |
| `seaState.seaConditionCode` | `number \| null` | Código de estado do mar. | `4` |
| `seaState.waveHeightDm` | `number \| null` | Altura de onda em decímetros. | `15` |

### Remarks

`remarks` preserva o conteúdo após `RMK` e enriquece apenas os subgrupos suportados.

| Propriedade | Tipo | Descrição | Exemplo |
| --- | --- | --- | --- |
| `remarks.raw` | `string` | Conteúdo bruto após `RMK`. | `"AUT QFE750"` |
| `remarks.tokens` | `string[]` | Tokens do bloco `RMK`. | `["AUT", "QFE750"]` |
| `remarks.automatic` | `boolean` | `true` quando `AUT` aparece em `RMK`. | `true` |
| `remarks.qfe` | `QfeGroup \| null` | QFE parseado quando presente. | `{ raw: "QFE750", value: 750, unit: "mmHg", description: "field elevation pressure" }` |
| `remarks.unparsedTokens` | `string[]` | Tokens ainda não decodificados semanticamente. | `["AO2", "SLP159", "$"]` |

### QFE em `remarks`

| Propriedade | Tipo | Descrição | Exemplo |
| --- | --- | --- | --- |
| `remarks.qfe.raw` | `string` | Grupo bruto de QFE. | `"QFE762"` |
| `remarks.qfe.value` | `number` | Valor numérico. | `762` |
| `remarks.qfe.unit` | `"mmHg" \| "hPa"` | Unidade inferida pelo tamanho do número. | `"mmHg"` |
| `remarks.qfe.description` | `string` | Descrição textual. | `"field elevation pressure"` |

## Compatibilidade

- ESM: suportado
- Web bundlers: suportado
- React Native: suportado
- HTML puro via bundle global: suportado

