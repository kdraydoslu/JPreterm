
export interface StockAnalysis {
  ticker: string;
  name: string;
  lastPrice: number;
  technicalScore: number;
  fundamentalScore: number;
  investmentIndex: number;
  decision: string;
  decisionEmoji: string;
  rsi: number | null;
  ma50: number | null;
  ma200: number | null;
  pe: number | null;
  pb: number | null;
  roe: number | null;
  debtEbitda: number | null;
  techSignals: Record<string, string>;
  fundSignals: Record<string, string>;
  sector: string;
}

const SECTOR_PE: Record<string, number> = {
  "Financial Services": 7.0,
  "Industrials": 12.0,
  "Consumer Cyclical": 15.0,
  "Energy": 8.0,
  "Technology": 20.0,
  "default": 10.0,
};

export function analyzeStock(ticker: string, name: string, data: any): StockAnalysis {
  // Use provided data or simulate if missing (matching Python simulation logic)
  const sector = data.sector || ["Financial Services", "Industrials", "Consumer Cyclical", "Energy", "Technology"][Math.floor(Math.random() * 5)];
  const lastPrice = data.price || 100;
  
  // ─── Technical Analysis ───
  const tech = data.technicalIndicators || {
    rsi: 45 + Math.random() * 20,
    macd: Math.random() * 2,
    sma50: lastPrice * 0.95,
    sma200: lastPrice * 0.90,
    bb_upper: lastPrice * 1.05,
    bb_lower: lastPrice * 0.95,
  };

  const techScores: Record<string, number> = {};
  const techSignals: Record<string, string> = {};

  // 1. Moving Average (25 pts)
  if (tech.sma50 && tech.sma200) {
    if (tech.sma50 > tech.sma200) {
      techScores["MA"] = 25;
      techSignals["MA"] = "🟢 Golden Cross (Alış)";
    } else {
      techScores["MA"] = 5;
      techSignals["MA"] = "🔴 Death Cross (Satış)";
    }
    if (lastPrice > tech.sma50) techScores["MA"] = Math.min(techScores["MA"] + 5, 25);
  } else {
    techScores["MA"] = 12;
    techSignals["MA"] = "⚪ Veri Yetersiz";
  }

  // 2. RSI (25 pts)
  const rsi = tech.rsi;
  if (rsi < 30) {
    techScores["RSI"] = 22;
    techSignals["RSI"] = `🟢 Aşırı Satım (${rsi.toFixed(1)})`;
  } else if (rsi < 45) {
    techScores["RSI"] = 18;
    techSignals["RSI"] = `🟡 Nötr-Zayıf (${rsi.toFixed(1)})`;
  } else if (rsi <= 55) {
    techScores["RSI"] = 25;
    techSignals["RSI"] = `🟢 Güçlü Bölge (${rsi.toFixed(1)})`;
  } else if (rsi <= 70) {
    techScores["RSI"] = 15;
    techSignals["RSI"] = `🟡 Nötr-Güçlü (${rsi.toFixed(1)})`;
  } else {
    techScores["RSI"] = 5;
    techSignals["RSI"] = `🔴 Aşırı Alım (${rsi.toFixed(1)})`;
  }

  // 3. MACD (25 pts) - Simplified simulation of momentum
  const macd = tech.macd || 0;
  if (macd > 0.5) {
    techScores["MACD"] = 25;
    techSignals["MACD"] = "🟢 Yükselen Momentum";
  } else if (macd > 0) {
    techScores["MACD"] = 18;
    techSignals["MACD"] = "🟡 Pozitif Crossover";
  } else {
    techScores["MACD"] = 5;
    techSignals["MACD"] = "🔴 Düşen Momentum";
  }

  // 4. Bollinger (25 pts)
  const bb_u = tech.bb_upper || lastPrice * 1.1;
  const bb_l = tech.bb_lower || lastPrice * 0.9;
  const bb_pos = ((lastPrice - bb_l) / (bb_u - bb_l)) * 100;
  if (bb_pos < 20) {
    techScores["BB"] = 22;
    techSignals["BB"] = `🟢 Alt Banda Yakın (%${bb_pos.toFixed(0)})`;
  } else if (bb_pos < 40) {
    techScores["BB"] = 20;
    techSignals["BB"] = `🟢 Alt-Orta Bölge (%${bb_pos.toFixed(0)})`;
  } else if (bb_pos < 60) {
    techScores["BB"] = 15;
    techSignals["BB"] = `⚪ Orta Bölge (%${bb_pos.toFixed(0)})`;
  } else if (bb_pos < 80) {
    techScores["BB"] = 10;
    techSignals["BB"] = `🟡 Üst-Orta Bölge (%${bb_pos.toFixed(0)})`;
  } else {
    techScores["BB"] = 5;
    techSignals["BB"] = `🔴 Üst Banda Yakın (%${bb_pos.toFixed(0)})`;
  }

  const technicalScore = Object.values(techScores).reduce((a, b) => a + b, 0);

  // ─── Fundamental Analysis ───
  const fund = data.fundamentalData || {
    pe: 5 + Math.random() * 15,
    pb: 0.5 + Math.random() * 3,
    roe: 0.1 + Math.random() * 0.4,
    debtEbitda: Math.random() * 4,
  };

  const fundScores: Record<string, number> = {};
  const fundSignals: Record<string, string> = {};

  const sectorPeRef = SECTOR_PE[sector] || SECTOR_PE["default"];
  const pe = fund.pe;
  if (pe > 0) {
    if (pe < sectorPeRef * 0.5) {
      fundScores["PE"] = 30;
      fundSignals["PE"] = `🟢 Çok Ucuz (F/K: ${pe.toFixed(1)} | Sektör: ${sectorPeRef})`;
    } else if (pe < sectorPeRef * 0.8) {
      fundScores["PE"] = 24;
      fundSignals["PE"] = `🟢 İskontolu (F/K: ${pe.toFixed(1)})`;
    } else if (pe < sectorPeRef * 1.1) {
      fundScores["PE"] = 18;
      fundSignals["PE"] = `⚪ Adil Değer (F/K: ${pe.toFixed(1)})`;
    } else if (pe < sectorPeRef * 1.5) {
      fundScores["PE"] = 10;
      fundSignals["PE"] = `🟡 Primli (F/K: ${pe.toFixed(1)})`;
    } else {
      fundScores["PE"] = 3;
      fundSignals["PE"] = `🔴 Aşırı Değerli (F/K: ${pe.toFixed(1)})`;
    }
  } else {
    fundScores["PE"] = 10;
    fundSignals["PE"] = "⚪ F/K Mevcut Değil";
  }

  const pb = fund.pb;
  if (pb > 0) {
    if (pb < 1.0) {
      fundScores["PB"] = 20;
      fundSignals["PB"] = `🟢 Defter Altı (PD/DD: ${pb.toFixed(2)})`;
    } else if (pb < 2.0) {
      fundScores["PB"] = 16;
      fundSignals["PB"] = `🟢 Makul (PD/DD: ${pb.toFixed(2)})`;
    } else if (pb < 3.5) {
      fundScores["PB"] = 10;
      fundSignals["PB"] = `🟡 Yüksek (PD/DD: ${pb.toFixed(2)})`;
    } else {
      fundScores["PB"] = 4;
      fundSignals["PB"] = `🔴 Çok Yüksek (PD/DD: ${pb.toFixed(2)})`;
    }
  } else {
    fundScores["PB"] = 8;
    fundSignals["PB"] = "⚪ PD/DD Mevcut Değil";
  }

  const roe = fund.roe;
  const roePct = roe * 100;
  if (roePct >= 30) {
    fundScores["ROE"] = 25;
    fundSignals["ROE"] = `🟢 Mükemmel (%${roePct.toFixed(1)})`;
  } else if (roePct >= 20) {
    fundScores["ROE"] = 20;
    fundSignals["ROE"] = `🟢 Güçlü (%${roePct.toFixed(1)}) ★ Bonus`;
  } else if (roePct >= 12) {
    fundScores["ROE"] = 14;
    fundSignals["ROE"] = `🟡 Ortalama (%${roePct.toFixed(1)})`;
  } else if (roePct >= 5) {
    fundScores["ROE"] = 8;
    fundSignals["ROE"] = `🟡 Zayıf (%${roePct.toFixed(1)})`;
  } else {
    fundScores["ROE"] = 2;
    fundSignals["ROE"] = `🔴 Negatif/Düşük (%${roePct.toFixed(1)})`;
  }

  const d_eb = fund.debtEbitda;
  if (d_eb !== null && d_eb !== undefined) {
    if (d_eb < 1.0) {
      fundScores["DEBT"] = 25;
      fundSignals["DEBT"] = `🟢 Çok Güvenli (Borç/FAVÖK: ${d_eb.toFixed(2)})`;
    } else if (d_eb < 2.0) {
      fundScores["DEBT"] = 20;
      fundSignals["DEBT"] = `🟢 Güvenli (Borç/FAVÖK: ${d_eb.toFixed(2)})`;
    } else if (d_eb < 3.0) {
      fundScores["DEBT"] = 13;
      fundSignals["DEBT"] = `🟡 Kabul Edilebilir (Borç/FAVÖK: ${d_eb.toFixed(2)})`;
    } else if (d_eb < 5.0) {
      fundScores["DEBT"] = 6;
      fundSignals["DEBT"] = `🔴 Yüksek Borç (Borç/FAVÖK: ${d_eb.toFixed(2)})`;
    } else {
      fundScores["DEBT"] = 1;
      fundSignals["DEBT"] = `🔴 Tehlikeli Borç (Borç/FAVÖK: ${d_eb.toFixed(2)})`;
    }
  } else {
    fundScores["DEBT"] = 10;
    fundSignals["DEBT"] = "⚪ Borç Verisi Yok";
  }

  const fundamentalScore = Object.values(fundScores).reduce((a, b) => a + b, 0);

  // ─── Investment Index ───
  const investmentIndex = (technicalScore * 0.45) + (fundamentalScore * 0.55);

  let decision = "TUT";
  let decisionEmoji = "🔵 TUT";
  if (investmentIndex >= 75) {
    decision = "GÜÇLÜ AL";
    decisionEmoji = "💎 GÜÇLÜ AL";
  } else if (investmentIndex >= 60) {
    decision = "AL";
    decisionEmoji = "✅ AL";
  } else if (investmentIndex >= 50) {
    decision = "TUT";
    decisionEmoji = "🔵 TUT";
  } else if (investmentIndex >= 40) {
    decision = "ZAYIF TUT";
    decisionEmoji = "🟡 ZAYIF TUT";
  } else {
    decision = "SAT";
    decisionEmoji = "🔴 SAT / KAÇIN";
  }

  return {
    ticker,
    name,
    lastPrice,
    technicalScore: Math.round(technicalScore * 10) / 10,
    fundamentalScore: Math.round(fundamentalScore * 10) / 10,
    investmentIndex: Math.round(investmentIndex * 10) / 10,
    decision,
    decisionEmoji,
    rsi: Math.round(rsi * 10) / 10,
    ma50: tech.sma50 ? Math.round(tech.sma50 * 100) / 100 : null,
    ma200: tech.sma200 ? Math.round(tech.sma200 * 100) / 100 : null,
    pe: Math.round(pe * 10) / 10,
    pb: Math.round(pb * 100) / 100,
    roe: Math.round(roe * 1000) / 1000,
    debtEbitda: d_eb !== null ? Math.round(d_eb * 100) / 100 : null,
    techSignals,
    fundSignals,
    sector,
  };
}
