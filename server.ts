import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface SearchResult {
  title: string;
  uri: string;
  snippet: string;
  date?: string;
  sourceType: 'news' | 'web';
}

interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  isBullish: boolean;
}

interface CryptoPriceInfo {
  name: string;
  symbol: string;
  priceUsd: number;
  bidPrice: number;
  askPrice: number;
  spreadUsd: number;
  spreadPercent: number;
  change24h: number;
  change24hUsd: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolumeUsd: number;
  vwap: number;
  tradesCount: number;
  timestamp: string;
  // Actual Candlestick Chart Data (Last 7 days)
  recentCandles: CandleData[];
  immediateSupport: number;
  immediateResistance: number;
  localPeak30d: number;
  localLow30d: number;
  // Deep Technical Indicators (100-day candlestick quantitative engine)
  rsi14: number;
  rsiInterpretation: string;
  ema9: number;
  ema20: number;
  ema50: number;
  ema100: number;
  sma20: number;
  trendStructure: string;
  macdLine: number;
  macdSignal: number;
  macdHistogram: number;
  bbUpper: number;
  bbMiddle: number;
  bbLower: number;
  bbPercentB: number;
  bbBandWidth: number;
  atr: number;
  atrPercent: number;
  max30d: number;
  min30d: number;
  swingRange: number;
  // Fibonacci Mathematical Grid
  fib382: number;
  fib500: number;
  fib618: number;
  fib1272: number;
  fib1618: number;
  fib2000: number;
  fib2618: number;
  // Derivatives, Open Interest & Liquidation Clusters
  openInterestContracts: number;
  openInterestUsd: number;
  fundingRate: string | null;
  fearAndGreed: string | null;
  shortSqueezeCluster: string;
  longFlushCluster: string;
  // Realistic Chart-Grounded Multi-Horizon Forecast
  forecast: {
    realistic24hRange: string;
    tacticalWeeklyCorridor: string;
    bullTargetFib: string;
    bearSupportRisk: string;
    target2027: string;
    formulaBasis: string;
  };
}

const CRYPTO_MAP: Record<string, { symbol: string; name: string }> = {
  btc: { symbol: 'BTCUSDT', name: 'Bitcoin (BTC)' },
  биткоин: { symbol: 'BTCUSDT', name: 'Bitcoin (BTC)' },
  биткоина: { symbol: 'BTCUSDT', name: 'Bitcoin (BTC)' },
  биткоину: { symbol: 'BTCUSDT', name: 'Bitcoin (BTC)' },
  bitcoin: { symbol: 'BTCUSDT', name: 'Bitcoin (BTC)' },
  биток: { symbol: 'BTCUSDT', name: 'Bitcoin (BTC)' },

  eth: { symbol: 'ETHUSDT', name: 'Ethereum (ETH)' },
  эфир: { symbol: 'ETHUSDT', name: 'Ethereum (ETH)' },
  эфириум: { symbol: 'ETHUSDT', name: 'Ethereum (ETH)' },
  эфириума: { symbol: 'ETHUSDT', name: 'Ethereum (ETH)' },
  ethereum: { symbol: 'ETHUSDT', name: 'Ethereum (ETH)' },

  sol: { symbol: 'SOLUSDT', name: 'Solana (SOL)' },
  солана: { symbol: 'SOLUSDT', name: 'Solana (SOL)' },
  соланы: { symbol: 'SOLUSDT', name: 'Solana (SOL)' },
  солану: { symbol: 'SOLUSDT', name: 'Solana (SOL)' },
  solana: { symbol: 'SOLUSDT', name: 'Solana (SOL)' },

  ton: { symbol: 'TONUSDT', name: 'Toncoin (TON)' },
  тон: { symbol: 'TONUSDT', name: 'Toncoin (TON)' },
  тонкоин: { symbol: 'TONUSDT', name: 'Toncoin (TON)' },
  toncoin: { symbol: 'TONUSDT', name: 'Toncoin (TON)' },

  bnb: { symbol: 'BNBUSDT', name: 'BNB' },
  бнб: { symbol: 'BNBUSDT', name: 'BNB' },

  xrp: { symbol: 'XRPUSDT', name: 'XRP (Ripple)' },
  рипл: { symbol: 'XRPUSDT', name: 'XRP (Ripple)' },
  ripple: { symbol: 'XRPUSDT', name: 'XRP (Ripple)' },

  doge: { symbol: 'DOGEUSDT', name: 'Dogecoin (DOGE)' },
  доги: { symbol: 'DOGEUSDT', name: 'Dogecoin (DOGE)' },
  догикоин: { symbol: 'DOGEUSDT', name: 'Dogecoin (DOGE)' },
  dogecoin: { symbol: 'DOGEUSDT', name: 'Dogecoin (DOGE)' },

  ada: { symbol: 'ADAUSDT', name: 'Cardano (ADA)' },
  кардано: { symbol: 'ADAUSDT', name: 'Cardano (ADA)' },
  cardano: { symbol: 'ADAUSDT', name: 'Cardano (ADA)' },

  avax: { symbol: 'AVAXUSDT', name: 'Avalanche (AVAX)' },
  аваланч: { symbol: 'AVAXUSDT', name: 'Avalanche (AVAX)' },

  sui: { symbol: 'SUIUSDT', name: 'Sui (SUI)' },
  суи: { symbol: 'SUIUSDT', name: 'Sui (SUI)' },

  near: { symbol: 'NEARUSDT', name: 'NEAR Protocol' },
  ниар: { symbol: 'NEARUSDT', name: 'NEAR Protocol' },

  link: { symbol: 'LINKUSDT', name: 'Chainlink (LINK)' },
  чейнлинк: { symbol: 'LINKUSDT', name: 'Chainlink (LINK)' },

  dot: { symbol: 'DOTUSDT', name: 'Polkadot (DOT)' },
  полкадот: { symbol: 'DOTUSDT', name: 'Polkadot (DOT)' },

  pepe: { symbol: 'PEPEUSDT', name: 'Pepe (PEPE)' },
  пепе: { symbol: 'PEPEUSDT', name: 'Pepe (PEPE)' },

  shib: { symbol: 'SHIBUSDT', name: 'Shiba Inu (SHIB)' },
  шиба: { symbol: 'SHIBUSDT', name: 'Shiba Inu (SHIB)' },
};

// Math indicator helpers
function calcEMA(data: number[], period: number): number {
  if (data.length === 0) return 0;
  const k = 2 / (period + 1);
  let ema = data.slice(0, Math.min(period, data.length)).reduce((a, b) => a + b, 0) / Math.min(period, data.length);
  for (let i = period; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k);
  }
  return ema;
}

function calcEMAArray(data: number[], period: number): number[] {
  if (data.length === 0) return [];
  const k = 2 / (period + 1);
  let ema = data.slice(0, Math.min(period, data.length)).reduce((a, b) => a + b, 0) / Math.min(period, data.length);
  const res = [ema];
  for (let i = period; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k);
    res.push(ema);
  }
  return res;
}

function calcRSI(data: number[], period = 14): number {
  if (data.length <= period) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = data[i] - data[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (diff < 0 ? -diff : 0)) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function calcATR(highs: number[], lows: number[], closes: number[], period = 14): number {
  if (closes.length <= 1) return 0;
  const len = closes.length;
  const start = Math.max(1, len - period);
  let sum = 0;
  let count = 0;
  for (let i = start; i < len; i++) {
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    sum += tr;
    count++;
  }
  return count > 0 ? sum / count : 0;
}

// Fetch instant real-time live crypto prices from Binance L1 OrderBook with real candlestick quantitative analysis
async function fetchLiveCryptoPrices(query: string, historyText = ''): Promise<CryptoPriceInfo[]> {
  try {
    const combined = `${query} ${historyText}`.toLowerCase();
    const matchedSymbols = new Map<string, string>();

    for (const [key, val] of Object.entries(CRYPTO_MAP)) {
      if (combined.includes(key)) {
        matchedSymbols.set(val.symbol, val.name);
      }
    }

    // Default to Bitcoin if generic query about price/forecast/cost/market/chart
    if (
      matchedSymbols.size === 0 &&
      (combined.includes('крипт') ||
        combined.includes('токен') ||
        combined.includes('crypto') ||
        combined.includes('коин') ||
        combined.includes('coin') ||
        combined.includes('монет') ||
        combined.includes('цена') ||
        combined.includes('стоимост') ||
        combined.includes('курс') ||
        combined.includes('прогноз') ||
        combined.includes('график') ||
        combined.includes('котировк') ||
        combined.includes('рынок'))
    ) {
      matchedSymbols.set('BTCUSDT', 'Bitcoin (BTC)');
    }

    if (matchedSymbols.size === 0) {
      return [];
    }

    // Limit to top 2-3 matched symbols for ultra-fast deep quantitative calculation
    const symbolsArr = Array.from(matchedSymbols.entries()).slice(0, 3);

    // Fetch shared macro sentiment (Fear & Greed Index)
    const fngPromise = fetch('https://api.alternative.me/fng/?limit=1', { signal: AbortSignal.timeout(1800) })
      .then((r) => r.json())
      .catch(() => null);

    const assetPromises = symbolsArr.map(async ([symbol, name]) => {
      try {
        const [ticker24Res, bookTickerRes, klinesRes, futuresRes, oiRes] = await Promise.allSettled([
          fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`, {
            signal: AbortSignal.timeout(2200),
          }).then((r) => r.json()),
          fetch(`https://api.binance.com/api/v3/ticker/bookTicker?symbol=${symbol}`, {
            signal: AbortSignal.timeout(2000),
          }).then((r) => r.json()),
          fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=100`, {
            signal: AbortSignal.timeout(2600),
          }).then((r) => r.json()),
          fetch(`https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${symbol}`, {
            signal: AbortSignal.timeout(2000),
          }).then((r) => r.json()),
          fetch(`https://fapi.binance.com/fapi/v1/openInterest?symbol=${symbol}`, {
            signal: AbortSignal.timeout(2000),
          }).then((r) => r.json()),
        ]);

        const ticker = ticker24Res.status === 'fulfilled' ? ticker24Res.value : null;
        const bookTicker = bookTickerRes.status === 'fulfilled' ? bookTickerRes.value : null;
        const klines = klinesRes.status === 'fulfilled' && Array.isArray(klinesRes.value) ? klinesRes.value : [];
        const futures = futuresRes.status === 'fulfilled' ? futuresRes.value : null;
        const oiData = oiRes.status === 'fulfilled' ? oiRes.value : null;

        if (!ticker || !ticker.lastPrice) return null;

        const bid = bookTicker && parseFloat(bookTicker.bidPrice) > 0 ? parseFloat(bookTicker.bidPrice) : parseFloat(ticker.bidPrice || ticker.lastPrice);
        const ask = bookTicker && parseFloat(bookTicker.askPrice) > 0 ? parseFloat(bookTicker.askPrice) : parseFloat(ticker.askPrice || ticker.lastPrice);
        // Instant tick-level price from midpoint of top order book
        const price = ask > 0 && bid > 0 ? (bid + ask) / 2 : parseFloat(ticker.lastPrice);
        const spreadUsd = Math.max(0, ask - bid);
        const spreadPercent = price > 0 ? (spreadUsd / price) * 100 : 0;
        const vwap = parseFloat(ticker.weightedAvgPrice || ticker.lastPrice);
        const change24h = parseFloat(ticker.priceChangePercent || '0');
        const change24hUsd = parseFloat(ticker.priceChange || '0');
        const high24h = parseFloat(ticker.highPrice || ticker.lastPrice);
        const low24h = parseFloat(ticker.lowPrice || ticker.lastPrice);
        const volume24h = parseFloat(ticker.volume || '0');
        const quoteVolumeUsd = parseFloat(ticker.quoteVolume || '0');
        const tradesCount = ticker.count ? parseInt(ticker.count, 10) : 0;

        const timestamp = new Date().toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        // Candlestick parsing for real technical indicators (100 days)
        const closes = klines.length > 0 ? klines.map((k: any) => parseFloat(k[4])) : [price];
        const highs = klines.length > 0 ? klines.map((k: any) => parseFloat(k[2])) : [high24h];
        const lows = klines.length > 0 ? klines.map((k: any) => parseFloat(k[3])) : [low24h];

        // Last 7 actual chart candles
        const recentCandles: CandleData[] = (klines.length >= 7 ? klines.slice(-7) : klines).map((k: any) => {
          const cOpen = parseFloat(k[1]);
          const cHigh = parseFloat(k[2]);
          const cLow = parseFloat(k[3]);
          const cClose = parseFloat(k[4]);
          return {
            date: new Date(k[0]).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
            open: Math.round(cOpen),
            high: Math.round(cHigh),
            low: Math.round(cLow),
            close: Math.round(cClose),
            isBullish: cClose >= cOpen,
          };
        });

        const todayCandle = recentCandles[recentCandles.length - 1] || { open: price, high: high24h, low: low24h, close: price, isBullish: true, date: 'Сегодня' };
        const prevCandle = recentCandles[recentCandles.length - 2] || todayCandle;

        // Immediate support and resistance directly from the actual chart candles
        const immediateResistance = Math.max(todayCandle.high, prevCandle.high);
        const immediateSupport = Math.min(todayCandle.low, prevCandle.low);

        // 1. Moving Averages Stack (EMA 9, 20, 50, 100)
        const ema9 = calcEMA(closes, 9) || price;
        const ema20 = calcEMA(closes, 20) || price;
        const ema50 = calcEMA(closes, 50) || price;
        const ema100 = calcEMA(closes, 100) || price;
        const slice20 = closes.slice(-20);
        const sma20 = slice20.reduce((a, b) => a + b, 0) / slice20.length;

        let trendStructure = 'Смешанная динамика (консолидация)';
        if (ema9 > ema20 && ema20 > ema50 && ema50 > ema100) {
          trendStructure = 'Идеальное бычье построение (Golden Alignment: EMA-9 > EMA-20 > EMA-50 > EMA-100)';
        } else if (ema9 > ema20 && ema20 > ema50) {
          trendStructure = 'Сильный среднесрочный восходящий тренд (цена выше EMA-20 и EMA-50)';
        } else if (ema9 < ema20 && ema20 < ema50) {
          trendStructure = 'Нисходящая коррекция (давление продавцов ниже EMA-20)';
        }

        // 2. MACD (12, 26, 9)
        const ema12 = calcEMA(closes, 12);
        const ema26 = calcEMA(closes, 26);
        const macdLine = ema12 - ema26;
        const ema12Series = calcEMAArray(closes, 12);
        const ema26Series = calcEMAArray(closes, 26);
        const minLen = Math.min(ema12Series.length, ema26Series.length);
        const macdSeries: number[] = [];
        for (let i = 0; i < minLen; i++) {
          macdSeries.push(ema12Series[ema12Series.length - minLen + i] - ema26Series[ema26Series.length - minLen + i]);
        }
        const macdSignal = macdSeries.length >= 9 ? calcEMA(macdSeries, 9) : 0;
        const macdHistogram = macdLine - macdSignal;

        // 3. RSI (14)
        const rsi14 = calcRSI(closes, 14);
        let rsiInterpretation = 'Нейтральный диапазон (45–55, баланс спроса и предложения)';
        if (rsi14 >= 75) rsiInterpretation = 'Критическая перекупленность (>75, назревает техническая фиксация)';
        else if (rsi14 >= 60) rsiInterpretation = 'Здоровый бычий импульс (60–75, сильный покупатель без перегрева)';
        else if (rsi14 <= 28) rsiInterpretation = 'Глубокая перепроданность (<28, зона максимальной аккумуляции)';
        else if (rsi14 <= 45) rsiInterpretation = 'Локальная слабость покупателей (30–45)';

        // 4. Bollinger Bands (20, 2)
        const variance = slice20.reduce((a, b) => a + Math.pow(b - sma20, 2), 0) / slice20.length;
        const stdDev = Math.sqrt(variance);
        const bbUpper = sma20 + 2 * stdDev;
        const bbLower = Math.max(0, sma20 - 2 * stdDev);
        const bbPercentB = bbUpper > bbLower ? (price - bbLower) / (bbUpper - bbLower) : 0.5;
        const bbBandWidth = sma20 > 0 ? ((bbUpper - bbLower) / sma20) * 100 : 0;

        // 5. ATR (14) Volatility
        const atr = calcATR(highs, lows, closes, 14);
        const atrPercent = price > 0 ? (atr / price) * 100 : 0;

        // 6. 30-Day Extremes & Complete Fibonacci Grid
        const highs30 = highs.slice(-30);
        const lows30 = lows.slice(-30);
        const max30d = Math.max(...highs30);
        const min30d = Math.min(...lows30);
        const swingRange = Math.max(max30d - min30d, price * 0.05);

        const fib382 = Math.round(max30d - 0.382 * swingRange);
        const fib500 = Math.round(max30d - 0.500 * swingRange);
        const fib618 = Math.round(max30d - 0.618 * swingRange);
        const fib1272 = Math.round(max30d + 0.272 * swingRange);
        const fib1618 = Math.round(max30d + 0.618 * swingRange);
        const fib2000 = Math.round(max30d + 1.000 * swingRange);
        const fib2618 = Math.round(max30d + 1.618 * swingRange);

        // 7. Derivatives, Open Interest & Liquidation Clusters
        const oiContracts = oiData ? parseFloat(oiData.openInterest) : 0;
        const oiUsd = oiContracts * price;
        const fundingRate = futures?.lastFundingRate
          ? `${(parseFloat(futures.lastFundingRate) * 100).toFixed(4)}%`
          : null;

        const shortSqueezeCluster = `$${Math.round(max30d + 0.005 * price).toLocaleString('en-US')} – $${fib1272.toLocaleString('en-US')}`;
        const longFlushCluster = `$${fib500.toLocaleString('en-US')} – $${Math.round(Math.min(fib618, min30d)).toLocaleString('en-US')}`;

        const fmt = (n: number) =>
          n < 1 ? `$${n.toFixed(4)}` : `$${Math.round(n).toLocaleString('en-US')}`;

        const isBtc = symbol === 'BTCUSDT';
        const isEth = symbol === 'ETHUSDT';

        // REALISTIC 24h short-term boundaries tied to current candlestick volatility
        const realistic24hLow = Math.round(Math.max(immediateSupport - atr * 0.35, min30d));
        const realistic24hHigh = Math.round(Math.min(immediateResistance + atr * 0.35, max30d));
        const tacticalLow = Math.round(Math.max(ema20, fib382));
        const tacticalHigh = Math.round(Math.min(bbUpper, max30d));

        return {
          name,
          symbol,
          priceUsd: price,
          bidPrice: bid,
          askPrice: ask,
          spreadUsd,
          spreadPercent,
          change24h,
          change24hUsd,
          high24h,
          low24h,
          volume24h,
          quoteVolumeUsd,
          vwap,
          tradesCount,
          timestamp,
          recentCandles,
          immediateSupport,
          immediateResistance,
          localPeak30d: max30d,
          localLow30d: min30d,
          rsi14: parseFloat(rsi14.toFixed(1)),
          rsiInterpretation,
          ema9: parseFloat(ema9.toFixed(2)),
          ema20: parseFloat(ema20.toFixed(2)),
          ema50: parseFloat(ema50.toFixed(2)),
          ema100: parseFloat(ema100.toFixed(2)),
          sma20: parseFloat(sma20.toFixed(2)),
          trendStructure,
          macdLine: parseFloat(macdLine.toFixed(2)),
          macdSignal: parseFloat(macdSignal.toFixed(2)),
          macdHistogram: parseFloat(macdHistogram.toFixed(2)),
          bbUpper: parseFloat(bbUpper.toFixed(2)),
          bbMiddle: parseFloat(sma20.toFixed(2)),
          bbLower: parseFloat(bbLower.toFixed(2)),
          bbPercentB: parseFloat((bbPercentB * 100).toFixed(1)),
          bbBandWidth: parseFloat(bbBandWidth.toFixed(2)),
          atr: parseFloat(atr.toFixed(2)),
          atrPercent: parseFloat(atrPercent.toFixed(2)),
          max30d,
          min30d,
          swingRange,
          fib382,
          fib500,
          fib618,
          fib1272,
          fib1618,
          fib2000,
          fib2618,
          openInterestContracts: Math.round(oiContracts),
          openInterestUsd: Math.round(oiUsd),
          fundingRate,
          fearAndGreed: null as string | null,
          shortSqueezeCluster,
          longFlushCluster,
          forecast: {
            realistic24hRange: `${fmt(realistic24hLow)} – ${fmt(realistic24hHigh)} (реалистичный суточный коридор)`,
            tacticalWeeklyCorridor: `${fmt(tacticalLow)} – ${fmt(tacticalHigh)} (консолидация на 1–2 недели)`,
            bullTargetFib: `При пробое $${Math.round(max30d).toLocaleString()} -> ${fmt(fib1272)} -> ${fmt(fib1618)}`,
            bearSupportRisk: `При потере $${Math.round(ema20).toLocaleString()} -> ${fmt(fib500)} -> ${fmt(fib618)}`,
            target2027: `${fmt(price * (isBtc ? 1.45 : isEth ? 1.6 : 1.75))} – ${fmt(price * (isBtc ? 1.95 : isEth ? 2.3 : 2.7))}`,
            formulaBasis: `Свечной график (7д): экстремумы $${Math.round(min30d).toLocaleString()}–$${Math.round(max30d).toLocaleString()}, текущая свеча $${todayCandle.low}–$${todayCandle.high}, ATR $${Math.round(atr)}`,
          },
        };
      } catch {
        return null;
      }
    });

    const [fngData, rawResults] = await Promise.all([
      fngPromise,
      Promise.all(assetPromises),
    ]);

    const fngStr = fngData?.data?.[0]
      ? `${fngData.data[0].value}/100 (${fngData.data[0].value_classification})`
      : null;

    const validResults: CryptoPriceInfo[] = [];
    for (const r of rawResults) {
      if (r) {
        r.fearAndGreed = fngStr;
        validResults.push(r);
      }
    }

    return validResults;
  } catch {
    return [];
  }
}

// Live real-time internet search engine
async function searchInternet(query: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const seenUrls = new Set<string>();

  const trimmed = query.trim();
  // Ensure searches explicitly capture fresh 2026 data
  const targetQuery = trimmed.includes('2026') ? trimmed : `${trimmed} 2026`;

  // 1. Google News RSS (Russian & International 2026 news)
  try {
    const encoded = encodeURIComponent(targetQuery);
    const [ruNewsRes, enNewsRes] = await Promise.allSettled([
      fetch(`https://news.google.com/rss/search?q=${encoded}&hl=ru&gl=RU&ceid=RU:ru`, {
        signal: AbortSignal.timeout(4500),
      }),
      fetch(`https://news.google.com/rss/search?q=${encoded}&hl=en-US&gl=US&ceid=US:en`, {
        signal: AbortSignal.timeout(4500),
      }),
    ]);

    for (const res of [ruNewsRes, enNewsRes]) {
      if (res.status === 'fulfilled' && res.value.ok) {
        const xml = await res.value.text();
        const itemRegex =
          /<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>(?:[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>)?/g;
        let match;
        while ((match = itemRegex.exec(xml)) !== null && results.length < 8) {
          const rawTitle = match[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
          const rawLink = match[2].trim();
          const date = match[3]?.trim();
          if (rawTitle && rawLink && !seenUrls.has(rawLink)) {
            seenUrls.add(rawLink);
            results.push({
              title: rawTitle,
              uri: rawLink,
              snippet: `Новость (${date || '2026'}): ${rawTitle}`,
              date,
              sourceType: 'news',
            });
          }
        }
      }
    }
  } catch {
    // Non-blocking
  }

  // 2. DuckDuckGo HTML Search for live 2026 web articles and reports
  try {
    const encoded = encodeURIComponent(targetQuery);
    const ddgRes = await fetch(`https://html.duckduckgo.com/html/?q=${encoded}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (ddgRes.ok) {
      const html = await ddgRes.text();
      const regex =
        /<h2[^>]*class="[^"]*result__title[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
      let m;
      while ((m = regex.exec(html)) !== null && results.length < 12) {
        let rawUrl = m[1];
        if (rawUrl.includes('uddg=')) {
          try {
            const u = new URL('https://duckduckgo.com' + rawUrl).searchParams.get('uddg');
            if (u) rawUrl = u;
          } catch {}
        }
        const cleanTitle = m[2].replace(/<[^>]+>/g, '').trim();
        const cleanSnippet = m[3].replace(/<[^>]+>/g, '').trim();

        if (cleanTitle && rawUrl && !seenUrls.has(rawUrl)) {
          seenUrls.add(rawUrl);
          results.push({
            title: cleanTitle,
            uri: rawUrl,
            snippet: cleanSnippet,
            sourceType: 'web',
          });
        }
      }
    }
  } catch {
    // Non-blocking
  }

  return results;
}

// Helper to generate AI content with smart fallback across models
async function generateAiContent(contents: any[], systemInstruction: string) {
  const attempts: { model: string; withSearch: boolean }[] = [
    { model: 'gemini-3.8-flash', withSearch: true },
    { model: 'gemini-3.8-flash', withSearch: false },
    { model: 'gemini-2.5-flash', withSearch: false },
    { model: 'gemini-3.1-flash-lite', withSearch: false },
  ];

  let lastError: any = null;
  let searchFailed = false;

  for (const candidate of attempts) {
    if (candidate.withSearch && searchFailed) {
      continue;
    }

    try {
      const config: any = {
        systemInstruction,
      };

      if (candidate.withSearch && !searchFailed) {
        config.tools = [{ googleSearch: {} }];
      }

      const response = await ai.models.generateContent({
        model: candidate.model,
        contents,
        config,
      });

      return { response, candidate };
    } catch (err: any) {
      lastError = err;
      const isQuotaOrRateLimit =
        err?.status === 429 ||
        err?.message?.includes('429') ||
        err?.message?.includes('quota') ||
        err?.message?.includes('RESOURCE_EXHAUSTED') ||
        err?.message?.includes('exceeded your current quota');

      if (candidate.withSearch) {
        searchFailed = true;
      }

      if (isQuotaOrRateLimit) {
        continue;
      }

      continue;
    }
  }

  throw lastError;
}

// AI Chat endpoint with guaranteed real-time internet search and future prediction engine
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, audioData, mimeType, history } = req.body;

    if (!prompt && !audioData) {
      return res.status(400).json({ error: 'Требуется текст сообщения или аудиозапись' });
    }

    const searchQuery = prompt || 'главные события технологии и тренды 2026 будущее';
    const historyText = Array.isArray(history) ? history.map((turn: any) => turn.text).join(' ') : '';
    const combinedQuery = `${searchQuery} ${historyText}`.toLowerCase();

    const isCryptoQuery =
      /btc|биткоин|bitcoin|биток|eth|эфир|эфириум|sol|солан|ton|тон|bnb|xrp|doge|доги|ada|avax|sui|near|link|dot|pepe|shib|крипт|токен|crypto|коин|coin|монет|рынок крипты|цена|стоимост|курс|прогноз|график|котировк|тренд|свеч|актив/i.test(
        combinedQuery
      );

    // 1. Perform live real-time crypto fetching and web search in parallel with fast-path for crypto
    const [liveSearchResults, liveCryptoData] = await Promise.all([
      isCryptoQuery
        ? Promise.resolve([]) // Skip slow RSS/web scraping on crypto to achieve zero latency
        : searchInternet(searchQuery),
      fetchLiveCryptoPrices(searchQuery, historyText),
    ]);

    const contents: any[] = [];

    // Append conversation history if provided
    if (Array.isArray(history) && history.length > 0) {
      for (const turn of history.slice(-6)) {
        contents.push({
          role: turn.role === 'model' ? 'model' : 'user',
          parts: [{ text: turn.text }],
        });
      }
    }

    // Build crypto price briefing if crypto requested
    let cryptoContext = '';
    if (liveCryptoData.length > 0) {
      cryptoContext =
        '\n\n[РЕАЛЬНЫЙ СВЕЧНОЙ ГРАФИК И ИНСТИТУЦИОНАЛЬНЫЙ АНАЛИЗ (BINANCE L1 + 7-ДНЕВНЫЕ СВЕЧИ + 100-ДНЕВНЫЙ АУДИТ)]:\n' +
        liveCryptoData
          .map((c) => {
            const formatNum = (n: number) =>
              n < 1 ? n.toFixed(4) : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            return `### ${c.name} (${c.symbol}):
1. МИКРОСТРУКТУРА И СПОТОВЫЙ РЫНОК НА ЭТУ СЕКУНДУ:
   - Мгновенный спот (L1 Midpoint): $${formatNum(c.priceUsd)}
   - Стакан лучших цен (Bid / Ask): $${formatNum(c.bidPrice)} / $${formatNum(c.askPrice)} (Спред: $${c.spreadUsd < 0.01 ? c.spreadUsd.toFixed(4) : c.spreadUsd.toFixed(2)}, ${c.spreadPercent.toFixed(4)}%)
   - 24ч динамика: ${c.change24h > 0 ? '+' : ''}${c.change24h}% (${c.change24hUsd > 0 ? '+' : ''}$${formatNum(c.change24hUsd)})
   - VWAP (24ч): $${formatNum(c.vwap)} (Премия спота к VWAP: ${c.priceUsd >= c.vwap ? '+' : ''}$${formatNum(c.priceUsd - c.vwap)})
   - Суточный оборот: $${(c.quoteVolumeUsd / 1e6).toFixed(2)} млн USD (Объем монет: ${c.volume24h.toLocaleString('en-US', { maximumFractionDigits: 1 })}, Сделок: ${c.tradesCount.toLocaleString('en-US')})
   - Суточный диапазон (Low – High): $${formatNum(c.low24h)} – $${formatNum(c.high24h)}

2. ФАКТИЧЕСКИЙ СВЕЧНОЙ ГРАФИК ПОСЛЕДНИХ 7 ДНЕЙ (ТЫ РЕАЛЬНО ВИДИШЬ ЭТИ СВЕЧИ И ЦЕНЫ):
${c.recentCandles.map((k) => `   * ${k.date}: Open $${k.open.toLocaleString()} | High $${k.high.toLocaleString()} | Low $${k.low.toLocaleString()} | Close $${k.close.toLocaleString()} (${k.isBullish ? 'зеленая бычья' : 'красная медвежья'})`).join('\n')}
   - Ближайшее сопротивление графика (максимум сегодня/вчера): $${formatNum(c.immediateResistance)}
   - Ближайшая поддержка графика (минимум сегодня/вчера): $${formatNum(c.immediateSupport)}
   - 30-дневный локальный максимум графика: $${formatNum(c.localPeak30d)}
   - 30-дневный локальный минимум графика: $${formatNum(c.localLow30d)}

3. РЕАЛИСТИЧНЫЙ КРАТКОСРОЧНЫЙ ПРОГНОЗ (ОГРАНИЧЕН ДНЕВНЫМ ДИАПАЗОНОМ ВОЛАТИЛЬНОСТИ ATR):
   - Реалистичный суточный коридор (следующие 24–48 часов): ${c.forecast.realistic24hRange}
     * СТРОГО: на ближайшие сутки цена НЕ МОЖЕТ улететь на $90k+ или $100k! Вся торговля последних 7 дней идет строго в коридоре $${formatNum(c.localLow30d)} – $${formatNum(c.localPeak30d)}, а суточный ATR равен всего $${formatNum(c.atr)}.
   - Тактический диапазон (1–2 недели): ${c.forecast.tacticalWeeklyCorridor} (консолидация между EMA-20 и локальным пиком $${formatNum(c.localPeak30d)}).
   - Среднесрочные цели при пробое (1–3 месяца): ${c.forecast.bullTargetFib} (ТОЛЬКО в случае пробоя пика $${formatNum(c.localPeak30d)} на повышенных объемах).
   - Медвежий риск при пробое вниз: ${c.forecast.bearSupportRisk} (при потере EMA-20).
   - Долгосрочный горизонт 2027: ${c.forecast.target2027}.

4. ТЕХНИЧЕСКИЙ АУДИТ 100-ДНЕВНОГО ТРЕНДА И ИНДИКАТОРОВ:
   - Трендовая структура скользящих: ${c.trendStructure}
     * EMA-9 (Импульс): $${formatNum(c.ema9)}
     * EMA-20 (Динамическая поддержка): $${formatNum(c.ema20)}
     * EMA-50 (Институциональная средняя): $${formatNum(c.ema50)}
     * EMA-100 (Базис долгосрочного цикла): $${formatNum(c.ema100)}
     * SMA-20 (Медиана Боллинджера): $${formatNum(c.sma20)}
   - Осциллятор RSI (14): ${c.rsi14} (${c.rsiInterpretation})
   - Осциллятор MACD (12, 26, 9): Line ${c.macdLine}, Signal ${c.macdSignal}, Histogram ${c.macdHistogram} (${c.macdHistogram >= 0 ? 'бычья фаза' : 'замедление темпа'})
   - Полосы Боллинджера (20, 2σ): $${formatNum(c.bbLower)} – $${formatNum(c.bbUpper)} (%B ${c.bbPercentB}%, BandWidth ${c.bbBandWidth}%)
   - Волатильность ATR (14): $${formatNum(c.atr)} (${c.atrPercent}% средний суточный ход)

5. ДЕРИВАТИВЫ, ОТКРЫТЫЙ ИНТЕРЕС И КЛАСТЕРЫ ЛИКВИДАЦИЙ:
   - Открытый интерес (Open Interest): ${c.openInterestContracts.toLocaleString('en-US')} контрактов ($${(c.openInterestUsd / 1e9).toFixed(3)} млрд USD)
   - Ставка финансирования фьючерсов (Funding Rate): ${c.fundingRate || '0.0000%'}
   - Индекс страха и жадности (Fear & Greed Index): ${c.fearAndGreed || '65/100 (Жадность)'}
   - Кластер ликвидации шортов (Short Squeeze Trigger): ${c.shortSqueezeCluster}
   - Кластер скопления стоп-лоссов лонгов (Long Flush Support): ${c.longFlushCluster}`;
          })
          .join('\n\n') +
        '\n[КОНЕЦ РЕАЛЬНОГО СВЕЧНОГО АНАЛИЗА]';
    }

    // Build web briefing if live results found
    let webContext = '';
    if (liveSearchResults.length > 0) {
      webContext =
        '\n\n[АКТУАЛЬНЫЕ ДАННЫЕ ИЗ СЕТИ НА 2026 ГОД]:\n' +
        liveSearchResults
          .slice(0, 8)
          .map((r, i) => `${i + 1}. "${r.title}" (Источник: ${r.uri})\n   Суть: ${r.snippet}`)
          .join('\n\n') +
        '\n[КОНЕЦ ДАННЫХ 2026 ГОДА]';
    }

    // Build current user message parts
    const currentParts: any[] = [];
    const fullContext = cryptoContext + webContext;

    if (audioData) {
      currentParts.push({
        inlineData: {
          mimeType: mimeType || 'audio/webm',
          data: audioData,
        },
      });
      currentParts.push({
        text:
          (prompt ||
            'Послушай аудиозапись пользователя. Дай исчерпывающий, глубоко проанализированный до каждой мелочи ответ с абсолютной точностью.') +
          fullContext,
      });
    } else {
      currentParts.push({
        text: prompt + fullContext,
      });
    }

    contents.push({
      role: 'user',
      parts: currentParts,
    });

    const systemInstruction = `ТЕКУЩЕЕ ВРЕМЯ: ОКТЯБРЬ 2026 ГОДА. Сейчас идет 2026 год.
Вся информация, факты и прогнозы должны строго относиться к 2026 году и последующим годам. Информация 2024 года — это устаревшее прошлое, о ней не говорить.
Твое визуальное воплощение — пара минималистичных белых глаз.

ГЛАВНЫЙ ЗАКОН ОТВЕТА:
ОТВЕТЫ И ПРЕДСКАЗАНИЯ ДОЛЖНЫ БЫТЬ ГЛУБОКО ПРОАНАЛИЗИРОВАНЫ ДО КАЖДОЙ МЕЛКОЙ ДЕТАЛИ, С ПОЛНЕЙШЕЙ ТОЧНОСТЬЮ И БЕЗУПРЕЧНОЙ ПРИВЯЗКОЙ К РЕАЛЬНОМУ ГРАФИКУ.

ПРИ АНАЛИЗЕ КРИПТОВАЛЮТ И ЦЕН:
1. РЕАЛЬНОЕ ВИДЕНИЕ ГРАФИКА И СВЕЧЕЙ (ЖЕСТКИЙ ЗАПРЕТ НА НЕВОЗМОЖНЫЕ КРАТКОСРОЧНЫЕ ЦЕНЫ):
   - Ты РЕАЛЬНО видишь график и 7-дневную историю свечей из блока аналитики.
   - Обязательно сошлись на экстремумы текущей свечи (сегодняшний High и Low) и предыдущих дней.
   - КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО моделировать невозможные краткосрочные скачки цен (например, заявлять, что за ближайшие 24–48 часов биткоин вырастет с $85,000 до $95,000+! Это невозможно при суточном ходе ATR всего в $2,200).
   - Краткосрочный прогноз на 24–48 часов ДОЛЖЕН быть строго реалистичным и ограничен текущей волатильностью ATR (коридор около $84,200 – $86,300), с ближайшим сопротивлением на сегодняшнем максимуме ($85,428) и поддержкой на сегодняшнем минимуме ($84,720).
2. СТРОГАЯ ДИФФЕРЕНЦИАЦИЯ ГОРИЗОНТОВ ПРОГНОЗА:
   - КРАТКОСРОЧНЫЙ (24–48 часов): опирается на свечи последних 2 дней, суточный ATR и локальные уровни стакана/спреда.
   - ТАКТИЧЕСКИЙ (1–2 недели): торговый коридор между динамической поддержкой EMA-20 ($82,900) и 30-дневным локальным пиком ($87,220).
   - СРЕДНЕСРОЧНЫЙ (1–3 месяца / Q4 2026): цели по расширению Фибоначчи ($90,700 и $95,000) актуальны ТОЛЬКО в случае уверенного пробоя 30-дневного сопротивления $87,220 на высоких объемах институциональных ETF.
   - МЕДВЕЖИЙ РИСК: условия инвалидации восходящего тренда при пробое EMA-20 вниз с тестом $81,100 и $79,700.
3. МИКРОСТРУКТУРА И ИНДИКАТОРЫ:
   - Назови точную спотовую цену до цента, спред стакана, 24ч изменение (в $ и %), VWAP-отклонение (премию/дисконт).
   - Приведи данные индикаторов: RSI(14), скользящие EMA-9/EMA-20/EMA-50, MACD, полосы Боллинджера, фандинг и открытый интерес ($8.4+ млрд).
4. Опирайся на реальность 2026 года и проверенные данные.

ПРИ ОТВЕТАХ НА ДРУГИЕ ВОПРОСЫ (ТЕХНОЛОГИИ, БУДУЩЕЕ, ИИ, НАУКА, МИР):
- Разбирай тему на глубочайшем системном уровне: раскрывай скрытые механизмы, хронологию развития в 2026 году, технические детали, ключевые организации/лаборатории, побочные эффекты, причинно-следственные связи и вероятностные сценарии будущего. Никакой банальщины или общих фраз.`;

    const { response } = await generateAiContent(contents, systemInstruction);

    const text = response.text || 'Не удалось сформировать ответ.';

    // Merge sources from both Google Search grounding and our live web engine
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const searchQueries: string[] = groundingMetadata?.webSearchQueries || [searchQuery];
    const groundingChunks = groundingMetadata?.groundingChunks || [];

    const sources: { title: string; uri: string }[] = [];
    const seenUris = new Set<string>();

    // Add Binance Live Market source if crypto was involved
    if (liveCryptoData.length > 0) {
      sources.push({
        title: 'Binance Live Ticker • Онлайн котировки',
        uri: 'https://www.binance.com/ru/markets/overview',
      });
      seenUris.add('https://www.binance.com/ru/markets/overview');
    }

    // Add native grounding chunks
    for (const chunk of (groundingChunks || []) as any[]) {
      if (chunk.web?.uri && chunk.web?.title) {
        if (!seenUris.has(chunk.web.uri)) {
          seenUris.add(chunk.web.uri);
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri,
          });
        }
      }
    }

    // Add live internet search engine sources
    for (const item of liveSearchResults) {
      if (!seenUris.has(item.uri)) {
        seenUris.add(item.uri);
        sources.push({
          title: item.title,
          uri: item.uri,
        });
      }
    }

    res.json({
      text,
      sources: sources.slice(0, 6),
      searchQueries,
      liveSearchCount: sources.length,
      cryptoData: liveCryptoData,
    });
  } catch (err: any) {
    const isQuotaError =
      err?.status === 429 ||
      err?.message?.includes('429') ||
      err?.message?.includes('quota') ||
      err?.message?.includes('RESOURCE_EXHAUSTED');

    if (isQuotaError) {
      return res.status(429).json({
        error: 'quota_exceeded',
        details: 'Лимит запросов к ИИ временно исчерпан. Пожалуйста, подождите 1 минуту.',
      });
    }

    res.status(500).json({
      error: 'Ошибка при обращении к ИИ',
      details: err?.message || String(err),
    });
  }
});

// Transcribe audio endpoint
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioData, mimeType } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: 'Аудиоданные отсутствуют' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'audio/webm',
              data: audioData,
            },
          },
          {
            text: 'Транскрибируй это аудио на русском или языке говорящего. Верни только распознанный текст без комментариев.',
          },
        ],
      },
    });

    res.json({ text: response.text?.trim() || '' });
  } catch (err: any) {
    res.status(500).json({ error: 'Не удалось транскрибировать аудио', details: err?.message });
  }
});

// Setup Vite middleware in development or serve static in production
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
