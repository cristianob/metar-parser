const METAR_EXAMPLES = [
  {
    label: "SBGR — Condições normais",
    metar: "METAR SBGR 261200Z 35008KT 9999 SCT040 28/18 Q1012",
  },
  {
    label: "SBGL — CAVOK",
    metar: "METAR SBGL 261300Z 18010KT CAVOK 30/20 Q1015",
  },
  {
    label: "SBRJ — Vento calmo, nevoeiro",
    metar: "METAR SBRJ 260900Z 00000KT 0400 FG VV002 18/18 Q1018",
  },
  {
    label: "SBSP — Chuva com trovoada e RVR",
    metar: "METAR SBSP 261500Z 27015G28KT 2000 R27L/0800N TSRA BKN010CB OVC025 22/20 Q1008",
  },
  {
    label: "SBKP — Variação de vento, SCT+BKN",
    metar: "METAR SBKP 261400Z 32012KT 280V360 9999 SCT030 BKN080 27/16 Q1014",
  },
  {
    label: "SBBR — Neblina seca",
    metar: "METAR SBBR 261000Z 09005KT 5000 HZ NSC 25/08 Q1016",
  },
  {
    label: "SBCF — SPECI com rajada",
    metar: "SPECI SBCF 261730Z 31020G35KT 3000 SHRA SCT015 BKN040CB 20/18 Q1010",
  },
  {
    label: "SBCT — Visibilidade mínima direcional",
    metar: "METAR SBCT 260600Z 22008KT 4000 2000SW BR SCT003 BKN010 16/15 Q1020",
  },
  {
    label: "SBPA — VRB, pouca nuvem",
    metar: "METAR SBPA 261100Z VRB03KT 9999 FEW040 24/15 Q1018",
  },
  {
    label: "SBRF — Chuva moderada, OVC baixo",
    metar: "METAR SBRF 261600Z 15012KT 3000 RA OVC008 24/23 Q1012",
  },
  {
    label: "SBFZ — Tempo bom, vento forte",
    metar: "METAR SBFZ 261200Z 10018KT 9999 FEW025 SCT300 32/22 Q1014",
  },
  {
    label: "SBBE — AUTO, chuva leve",
    metar: "METAR SBBE 261300Z AUTO 36005KT 6000 -RA SCT020 BKN080 28/25 Q1010",
  },
  {
    label: "SBSV — COR, wind shear",
    metar: "METAR COR SBSV 261400Z 18015KT 9999 SCT025 BKN100 29/22 Q1013 WS ALL RWY",
  },
  {
    label: "SBEG — Trovoada na vizinhança",
    metar: "METAR SBEG 261500Z 00000KT 9999 VCTS FEW030CB SCT080 33/24 Q1010",
  },
  {
    label: "SBFL — Garoa congelante, OVC",
    metar: "METAR SBFL 260800Z 20010KT 2000 -FZDZ OVC004 02/01 Q1022",
  },
  {
    label: "SBMN — Tempo recente, RMK",
    metar: "METAR SBMN 261200Z 04008KT 9999 SCT025 BKN100 30/24 Q1012 RERA RMK AUT QFE750",
  },
  {
    label: "SBVT — Múltiplos RVR",
    metar: "METAR SBVT 260700Z 19008KT 0600 R10/P2000U R28/0400D FG OVC001 15/15 Q1019",
  },
  {
    label: "SBGR — Nuvem TCU",
    metar: "METAR SBGR 261800Z 33010KT 9999 FEW035TCU SCT070 BKN100 26/17 Q1011",
  },
  {
    label: "SBRJ — Visibilidade indisponível",
    metar: "METAR SBRJ 261000Z 18005KT //// SCT020 25/20 Q1016",
  },
  {
    label: "SBSP — Wind shear em pista",
    metar: "METAR SBSP 261600Z 27012KT 9999 SCT030 BKN060 25/18 Q1012 WS R27L",
  },
  {
    label: "KJFK — Altímetro em inHg",
    metar: "METAR KJFK 261651Z 18012KT 10SM -RA BKN020 OVC050 18/16 A2992",
  },
  {
    label: "KCRW — Visibilidade menor que 1/4SM",
    metar: "METAR KCRW 271454Z 35008G22KT M1/4SM -RA OVC008 08/07 A3008",
  },
  {
    label: "KCRW — Visibilidade 1 1/2SM",
    metar: "METAR KCRW 271454Z 35008G22KT 1 1/2SM -RA OVC008 08/07 A3008",
  },
  {
    label: "SBGL — Correção extra e vento em KMH",
    metar: "METAR CCA SBGL 261300Z AUTO COR 18010KMH CAVOK 30/20 Q1015",
  },
  {
    label: "SBVT — RVR ilimitado em múltiplas pistas",
    metar: "METAR SBVT 260700Z 19008KT 0600 R10/P2000U R28/0400D R09/0600V1000U R11/0300N R29/P1500U FG OVC001 15/15 A2992",
  },
  {
    label: "SBSP — NOSIG com tokens extras ignorados",
    metar: "METAR SBSP 261600Z 27012KT 9999 SCT030 BKN060 25/18 Q1012 NOSIG EXTRA TOKEN",
  },
  {
    label: "SBCF — Weather semântico por grupo",
    metar: "METAR SBCF 261730Z 31020G35KT 3000 -TSRA BR SCT015 BKN040CB 20/18 Q1010",
  },
  {
    label: "SBFN — Fenômeno PY",
    metar: "METAR SBFN 271200Z 12012KT 4000 PY SCT020 26/24 Q1011",
  },
  {
    label: "EGLL — TEMPO com indicadores de tempo",
    metar: "METAR EGLL 271420Z 25012KT 9999 SCT030 18/10 Q1013 TEMPO FM1430 TL1530 4000 SHRA BKN014 NOSIG",
  },
  {
    label: "PAQT — AUTO com temperatura negativa",
    metar: "PAQT 271653Z AUTO 23013KT 10SM OVC008 M07/M09 A3033 RMK AO2 UPB1555E1556SNE1555B1556E24 SLP271 P0000",
  },
  {
    label: "CYPE — Visibilidade mista em SM",
    metar: "CYPE 271709Z AUTO 03011KT 1 3/4SM -SN FEW025 OVC033 M13/M15 A3010 RMK SLP252",
  },
  {
    label: "EGSH — COR com BECMG simples",
    metar: "EGSH 271650Z COR 22009KT 9999 BKN007 BKN023 11/10 Q1015 BECMG BKN011",
  },
  {
    label: "EGKA — Relatório sem altímetro",
    metar: "EGKA 271650Z 23012KT 4000 -DZ BKN005 10/10",
  },
  {
    label: "SBPK — Relatório métrico básico",
    metar: "SBPK 271700Z 09006KT 9999 BKN020 30/24 Q1015",
  },
  {
    label: "SBSN — Camada com TCU",
    metar: "SBSN 271700Z 09010KT 9999 SCT020 FEW030TCU SCT100 30/26 Q1008",
  },
  {
    label: "SPJJ — Variação de vento com RMK livre",
    metar: "SPJJ 271700Z 11003KT 050V190 9999 -RA SCT035 SCT050 15/07 Q1031 RMK BIRD HAZARD RWY 13/31",
  },
  {
    label: "SFAL — COR com TEMPO simples",
    metar: "SFAL 271650Z COR 31016KT 9999 BKN014 13/11 Q0999 TEMPO FEW014",
  },
  {
    label: "SCCI — NOSIG com chuva leve",
    metar: "SCCI 271700Z 03008KT 9999 -RA FEW015 OVC045 10/08 Q0993 NOSIG",
  },
  {
    label: "SACO — Vento variável com -DZ BR",
    metar: "SACO 271700Z 08006KT 350V110 4000 -DZ BR OVC019 20/18 Q1015 NOSIG",
  },
  {
    label: "DAUU — Haze com visibilidade reduzida",
    metar: "DAUU 271300Z 06013KT 030V090 4500 HZ SCT046 BKN100 19/05 Q1009",
  },
  {
    label: "LBWN — OVC com tipo convectivo indisponível",
    metar: "LBWN 271700Z AUTO 10011KT 9999 -SHRA OVC009/// 09/09 Q1005 TEMPO 4000 RA",
  },
  {
    label: "RJTY — Vento calmo com RMK americano extenso",
    metar: "RJTY 271633Z 00000KT 8SM -RA FEW003 OVC009 10/09 A2999 RMK AO2A RAB1555E05DZB05E16RAB16E17RAB27 CIG 006V010 CIG 009 RWY36 SLP159 $",
  },
  {
    label: "UNOO — Estado de pista e QFE",
    metar: "UNOO 271700Z 19002MPS 4600 BR FU NSC 03/01 Q1027 R25/190063 TEMPO 1000 BR FU RMK QFE762",
  },
  {
    label: "RJTR — AUTO com BR e teto baixo",
    metar: "RJTR 271710Z AUTO 00000KT 5SM BR SCT005 OVC009 11/10 A2996 RMK AO2 CIG 005V009 SLP148 $",
  },
];

export default METAR_EXAMPLES;
