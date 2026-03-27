# metar-parser

Parser de METAR com saída estruturada, tipada em TypeScript e pensada para uso em:

- Web com bundlers
- React na web
- React Native
- HTML puro via bundle global

O foco da biblioteca é entregar um JSON semanticamente útil, sem achatar demais o relatório, mas ainda simples de consumir em aplicações, automações e agentes de AI.

Observação importante: o nome atual no `package.json` é `metar`, embora o repositório e os arquivos usem o nome `metar-parser`.

## O que a biblioteca parseia

- `METAR` e `SPECI`
- Estação ICAO
- Data/hora do relatório
- `AUTO`
- Correções `COR` e variações `CCx`
- Vento, rajada, operadores `P`, direção variável e faixa `dddVddd`
- `CAVOK`
- Visibilidade métrica e em `SM`, incluindo:
  - `9999`
  - `////`
  - `10SM`
  - `P6SM`
  - `M1/4SM`
  - `1 1/2SM`
  - visibilidade mínima direcional como `2000SW`
- `RVR` sem limite fixo de quantidade
- Estado de pista suplementar, como `R25/190063`
- Weather por grupo semântico, incluindo fenômenos combinados
- Nuvens, `CB`, `TCU`, bases indisponíveis e `//////CB`
- Visibilidade vertical (`VV`) separada de `clouds`
- Temperatura e dew point, inclusive negativos
- Altímetro `Q` e `A`, sempre calculando `hPa` e `inHg`
- Tempo recente `RE...`
- Wind shear `WS ALL RWY` e `WS Rxx`
- Sea state
- Tendências `NOSIG`, `BECMG`, `TEMPO`, com `FM`, `TL` e `AT`
- `RMK` parcial com parsing semântico de:
  - `AUT`
  - `QFE###`
  - `QFE####`

## Filosofia de parsing

- O parser é estrito no núcleo do relatório:
  - estação inválida gera erro
  - hora inválida gera erro
  - vento inválido gera erro
  - visibilidade obrigatória inválida gera erro quando `CAVOK` não está presente
- O parser é permissivo no restante:
  - tokens suplementares desconhecidos são ignorados
  - `RMK` é preservado mesmo quando quase tudo dentro dele fica não parseado
- A saída privilegia semântica:
  - `weather` representa grupos meteorológicos, não uma lista achatada de abreviações
  - `VV` fica em `visibility.vertical`, não em `clouds`
  - altímetro sempre expõe as duas unidades calculadas

## Limitações conhecidas

- `RMK` americano ainda não é completamente decodificado. Apenas `AUT` e `QFE` são estruturados hoje. Todo o resto continua disponível em `remarks.raw`, `remarks.tokens` e `remarks.unparsedTokens`.
- A data `time` é um `Date`, mas o parser monta o objeto usando:
  - dia/hora/minuto do METAR
  - mês e ano atuais do ambiente em UTC

Isso é suficiente para grande parte dos usos operacionais, mas não reconstrói mês/ano históricos sem contexto externo.

## Instalação

```bash
pnpm add metar
```

Ou equivalente com seu gerenciador de pacotes.

## Uso

### TypeScript / ESM

```ts
import parseMETAR, { type MetarParseResult } from "metar";

const result: MetarParseResult = parseMETAR(
  "METAR SBGR 261200Z 35008KT 9999 SCT040 28/18 Q1012"
);

console.log(result.station); // "SBGR"
console.log(result.altimeter.hPa); // 1012
```

### React / React Native

```ts
import parseMETAR from "metar";

const parsed = parseMETAR("SPECI SBCF 261730Z 31020G35KT 3000 SHRA SCT015 BKN040CB 20/18 Q1010");
```

Não há dependência de Node APIs em runtime. O parser é puro e pode ser chamado diretamente em componentes, hooks, stores ou serviços.

### HTML puro

Após build:

```html
<script src="./dist/metar-parser.global.js"></script>
<script>
  const result = window.parseMETAR("METAR SBGL 261300Z 18010KT CAVOK 30/20 Q1015");
  console.log(result);
</script>
```

O bundle global expõe:

- `window.parseMETAR`

## API pública

### `parseMETAR(message: string): MetarParseResult`

Recebe uma string com o METAR bruto e retorna o objeto estruturado.

Exemplo:

```ts
import parseMETAR from "metar";

const result = parseMETAR(
  "METAR SBMN 261200Z 04008KT 9999 SCT025 BKN100 30/24 Q1012 RERA WS ALL RWY RMK AUT QFE750"
);
```

### Erros

Quando o núcleo obrigatório do METAR é inválido, a biblioteca lança `Error` com metadados adicionais:

- `tokenIndex?: number`
- `token?: string | null`

Exemplo de uso defensivo:

```ts
try {
  parseMETAR("METAR INVALID");
} catch (error) {
  const err = error as Error & { tokenIndex?: number; token?: string | null };
  console.error(err.message, err.tokenIndex, err.token);
}
```

## Estrutura do projeto

Para desenvolvedores e agentes:

- [`src/metar-parser.ts`](./src/metar-parser.ts): fonte principal e contrato da biblioteca
- [`src/metar-parser.global.ts`](./src/metar-parser.global.ts): entrada do bundle global para browser
- [`test/metar-parser.test.ts`](./test/metar-parser.test.ts): suíte Vitest
- [`test/metar-examples.js`](./test/metar-examples.js): exemplos compartilhados pelos testes
- [`test/metar-examples.browser.js`](./test/metar-examples.browser.js): lista global para o HTML manual
- [`test/test.html`](./test/test.html): playground manual no navegador
- [`tsup.config.ts`](./tsup.config.ts): build ESM e global

## Build e testes

```bash
pnpm build
pnpm test
```

Artefatos gerados:

- `dist/metar-parser.js`
- `dist/metar-parser.global.js`
- `dist/metar-parser.d.ts`

`dist/` é artefato de build. A fonte de verdade está em `src/`.

## Decisões de modelagem

### `weather` nao e uma lista achatada

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

Isso preserva a semântica real do grupo meteorológico.

### `VV` fica em `visibility.vertical`

Exemplo:

```txt
VV002
```

Saída:

```json
{
  "visibility": {
    "vertical": {
      "raw": "VV002",
      "value": 200,
      "unit": "ft",
      "unavailable": false
    }
  },
  "clouds": null
}
```

### Altímetro sempre expõe as duas unidades

Exemplos:

- `Q1012`:
  - `altimeter.value = 1012`
  - `altimeter.unit = "hPa"`
  - `altimeter.hPa = 1012`
  - `altimeter.inHg = 29.88`
- `A2992`:
  - `altimeter.value = 29.92`
  - `altimeter.unit = "inHg"`
  - `altimeter.inHg = 29.92`
  - `altimeter.hPa = 1013`

## Tabela completa de output

Convenções:

- `T | null` significa que o campo existe, mas pode vir `null`
- `[]` indica item de array
- as propriedades de array usam notação em ponto para descrever cada item
- quando um campo só existe em um subtipo de união, isso aparece na coluna de tipo

| Propriedade | Tipo | Descrição | Exemplo |
| --- | --- | --- | --- |
| `original` | `string` | METAR normalizado, com espaços colapsados. | `"METAR SBGR 261200Z 35008KT 9999 SCT040 28/18 Q1012"` |
| `type` | `"METAR" \| "SPECI"` | Tipo do relatório. | `"METAR"` |
| `station` | `string \| null` | Código ICAO de 4 letras. | `"SBGR"` |
| `time` | `Date \| null` | Data UTC montada a partir de dia/hora/minuto do relatório e mês/ano atuais do ambiente. | `new Date("2026-03-26T12:00:00.000Z")` |
| `auto` | `boolean` | Indica presença de `AUTO`. | `true` |
| `correction` | `boolean \| string` | `true` para `COR` ou `CC`, string quando vier `CCA`, `CCB` etc. | `true`, `"A"` |
| `wind` | `WindGroup` | Bloco completo de vento. | `{ raw: "35008G22KT", ... }` |
| `wind.raw` | `string \| null` | Grupo bruto de vento. | `"35008G22KT"` |
| `wind.speed` | `number \| null` | Velocidade média. | `8` |
| `wind.gust` | `number \| null` | Rajada. | `22` |
| `wind.direction` | `number \| "VRB" \| null` | Direção do vento ou `VRB`. | `350`, `"VRB"` |
| `wind.variation` | `true \| { min: number; max: number } \| null` | `true` para direção variável pura, ou faixa `dddVddd`. | `true`, `{ min: 280, max: 360 }` |
| `wind.unit` | `string \| null` | Unidade original do grupo de vento. | `"KT"`, `"MPS"`, `"KMH"` |
| `wind.speedOperator` | `"P" \| null` | Operador de velocidade maior que o valor. | `"P"` |
| `wind.gustOperator` | `"P" \| null` | Operador de rajada maior que o valor. | `"P"` |
| `wind.calm` | `boolean` | `true` para `00000KT`. | `true` |
| `cavok` | `boolean` | Indica presença de `CAVOK`. | `true` |
| `visibility` | `VisibilityBlock` | Bloco principal de visibilidade. | `{ prevailing: {...}, minimum: null, vertical: null }` |
| `visibility.prevailing` | `PrevailingVisibility \| null` | Visibilidade predominante. | `{ raw: "9999", value: 9999, unit: "m", greaterThan: false, lessThan: false, unavailable: false }` |
| `visibility.prevailing.raw` | `string` | Grupo bruto de visibilidade predominante. | `"1 3/4SM"` |
| `visibility.prevailing.value` | `number \| null` | Valor numérico. | `9999`, `1.75` |
| `visibility.prevailing.unit` | `"m" \| "SM"` | Unidade da visibilidade predominante. | `"m"`, `"SM"` |
| `visibility.prevailing.greaterThan` | `boolean` | `true` para grupos como `P6SM`. | `true` |
| `visibility.prevailing.lessThan` | `boolean` | `true` para grupos como `M1/4SM`. | `true` |
| `visibility.prevailing.unavailable` | `boolean` | `true` para `////`. | `true` |
| `visibility.minimum` | `DirectionalVisibility \| null` | Visibilidade mínima direcional. | `{ raw: "2000SW", value: 2000, direction: "SW", unit: "m" }` |
| `visibility.minimum.raw` | `string` | Grupo bruto da visibilidade mínima direcional. | `"2000SW"` |
| `visibility.minimum.value` | `number` | Valor numérico da mínima direcional. | `2000` |
| `visibility.minimum.direction` | `"N" \| "NE" \| "E" \| "SE" \| "S" \| "SW" \| "W" \| "NW"` | Direção associada. | `"SW"` |
| `visibility.minimum.unit` | `"m"` | Unidade da visibilidade mínima direcional. | `"m"` |
| `visibility.vertical` | `VerticalVisibility \| null` | Visibilidade vertical a partir de `VV`. | `{ raw: "VV002", value: 200, unit: "ft", unavailable: false }` |
| `visibility.vertical.raw` | `string` | Grupo bruto de visibilidade vertical. | `"VV002"` |
| `visibility.vertical.value` | `number \| null` | Valor em pés. | `200` |
| `visibility.vertical.unit` | `"ft"` | Unidade da visibilidade vertical. | `"ft"` |
| `visibility.vertical.unavailable` | `boolean` | `true` para `VV///`. | `false` |
| `rvr` | `RvrGroup[] \| null` | Lista de grupos de alcance visual na pista. | `[{ raw: "R27L/0800N", ... }]` |
| `rvr[].raw` | `string` | Grupo bruto de RVR. | `"R27L/0800N"` |
| `rvr[].runway` | `string` | Pista no formato `Rxx`. | `"R27"` |
| `rvr[].direction` | `"L" \| "R" \| "C" \| null` | Lado da pista. | `"L"` |
| `rvr[].separator` | `"/"` | Separador interno do grupo. | `"/"` |
| `rvr[].minIndicator` | `"P" \| "M" \| null` | Operador do valor mínimo. | `"P"` |
| `rvr[].minValue` | `string \| null` | Valor mínimo em string. | `"2000"` |
| `rvr[].variableIndicator` | `"V" \| null` | Indica faixa variável. | `"V"` |
| `rvr[].maxIndicator` | `"P" \| "M" \| null` | Operador do valor máximo. | `"M"` |
| `rvr[].maxValue` | `string \| null` | Valor máximo em string. | `"1000"` |
| `rvr[].trend` | `"N" \| "U" \| "D" \| null` | Tendência do RVR. | `"N"` |
| `rvr[].unitsOfMeasure` | `"FT" \| "M" \| null` | Unidade explicitamente declarada no grupo. | `"FT"` |
| `rvr[].unit` | `string` | Unidade final normalizada. | `"m"`, `"FT"` |
| `runwayState` | `RunwayStateGroup[] \| null` | Estado de pista suplementar. | `[{ raw: "R25/190063", ... }]` |
| `runwayState[].raw` | `string` | Grupo bruto de estado de pista. | `"R25/190063"` |
| `runwayState[].runway` | `string` | Pista no formato `Rxx`. | `"R25"` |
| `runwayState[].direction` | `"L" \| "R" \| "C" \| null` | Lado da pista. | `null` |
| `runwayState[].cleared` | `boolean` | `true` para grupos `CLRD`. | `false` |
| `runwayState[].fromRunway` | `string \| null` | Código `from runway` em grupos `CLRD`. | `"12"` |
| `runwayState[].depositCode` | `string \| null` | Código de depósito. | `"1"` |
| `runwayState[].contaminationCode` | `string \| null` | Código de contaminação. | `"9"` |
| `runwayState[].depthCode` | `string \| null` | Código de profundidade. | `"00"` |
| `runwayState[].frictionCode` | `string \| null` | Código de frenagem/fricção. | `"63"` |
| `weather` | `WeatherGroup[] \| null` | Lista semântica de grupos meteorológicos. | `[{ raw: "-TSRA", ... }, { raw: "BR", ... }]` |
| `weather[].raw` | `string` | Grupo meteorológico bruto. | `"-TSRA"` |
| `weather[].intensity` | `string \| null` | Intensidade `-` ou `+`. | `"-"` |
| `weather[].intensityDescription` | `string \| null` | Descrição textual da intensidade. | `"light intensity"` |
| `weather[].descriptor` | `string \| null` | Descritor do grupo. | `"TS"`, `"SH"`, `"FZ"` |
| `weather[].descriptorDescription` | `string \| null` | Descrição textual do descritor. | `"thunderstorm"` |
| `weather[].proximity` | `string \| null` | Código de proximidade, hoje `VC`. | `"VC"` |
| `weather[].proximityDescription` | `string \| null` | Descrição textual da proximidade. | `"in the vicinity"` |
| `weather[].phenomena` | `WeatherPhenomenon[]` | Fenômenos contidos no grupo. | `[{ code: "RA", description: "rain" }]` |
| `weather[].phenomena[].code` | `string` | Código do fenômeno. | `"RA"`, `"BR"`, `"PY"` |
| `weather[].phenomena[].description` | `string` | Descrição textual do fenômeno. | `"rain"` |
| `trend` | `TrendGroup[] \| null` | Tendências do relatório. | `[{ raw: "TEMPO FM1430 TL1530 4000 SHRA BKN014", ... }]` |
| `trend[].raw` | `string` | Grupo bruto de tendência. | `"NOSIG"` |
| `trend[].type` | `"NOSIG" \| "BECMG" \| "TEMPO"` | Tipo da tendência. | `"TEMPO"` |
| `trend[].timeIndicators` | `TrendTimeIndicator[]` | Indicadores de tempo da tendência. | `[{ raw: "FM1430", kind: "FM", value: "1430" }]` |
| `trend[].timeIndicators[].raw` | `string` | Grupo bruto do indicador de tempo. | `"TL1530"` |
| `trend[].timeIndicators[].kind` | `"FM" \| "TL" \| "AT"` | Tipo do indicador temporal. | `"FM"` |
| `trend[].timeIndicators[].value` | `string` | Valor horário sem separadores. | `"1430"` |
| `trend[].wind` | `WindGroup \| null` | Vento específico da tendência. | `{ raw: "25015KT", ... }` |
| `trend[].wind.*` | `mesma estrutura de \`wind.*\`` | Quando presente, reutiliza exatamente o mesmo shape e a mesma semântica do bloco principal `wind`. | `trend[0].wind.speed = 15` |
| `trend[].visibility` | `PrevailingVisibility \| null` | Visibilidade predominante da tendência. | `{ raw: "4000", value: 4000, unit: "m", greaterThan: false, lessThan: false, unavailable: false }` |
| `trend[].visibility.*` | `mesma estrutura de \`visibility.prevailing.*\`` | Quando presente, reutiliza exatamente o mesmo shape e a mesma semântica de `visibility.prevailing`. | `trend[0].visibility.unit = "m"` |
| `trend[].weather` | `WeatherGroup[]` | Weather dentro da tendência. | `[{ raw: "SHRA", ... }]` |
| `trend[].weather[].*` | `mesma estrutura de \`weather[].*\`` | Cada item reutiliza exatamente o mesmo shape e a mesma semântica do bloco principal `weather`. | `trend[0].weather[0].descriptor = "SH"` |
| `trend[].clouds` | `CloudGroup[]` | Nuvens dentro da tendência. | `[{ raw: "BKN014", ... }]` |
| `trend[].clouds[].*` | `mesma estrutura de \`clouds[].*\`` | Cada item reutiliza exatamente o mesmo shape e a mesma semântica do bloco principal `clouds`. | `trend[0].clouds[0].abbreviation = "BKN"` |
| `trend[].cavok` | `boolean` | `true` se a tendência trouxer `CAVOK`. | `false` |
| `trend[].unparsedTokens` | `string[]` | Tokens não reconhecidos dentro da tendência. | `[]` |
| `clouds` | `CloudGroup[] \| null` | Lista de grupos de nuvem do corpo principal. `VV` fica fora daqui. | `[{ raw: "BKN040CB", ... }]` |
| `clouds[].raw` | `string` | Grupo bruto de nuvem. | `"SCT040"`, `"BKN040CB"`, `"//////CB"` |
| `clouds[].abbreviation` | `"NCD" \| "NSC" \| "SKC" \| "CLR" \| "FEW" \| "SCT" \| "BKN" \| "OVC" \| "CB"` | Código principal do grupo. | `"BKN"` |
| `clouds[].meaning` | `string` | Descrição textual do grupo. | `"broken"`, `"cumulonimbus obscured"` |
| `clouds[].altitude` | `number \| null` | Base em pés. | `4000` |
| `clouds[].cumulonimbus` | `boolean` | Marca `CB`. | `true` |
| `clouds[].toweringCumulus` | `boolean` | Marca `TCU`. | `true` |
| `clouds[].type` | `"clear" \| "layer" \| "obscuredCb"` | Subtipo do grupo de nuvens. | `"layer"` |
| `clouds[].baseUnavailable` | `boolean` | Disponível apenas em grupos `layer`; indica base `///`. | `false` |
| `clouds[].convectiveType` | `"CB" \| "TCU" \| null` | Disponível apenas em grupos `layer`; tipo convectivo. | `"CB"` |
| `clouds[].convectiveTypeUnavailable` | `true \| undefined` | Disponível apenas em grupos `layer`; `true` quando o tipo convectivo veio como `///`. | `true` |
| `clouds[].unavailable` | `true` | Disponível apenas em `obscuredCb`; indica nuvem obscurecida. | `true` |
| `temperature` | `TemperatureGroup` | Temperatura e dew point. | `{ raw: "28/18", air: 28, dewpoint: 18 }` |
| `temperature.raw` | `string \| null` | Grupo bruto de temperatura/dew point. | `"M07/M09"` |
| `temperature.air` | `number \| null` | Temperatura do ar em graus Celsius. | `-7` |
| `temperature.dewpoint` | `number \| null` | Dew point em graus Celsius. | `-9` |
| `altimeter` | `AltimeterGroup` | Bloco de altímetro com unidade original e conversões calculadas. | `{ raw: "Q1012", value: 1012, unit: "hPa", inHg: 29.88, hPa: 1012 }` |
| `altimeter.raw` | `string \| null` | Grupo bruto do altímetro. | `"A2992"` |
| `altimeter.value` | `number \| null` | Valor na unidade original. | `29.92`, `1012` |
| `altimeter.unit` | `"hPa" \| "inHg" \| null` | Unidade original do altímetro. | `"inHg"` |
| `altimeter.inHg` | `number \| null` | Valor calculado em polegadas de mercúrio. | `29.92` |
| `altimeter.hPa` | `number \| null` | Valor calculado em hectopascais. | `1013` |
| `recentWeather` | `RecentWeatherGroup[] \| null` | Tempo recente `RE...`. | `[{ raw: "RERA", code: "RERA", description: "moderate or heavy rain" }]` |
| `recentWeather[].raw` | `string` | Grupo bruto de tempo recente. | `"RERA"` |
| `recentWeather[].code` | `string` | Código completo do grupo. | `"RERA"` |
| `recentWeather[].description` | `string \| null` | Descrição textual, quando conhecida. | `"moderate or heavy rain"` |
| `windShear` | `WindShearGroup[] \| null` | Wind shear suplementar. | `[{ raw: "WS ALL RWY", allRunways: true, runway: null }]` |
| `windShear[].raw` | `string` | Grupo bruto de wind shear. | `"WS R27L"` |
| `windShear[].allRunways` | `boolean` | `true` para `WS ALL RWY`. | `true` |
| `windShear[].runway` | `string \| null` | Identificador da pista sem o prefixo `R`. | `"27L"` |
| `seaState` | `SeaStateGroup \| null` | Estado do mar. | `{ raw: "W18/S4", seaSurfaceTemperatureC: 18, seaConditionCode: 4, waveHeightDm: null }` |
| `seaState.raw` | `string` | Grupo bruto do estado do mar. | `"W18/H015"` |
| `seaState.seaSurfaceTemperatureC` | `number \| null` | Temperatura da superfície do mar em Celsius. | `18` |
| `seaState.seaConditionCode` | `number \| null` | Código de estado do mar. | `4` |
| `seaState.waveHeightDm` | `number \| null` | Altura de onda em decímetros. | `15` |
| `remarks` | `RemarksGroup \| null` | Grupo `RMK` preservado e parcialmente enriquecido. | `{ raw: "AUT QFE750", ... }` |
| `remarks.raw` | `string` | Conteúdo bruto após `RMK`. | `"AUT QFE750"` |
| `remarks.tokens` | `string[]` | Tokens separados do bloco `RMK`. | `["AUT", "QFE750"]` |
| `remarks.automatic` | `boolean` | `true` quando `AUT` aparece em `RMK`. | `true` |
| `remarks.qfe` | `QfeGroup \| null` | QFE parseado quando presente. | `{ raw: "QFE750", value: 750, unit: "mmHg", description: "field elevation pressure" }` |
| `remarks.qfe.raw` | `string` | Grupo bruto de QFE. | `"QFE762"` |
| `remarks.qfe.value` | `number` | Valor numérico do QFE. | `762` |
| `remarks.qfe.unit` | `"mmHg" \| "hPa"` | Unidade inferida pelo tamanho do número. | `"mmHg"` |
| `remarks.qfe.description` | `string` | Descrição textual do QFE. | `"field elevation pressure"` |
| `remarks.unparsedTokens` | `string[]` | Tokens do `RMK` ainda não decodificados semanticamente. | `["AO2", "SLP159", "$"]` |

## Exemplo de saída

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
  "cavok": false,
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
  "rvr": null,
  "runwayState": null,
  "weather": null,
  "trend": null,
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
  "seaState": null,
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

## Casos cobertos pela suíte

A suíte automatizada usa os exemplos históricos do HTML e regressões adicionais com casos como:

- METARs brasileiros e internacionais
- `AUTO`, `COR`, `CCA`
- `CAVOK`
- visibilidade direcional
- visibilidade fracionária em `SM`
- `VV`
- múltiplos `RVR`
- `CB`, `TCU`, `OVC009///`
- `NOSIG`, `BECMG`, `TEMPO`
- `RMK` com `QFE`
- estado de pista suplementar

## Diretrizes para manutenção

- Não edite `dist/` manualmente
- Atualize `src/metar-parser.ts`
- Rode:

```bash
pnpm build
pnpm test
```

- Quando adicionar novo comportamento, inclua:
  - um caso na suíte `test/metar-parser.test.ts`
  - e, se fizer sentido para inspeção manual, um exemplo em `test/metar-examples.js`

## Compatibilidade

- ESM: suportado
- Web bundlers: suportado
- React Native: suportado
- HTML puro via global bundle: suportado
- CommonJS via `require(...)`: nao suportado no estado atual
