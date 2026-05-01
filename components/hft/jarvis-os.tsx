import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LayoutDashboard, Bot, Activity, ListOrdered, History, Settings, LineChart, Brain, Send, Loader2, RefreshCw, TrendingUp } from 'lucide-react';
import { createChart, ColorType, ISeriesApi } from 'lightweight-charts';

// ── Chart Component ────────────────────────────────────────────────────────
const TradingViewChart = ({ symbol = 'BTC/USDT', timeframe = '1h' }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    try {
      const container = chartContainerRef.current;
      const width = container.clientWidth || 600; // Fallback width

      chartRef.current = createChart(container, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#ffeedd',
        },
        grid: {
          vertLines: { color: 'rgba(255, 119, 0, 0.05)' },
          horzLines: { color: 'rgba(255, 119, 0, 0.05)' },
        },
        width: width,
        height: 400,
        timeScale: {
          borderColor: 'rgba(255, 119, 0, 0.2)',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      seriesRef.current = chartRef.current.addCandlestickSeries({
        upColor: '#ffaa00',
        downColor: '#ff3300',
        borderVisible: false,
        wickUpColor: '#ffaa00',
        wickDownColor: '#ff3300',
      });

      const handleResize = () => {
        if (container && chartRef.current) {
          chartRef.current.applyOptions({ width: container.clientWidth });
        }
      };

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);

      const API_BASE = process.env.NEXT_PUBLIC_JARVIS_API_URL || 'http://localhost:3001';
      // Fetch Data
      fetch(`${API_BASE}/api/market/ohlcv?symbol=${symbol.replace('-', '/')}&timeframe=${timeframe}`)
        .then(res => res.json())
        .then(res => {
          if (res.success && seriesRef.current) {
            const formattedData = res.data.map((d: any) => ({
              time: (d[0] / 1000) as any,
              open: d[1],
              high: d[2],
              low: d[3],
              close: d[4],
            }));
            // Sort by time to be safe
            formattedData.sort((a: any, b: any) => a.time - b.time);
            seriesRef.current.setData(formattedData);
          }
        })
        .catch(err => console.error("Chart Data Fetch Error:", err));

      return () => {
        resizeObserver.disconnect();
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
        }
      };
    } catch (error) {
      console.error("TradingViewChart Error:", error);
    }
  }, [symbol, timeframe]);

  return (
    <div className="relative w-full bg-theme-bg/30 border border-theme-border glow-border p-6 mb-12">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-theme-accent/10 rounded-sm">
            <TrendingUp className="w-4 h-4 text-theme-accent" />
          </div>
          <div>
            <span className="font-mono text-xs text-theme-accent glow-text uppercase tracking-widest block">{symbol} Performance</span>
            <span className="text-[9px] text-theme-dim uppercase tracking-tighter">Market Interval: {timeframe}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-theme-green/10 border border-theme-green/20">
           <div className="w-1.5 h-1.5 rounded-full bg-theme-green animate-pulse"></div>
           <span className="text-[9px] text-theme-green font-mono uppercase tracking-widest">Live Sync</span>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
};

// ── API helpers ──────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_JARVIS_API_URL || 'http://localhost:3001';
const api = {
  get: (path: string) => fetch(API_BASE + path).then(r => r.json()),
  post: (path: string, body: object) => fetch(API_BASE + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  patch: (path: string, body: object) => fetch(API_BASE + path, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  del: (path: string) => fetch(API_BASE + path, { method: 'DELETE' }).then(r => r.json()),
};

const initialPrices: Record<string, { price: number; change: number }> = {
  'BTC-USDT': { price: 0, change: 0 },
  'ETH-USDT': { price: 0, change: 0 },
  'SOL-USDT': { price: 0, change: 0 },
  'BNB-USDT': { price: 0, change: 0 },
  'XRP-USDT': { price: 0, change: 0 },
};

const ToggleButton = ({ initialState = true }) => {
  const [isOn, setIsOn] = React.useState(initialState);
  return (
    <div 
      onClick={() => setIsOn(!isOn)}
      className={`w-12 h-6 rounded-full relative cursor-pointer border flex items-center shrink-0 transition-all duration-300 ${isOn ? 'bg-theme-accent/20 border-theme-accent' : 'bg-[#050100] border-theme-border opacity-50'}`}
    >
      <div className={`w-4 h-4 rounded-full absolute transition-all duration-300 ${isOn ? 'right-1 bg-theme-accent shadow-[0_0_10px_theme(colors.theme.accent)]' : 'left-1 bg-theme-dim shadow-none'}`}></div>
    </div>
  );
};

export function JarvisOSDashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [prices, setPrices] = useState(initialPrices);
  const [clock, setClock] = useState('');
  const [bots, setBots] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [signals, setSignals] = useState<Record<string, string>>({});
  const [signalSummary, setSignalSummary] = useState<any>({});
  const [backtestResult, setBacktestResult] = useState<any>(null);
  const [backtestLoading, setBacktestLoading] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBotType, setSelectedBotType] = useState('spot_grid');
  const [wsStatus, setWsStatus] = useState('Establishing connection...');
  const [apiStatus, setApiStatus] = useState<'online'|'offline'|'checking'>('checking');
  const [chatMessages, setChatMessages] = useState<{role:string;text:string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const balance = 12847.32;

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const ws = new WebSocket('wss://ws.okx.com:8443/ws/v5/public');
    
    ws.onopen = () => {
      setWsStatus('✓ Live (OKX)');
      const args = Object.keys(initialPrices).map(sym => ({
        channel: 'tickers',
        instId: sym
      }));
      ws.send(JSON.stringify({ op: 'subscribe', args }));
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.data && parsed.data.length > 0) {
          const ticker = parsed.data[0];
          const sym = ticker.instId;
          const currentPrice = parseFloat(ticker.last);
          const open24h = parseFloat(ticker.open24h);
          const change = ((currentPrice - open24h) / open24h) * 100;
          
          if (initialPrices.hasOwnProperty(sym)) {
             setPrices(prev => ({
               ...prev,
               [sym]: { price: currentPrice, change: change }
             }));
          }
        }
      } catch (e) {
        console.error("WS Parse Error", e);
      }
    };

    ws.onerror = () => setWsStatus('× Connection Error');
    ws.onclose = () => setWsStatus('× Disconnected');

    return () => { ws.close(); };
  }, []);

  // ── API Data Fetching ────────────────────────────────────────────────────────
  const fetchBots = useCallback(async () => {
    try { const r = await api.get('/api/bots'); if (r.success) setBots(r.data); } catch {}
  }, []);

  const fetchTrades = useCallback(async () => {
    try { const r = await api.get('/api/trades'); if (r.success) setTrades(r.data); } catch {}
  }, []);

  const fetchSignals = useCallback(async () => {
    try { 
      const r = await api.get('/api/market/indicators?symbol=BTC-USDT'); 
      if (r.success) { 
        setSignals(r.signals); 
        setSignalSummary(r.summary); 
      } 
    } catch {}
  }, []);

  const fetchOrders = useCallback(async () => {
    try { const r = await api.get('/api/orders'); if (r.success) setPendingOrders(r.data); } catch {}
  }, []);

  useEffect(() => {
    // Health check
    api.get('/api/health')
      .then(r => setApiStatus(r.status === 'online' ? 'online' : 'offline'))
      .catch(() => setApiStatus('offline'));
    // Initial fetch
    fetchBots(); fetchTrades(); fetchSignals(); fetchOrders();
    // Poll every 30s
    const poll = setInterval(() => { fetchBots(); fetchTrades(); fetchSignals(); }, 30_000);
    return () => clearInterval(poll);
  }, [fetchBots, fetchTrades, fetchSignals, fetchOrders]);

  // ── Bot Actions ──────────────────────────────────────────────────────────────
  const toggleBot = async (bot_id: string, current: string) => {
    const next = current === 'running' ? 'stopped' : 'running';
    const r = await api.patch(`/api/bots/${bot_id}/status`, { status: next });
    if (r.success) setBots(prev => prev.map(b => b.bot_id === bot_id ? r.data : b));
  };

  const deployBot = async (payload: object) => {
    const r = await api.post('/api/bots', payload);
    if (r.success) { setBots(prev => [...prev, r.data]); setIsModalOpen(false); }
  };

  const deleteBot = async (bot_id: string) => {
    await api.del(`/api/bots/${bot_id}`);
    setBots(prev => prev.filter(b => b.bot_id !== bot_id));
  };

  // ── Order Actions ────────────────────────────────────────────────────────────
  const placeOrder = async (orderData: object) => {
    const r = await api.post('/api/orders', orderData);
    if (r.success) setPendingOrders(prev => [...prev, r.data]);
    return r;
  };

  const cancelOrder = async (id: string) => {
    await api.del(`/api/orders/${id}`);
    setPendingOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
  };

  const runBacktest = async (payload: any) => {
    setBacktestLoading(true);
    try {
      const r = await api.post('/api/backtest/run', payload);
      if (r.success) setBacktestResult(r);
    } catch {}
    setBacktestLoading(false);
  };

  // ── Gemini Chat ──────────────────────────────────────────────────────────────
  const sendChat = async () => {
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;
    const newHistory = [...chatMessages, { role: 'user', text: msg }];
    setChatMessages(newHistory);
    setChatInput('');
    setChatLoading(true);
    try {
      const r = await api.post('/api/gemini/chat', { message: msg, history: newHistory });
      if (r.success) setChatMessages(prev => [...prev, { role: 'model', text: r.response }]);
      else setChatMessages(prev => [...prev, { role: 'model', text: `⚠ ${r.error}` }]);
    } catch { setChatMessages(prev => [...prev, { role: 'model', text: '⚠ Backend offline.' }]); }
    setChatLoading(false);
  };

  const totalPnl = bots.reduce((sum, b) => sum + b.pnl, 0);
  const runningCount = bots.filter((b) => b.status === 'running').length;
  const totalTrades = bots.reduce((sum, b) => sum + b.trade_count, 0);


  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-8 flex items-center gap-4">
      {children}
      <div className="flex-1 h-[1px] bg-theme-border/50"></div>
    </div>
  );

  const BotCard = ({ b }: { b: any }) => {
    const isRun = b.status === 'running';
    const typeLabel: Record<string, string> = { spot_grid: 'Spot Grid', futures_grid: 'Futures Grid', signal: 'Signal', dca: 'DCA' };
    
    return (
      <div className={`bg-theme-card glow-border border border-theme-border p-8 flex flex-col relative group transition-colors hover:bg-theme-accent/[0.1] ${!isRun && 'opacity-60 grayscale'}`}>
        <div className="mb-8 flex justify-between items-start">
          <div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-theme-accent mb-2">ID {b.bot_id.split('_')[1].toUpperCase()}</div>
            <h3 className="text-3xl font-mono  text-theme-accent glow-text flex items-center gap-3">
              {b.symbol}
            </h3>
            <p className="text-[11px] text-theme-dim mt-2 tracking-wide">
              {typeLabel[b.bot_type]} {b.config.timeframe && `· ${b.config.timeframe}`} {b.config.leverage && `· ${b.config.leverage}x`}
            </p>
          </div>
          <div className="text-[9px] border border-theme-accent/10 px-3 py-1 uppercase tracking-widest font-mono text-theme-dim">
            {isRun ? 'ACTIVE' : 'OFFLINE'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 mt-auto">
          <div className="p-4 border border-theme-accent/5 bg-theme-bg border glow-border border-theme-border">
             <div className="text-[9px] uppercase tracking-widest text-theme-dim mb-1">Total PNL</div>
             <div className={`text-xl font-mono  ${b.pnl >= 0 ? 'text-theme-green' : 'text-theme-red'}`}>{(b.pnl >= 0 ? '+' : '')}${Math.abs(b.pnl).toFixed(2)}</div>
          </div>
          <div className="p-4 border border-theme-accent/5 bg-theme-bg border glow-border border-theme-border">
             <div className="text-[9px] uppercase tracking-widest text-theme-dim mb-1">Trades</div>
             <div className="text-xl font-mono  text-theme-accent glow-text">{b.trade_count}</div>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          {isRun ? (
            <button className="flex-1 py-3 border border-theme-border text-[10px] uppercase tracking-widest hover:border-theme-red/50 text-theme-dim hover:text-theme-red transition-colors cursor-pointer bg-transparent"
              onClick={() => toggleBot(b.bot_id, b.status)}>
              Terminate
            </button>
          ) : (
             <button className="flex-1 py-3 border border-theme-border text-[10px] uppercase tracking-widest hover:border-theme-green/50 text-theme-dim hover:text-theme-green transition-colors cursor-pointer bg-transparent"
              onClick={() => toggleBot(b.bot_id, b.status)}>
              Initialize
            </button>
          )}
          <button className="py-3 px-3 border border-theme-border text-[10px] hover:border-theme-red/30 text-theme-dim hover:text-theme-red transition-colors cursor-pointer bg-transparent" title="Remove"
            onClick={() => deleteBot(b.bot_id)}>✕</button>
        </div>
      </div>
    );
  };

  const TradeTable = () => (
    <div className="border border-theme-border bg-theme-card glow-border flex flex-col mb-12">
      <div className="grid grid-cols-[150px_80px_120px_120px_100px_1fr] px-6 py-4 border-b border-theme-border text-[9px] uppercase tracking-[0.2em] text-theme-dim bg-black/20">
        <span>Timestamp</span><span>Side</span><span>Symbol</span><span>Price</span><span>Amount</span><span>PnL</span>
      </div>
      {trades.map((t, i) => {
        const sideCls = t.side === 'BUY' || t.side === 'LONG' ? 'text-theme-green' : 'text-theme-red';
        const pnlVal = typeof t.pnl === 'number' ? (t.pnl >= 0 ? `+$${t.pnl.toFixed(2)}` : `-$${Math.abs(t.pnl).toFixed(2)}`) : t.pnl;
        const pnlCls = t.pos === true ? 'text-theme-green' : t.pos === false ? 'text-theme-red' : 'text-theme-dim';
        return (
          <div key={i} className="grid grid-cols-[150px_80px_120px_120px_100px_1fr] px-6 py-4 border-b border-theme-accent/5 font-mono text-[11px] text-theme-text hover:bg-theme-accent/[0.05] transition-colors last:border-b-0 items-center">
            <span className="text-theme-dim">{t.time}</span>
            <span className={sideCls}>{t.side}</span>
            <span className="text-theme-accent glow-text">{t.symbol}</span>
            <span>${t.price}</span>
            <span>{t.amount}</span>
            <span className={pnlCls}>{pnlVal ?? t.pnl}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="h-full w-full flex font-sans bg-theme-bg text-theme-text overflow-hidden select-none relative">
      
      {/* Sidebar */}
      <aside className="w-80 border-r border-theme-border flex flex-col p-10 bg-theme-sidebar shrink-0 overflow-y-auto">
        <div className="mb-16">
          <h1 className="text-4xl font-mono  text-theme-accent leading-none">J.A.R.V.I.S. OS</h1>
          <p className="text-[9px] uppercase tracking-[0.4em] text-theme-dim mt-4">Algorithmic Trading</p>
        </div>
        
        <nav className="flex-1 space-y-12 shrink-0 border-b border-theme-border/50 pb-8">
          <div className="space-y-6">
            <label className="text-[9px] uppercase tracking-[0.2em] text-theme-accent font-semibold opacity-80">Modules</label>
            <ul className="space-y-4 text-[13px] tracking-wide">
              {[
                { id: 'dashboard', label: 'Global Dashboard', icon: LayoutDashboard },
                { id: 'bots', label: 'Logic Controller', icon: Bot },
                { id: 'backtest', label: 'Simulation Engine', icon: LineChart },
                { id: 'signals', label: 'Signal Matrix', icon: Activity },
                { id: 'orders', label: 'Order Execution', icon: ListOrdered },
                { id: 'history', label: 'Event History', icon: History },
                { id: 'memory', label: 'Neural Core & Skills', icon: Brain },
                { id: 'chat', label: 'J.A.R.V.I.S. Chat', icon: Send },
                { id: 'settings', label: 'System Configuration', icon: Settings },
              ].map((item, idx) => (
                <li key={item.id} onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center gap-4 transition-opacity cursor-pointer py-1 
                  ${currentPage === item.id ? 'text-theme-accent glow-text opacity-100' : 'text-theme-dim mix-blend-screen opacity-50 hover:opacity-100'}`}>
                  <span className="text-[10px] font-mono  opacity-40">0{idx + 1}</span> 
                  <item.icon className="w-[14px] h-[14px]" />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </nav>
        
        <div className="mt-8 space-y-4 shrink-0">
          <div className="flex justify-between items-center opacity-50 text-[10px] uppercase tracking-widest text-theme-text">
            <span>Time</span>
            <span className="font-mono">{clock}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
            <span className="opacity-50 text-theme-text">OKX</span>
            <span className={wsStatus.includes('✓') ? 'text-theme-green' : 'text-theme-red'}>{wsStatus}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
            <span className="opacity-50 text-theme-text">API</span>
            <span className={apiStatus === 'online' ? 'text-theme-green' : apiStatus === 'offline' ? 'text-theme-red' : 'text-theme-dim'}>
              {apiStatus === 'online' ? '✓ Backend' : apiStatus === 'offline' ? '× Offline' : '···'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col pt-12 px-14 pb-0 bg-theme-bg overflow-y-auto scrollbar-thin scrollbar-thumb-theme-border scrollbar-track-transparent">
        
        <header className="flex justify-between items-start mb-12 shrink-0">
          <div className="space-y-3">
            <h2 className="text-6xl font-mono font-light text-theme-accent glow-text leading-[1.1]">Workstation <span className=" font-bold text-theme-accent glow-text">Alpha</span></h2>
            <p className="text-[13px] tracking-wide text-theme-dim max-w-lg font-light leading-relaxed">
              Seamless orchestration of trading instances. Aggregate monitoring and control interface for deployed strategies.
            </p>
          </div>
          <div className="flex flex-col items-end pt-4">
            <div className="w-16 h-[1px] bg-theme-border mb-4"></div>
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-[0.3em] text-theme-dim mb-1">System Volume</div>
              <div className="text-3xl font-mono  text-theme-accent">${balance.toLocaleString('en', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
        </header>

        {/* Ticker */}
        <div className="flex gap-8 border-b border-theme-border pb-8 mb-12 overflow-x-auto scrollbar-none shrink-0 opacity-80 mix-blend-screen">
          {Object.entries(prices).map(([sym, d]) => (
            <div key={sym} className="flex gap-3 items-center whitespace-nowrap text-xs">
              <span className="font-mono text-theme-dim">{sym}</span>
              <span className="font-mono text-theme-text">${d.price > 0 ? Number(d.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : '...'}</span>
              <span className={`font-mono text-[11px] ${d.change >= 0 ? 'text-theme-green' : 'text-theme-red'}`}>
                {d.change >= 0 ? '▲' : '▼'} {Math.abs(d.change).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>

        {/* Dynamic Content */}
        <div className="flex-1 pb-20">
          {currentPage === 'dashboard' && (
            <div className="animate-in fade-in duration-500">
              <SectionTitle>Global Overview</SectionTitle>
              <div className="grid grid-cols-3 gap-6 mb-12">
                <div className="bg-theme-card glow-border border border-theme-border p-8 flex flex-col relative group hover:bg-theme-accent/[0.1] transition-colors">
                  <div className="absolute top-6 right-6 flex gap-1">
                    <div className="w-1 h-1 bg-theme-accent"></div><div className="w-1 h-1 bg-theme-accent/40"></div><div className="w-1 h-1 bg-theme-accent/20"></div>
                  </div>
                  <div className="mb-6">
                    <div className="text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Metric 01</div>
                    <h3 className="text-2xl font-mono  mb-2 text-theme-accent glow-text truncate">Total Balance</h3>
                    <p className="text-xs text-theme-dim leading-relaxed">Spot + Futures Equity</p>
                  </div>
                  <div className="mt-auto text-3xl font-mono text-theme-accent glow-text">
                    ${balance.toLocaleString('en', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                
                <div className="bg-theme-card glow-border border border-theme-border p-8 flex flex-col relative group hover:bg-theme-accent/[0.1] transition-colors">
                  <div className="absolute top-6 right-6 flex gap-1">
                    <div className="w-1 h-1 bg-theme-accent"></div><div className="w-1 h-1 bg-theme-accent/40"></div><div className="w-1 h-1 bg-theme-accent/20"></div>
                  </div>
                  <div className="mb-6">
                    <div className="text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Metric 02</div>
                    <h3 className="text-2xl font-mono  mb-2 text-theme-accent glow-text truncate">Total PNL</h3>
                    <p className="text-xs text-theme-dim leading-relaxed">Aggregated performance across all nodes</p>
                  </div>
                  <div className={`mt-auto text-3xl font-mono ${totalPnl >= 0 ? 'text-theme-green' : 'text-theme-red'}`}>
                    {totalPnl >= 0 ? '+' : ''}${Math.abs(totalPnl).toFixed(2)}
                  </div>
                </div>

                <div className="bg-theme-card glow-border border border-theme-border p-8 flex flex-col relative group hover:bg-theme-accent/[0.1] transition-colors">
                  <div className="absolute top-6 right-6 flex gap-1">
                    <div className="w-1 h-1 bg-theme-accent"></div><div className="w-1 h-1 bg-theme-accent/40"></div><div className="w-1 h-1 bg-theme-accent/20"></div>
                  </div>
                  <div className="mb-6">
                    <div className="text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Metric 03</div>
                    <h3 className="text-2xl font-mono  mb-2 text-theme-accent glow-text truncate">Active Instances</h3>
                    <p className="text-xs text-theme-dim leading-relaxed">{totalTrades} operations executed successfully</p>
                  </div>
                  <div className="mt-auto text-3xl font-mono text-theme-accent glow-text">
                    {runningCount} / {bots.length}
                  </div>
                </div>
              </div>

              <TradingViewChart symbol="BTC-USDT" timeframe="1h" />

              <SectionTitle>Active Controllers</SectionTitle>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(330px,1fr))] gap-6 mb-12">
                {bots.filter((b) => b.status === 'running').map((b) => <BotCard key={b.bot_id} b={b} />)}
              </div>

              <SectionTitle>Recent Transcripts</SectionTitle>
              <TradeTable />
            </div>
          )}

          {currentPage === 'bots' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-8">
                <div className="text-[9px] uppercase tracking-[0.2em] text-theme-dim m-0">Library ({bots.length})</div>
                <button className="bg-theme-accent/10 text-theme-accent border border-theme-accent/30 px-6 py-3 font-mono  text-sm transition-colors hover:bg-theme-accent/20 cursor-pointer"
                  onClick={() => setIsModalOpen(true)}>
                  + Initialize Instance
                </button>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(330px,1fr))] gap-6 mb-12">
                {bots.map((b) => <BotCard key={b.bot_id} b={b} />)}
              </div>
            </div>
          )}

          {currentPage === 'backtest' && (
            <div className="animate-in fade-in duration-500">
               <SectionTitle>Historical Simulation Environment</SectionTitle>
               <div className="bg-theme-card glow-border border border-theme-border p-8 mb-12 flex gap-8">
                 <form onSubmit={(e) => {
                   e.preventDefault();
                   const fd = new FormData(e.currentTarget);
                   runBacktest({
                     symbol: fd.get('symbol'),
                     strategy: fd.get('strategy'),
                     initialCapital: Number(fd.get('capital'))
                   });
                 }} className="flex bg-theme-bg border glow-border border-theme-border p-6 w-[320px] flex-col gap-6 shrink-0">
                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Algorithm</label>
                      <select name="strategy" className="w-full bg-theme-bg focus:border-theme-accent focus:glow-border border border-theme-border p-3 text-theme-accent glow-text font-mono text-xs outline-none transition-colors">
                        <option value="ema_cross">EMA Cross (9/21)</option>
                        <option value="rsi">RSI Mean Reversion</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Target Asset</label>
                      <input name="symbol" defaultValue="BTC/USDT" className="w-full bg-theme-bg focus:border-theme-accent focus:glow-border border border-theme-border p-3 text-theme-accent glow-text font-mono text-xs outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Initial Capital</label>
                      <input name="capital" defaultValue="1000" className="w-full bg-theme-bg focus:border-theme-accent focus:glow-border border border-theme-border p-3 text-theme-accent glow-text font-mono text-xs outline-none transition-colors" />
                    </div>
                    <button disabled={backtestLoading} className="bg-theme-accent/[0.05] text-theme-accent glow-text border border-theme-accent/20 py-3 font-mono text-sm transition-colors mt-4 hover:bg-theme-accent/[0.15] hover:border-theme-accent cursor-pointer flex items-center justify-center gap-2">
                      {backtestLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Run Simulation'}
                    </button>
                 </form>
                 
                 <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-theme-border/50 bg-theme-bg min-h-[400px]">
                    {!backtestResult ? (
                      <>
                        <LineChart className="w-12 h-12 text-theme-dim mb-4 opacity-30" strokeWidth={1} />
                        <span className="text-theme-dim font-mono text-sm">Simulation graph will be rendered here.</span>
                      </>
                    ) : (
                      <div className="w-full h-full p-8 grid grid-cols-2 gap-8">
                        <div className="space-y-6">
                           <div>
                             <div className="text-[9px] uppercase tracking-widest text-theme-dim mb-1">Final Portfolio Value</div>
                             <div className="text-4xl font-mono text-theme-green glow-text">${backtestResult.summary.finalValue}</div>
                           </div>
                           <div>
                             <div className="text-[9px] uppercase tracking-widest text-theme-dim mb-1">Total Return</div>
                             <div className="text-2xl font-mono text-theme-accent">{backtestResult.summary.totalReturn}</div>
                           </div>
                           <div>
                             <div className="text-[9px] uppercase tracking-widest text-theme-dim mb-1">Win Rate</div>
                             <div className="text-2xl font-mono text-theme-text">{backtestResult.summary.winRate}</div>
                           </div>
                        </div>
                        <div className="border-l border-theme-border pl-8 overflow-y-auto max-h-[350px] scrollbar-thin scrollbar-thumb-theme-border">
                           <div className="text-[9px] uppercase tracking-widest text-theme-dim mb-4">Execution Log</div>
                           {backtestResult.history.map((h: any, i: number) => (
                             <div key={i} className="mb-3 text-[10px] font-mono flex justify-between border-b border-theme-border/20 pb-2">
                               <span className={h.type === 'BUY' ? 'text-theme-green' : 'text-theme-red'}>{h.type}</span>
                               <span>${h.price}</span>
                               <span className="text-theme-dim opacity-50">{h.time.split('T')[1].slice(0,5)}</span>
                             </div>
                           ))}
                        </div>
                      </div>
                    )}
                 </div>
               </div>

               <SectionTitle>Database Metatdata</SectionTitle>
               <div className="grid grid-cols-3 gap-6">
                 <div className="bg-theme-bg focus:border-theme-accent focus:glow-border border border-theme-border/50 p-6">
                   <div className="text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Candlestick Records (1h)</div>
                   <div className="font-mono  text-theme-accent glow-text text-xl">1.2M Rows</div>
                 </div>
                 <div className="bg-theme-bg focus:border-theme-accent focus:glow-border border border-theme-border/50 p-6">
                   <div className="text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Archived Operations</div>
                   <div className="font-mono  text-theme-accent glow-text text-xl">45,210 Rows</div>
                 </div>
                 <div className="bg-theme-bg focus:border-theme-accent focus:glow-border border border-theme-border/50 p-6">
                   <div className="text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Database Engine</div>
                   <div className="font-mono  text-theme-accent text-xl">SQLite (Local)</div>
                 </div>
               </div>
            </div>
          )}

          {currentPage === 'signals' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-8">
                <SectionTitle>Primary Indices — ETH-USDT 4h</SectionTitle>
                <button 
                  onClick={fetchSignals}
                  className="p-2 text-theme-dim hover:text-theme-accent transition-colors"
                  title="Refresh Matrix"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 mb-12">
                {Object.entries(signals).map(([name, sig], i) => {
                  const cls = sig === 'BUY' ? 'text-theme-green' : sig === 'SELL' ? 'text-theme-red' : 'text-theme-accent';
                  return (
                    <div key={i} className="bg-theme-card glow-border border border-theme-border p-5 flex justify-between items-center transition-colors hover:bg-theme-accent/[0.1]">
                      <span className="text-xs text-theme-text font-mono ">{name}</span>
                      <span className={`font-mono text-[10px] uppercase tracking-widest ${cls}`}>{sig}</span>
                    </div>
                  );
                })}
              </div>

              <div className="bg-theme-card glow-border border border-theme-border p-8 relative overflow-hidden mb-12">
                {signalSummary.consensus && (
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-4">
                        Algorithmic Consensus: {signalSummary.buys} BUY · {signalSummary.sells} SELL · {signalSummary.holds} HOLD
                      </div>
                      <div className={`font-mono text-4xl leading-none ${signalSummary.consensus.includes('BUY') ? 'text-theme-green' : signalSummary.consensus.includes('SELL') ? 'text-theme-red' : 'text-theme-accent'}`}>
                        {signalSummary.consensus}
                      </div>
                    </div>
                    <div className="text-xs text-theme-dim text-right max-w-[200px] leading-relaxed">
                      Evaluated via simple majority polling mechanism.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentPage === 'orders' && (
            <div className="animate-in fade-in duration-500">
              <SectionTitle>Manual Execution Protocol</SectionTitle>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                await placeOrder({
                  symbol: fd.get('symbol'),
                  side: fd.get('side'),
                  amount: fd.get('amount'),
                  price: fd.get('price'),
                });
                (e.target as any).reset();
              }} className="bg-theme-card glow-border border border-theme-border p-8 mb-12">
                <div className="grid grid-cols-4 gap-6 mb-8">
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Target Asset</label>
                    <input name="symbol" className="w-full bg-theme-bg focus:border-theme-accent focus:glow-border border border-theme-border p-3 text-theme-accent glow-text font-mono text-xs outline-none transition-colors" defaultValue="BTC-USDT" />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Trajectory</label>
                    <select name="side" className="w-full bg-theme-bg focus:border-theme-accent focus:glow-border border border-theme-border p-3 text-theme-accent glow-text font-mono text-xs outline-none transition-colors">
                      <option value="buy">BUY</option><option value="sell">SELL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Volume</label>
                    <input name="amount" className="w-full bg-theme-bg focus:border-theme-accent focus:glow-border border border-theme-border p-3 text-theme-accent glow-text font-mono text-xs outline-none transition-colors" placeholder="0.001" />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Limit Value (Optional)</label>
                    <input name="price" className="w-full bg-theme-bg focus:border-theme-accent focus:glow-border border border-theme-border p-3 text-theme-accent glow-text font-mono text-xs outline-none transition-colors" placeholder="market" />
                  </div>
                </div>
                <button type="submit" className="bg-theme-accent/[0.05] text-theme-accent glow-text border border-theme-accent/20 py-3 px-8 font-mono text-sm transition-colors hover:bg-theme-accent/[0.15] hover:border-theme-accent cursor-pointer">
                  Transmit Order
                </button>
              </form>

              <SectionTitle>Pending Operations</SectionTitle>
              <div className="border border-theme-border bg-theme-card glow-border flex flex-col mb-12">
                <div className="grid grid-cols-[1fr_100px_120px_120px_80px] px-6 py-4 border-b border-theme-border text-[9px] uppercase tracking-[0.2em] text-theme-dim bg-black/20">
                  <span>Symbol</span><span>Side</span><span>Value</span><span>Volume</span><span className="text-right">Cancel</span>
                </div>
                {pendingOrders.filter(o => o.status === 'pending').map((o) => (
                  <div key={o.id} className="grid grid-cols-[1fr_100px_120px_120px_80px] px-6 py-4 border-b border-theme-accent/5 font-mono text-[11px] text-theme-text hover:bg-theme-accent/[0.05] transition-colors last:border-b-0 items-center">
                    <span className="text-theme-accent glow-text">{o.symbol}</span>
                    <span className={o.side === 'BUY' ? 'text-theme-green' : 'text-theme-red'}>{o.side}</span>
                    <span>{o.price ? `$${o.price}` : 'MARKET'}</span>
                    <span>{o.amount}</span>
                    <button onClick={() => cancelOrder(o.id)} className="text-right text-theme-red/50 hover:text-theme-red transition-colors cursor-pointer bg-transparent border-none">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentPage === 'history' && (
            <div className="animate-in fade-in duration-500">
              <SectionTitle>Archived Operations Log</SectionTitle>
              <TradeTable />
            </div>
          )}

          {currentPage === 'chat' && (
            <div className="animate-in fade-in duration-500 h-full flex flex-col">
              <SectionTitle>J.A.R.V.I.S. Neural Core Interface</SectionTitle>
              <div className="flex-1 min-h-0 bg-theme-card border border-theme-border glow-border mb-8 flex flex-col">
                <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-theme-border scrollbar-track-transparent">
                  {chatMessages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                      <Brain className="w-16 h-16 mb-4" strokeWidth={1} />
                      <p className="font-mono text-sm">Neural core initialized. Awaiting user input.</p>
                    </div>
                  )}
                  {chatMessages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 border font-mono text-sm leading-relaxed ${
                        m.role === 'user' 
                        ? 'bg-theme-accent/10 border-theme-accent/30 text-theme-accent text-right' 
                        : 'bg-theme-bg border-theme-border text-theme-text'
                      }`}>
                        <div className="text-[9px] uppercase tracking-widest opacity-50 mb-2">
                          {m.role === 'user' ? 'User Sequence' : 'J.A.R.V.I.S. Process'}
                        </div>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-theme-bg border border-theme-border p-4 flex items-center gap-3">
                        <Loader2 className="w-4 h-4 animate-spin text-theme-accent" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-theme-dim">Processing...</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-8 border-t border-theme-border bg-black/20 flex gap-4">
                  <input 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                    placeholder="Input command or query..."
                    className="flex-1 bg-theme-bg border border-theme-border p-4 text-theme-accent glow-text font-mono text-sm outline-none focus:border-theme-accent transition-colors"
                  />
                  <button 
                    onClick={sendChat}
                    disabled={chatLoading}
                    className="bg-theme-accent/10 text-theme-accent border border-theme-accent/30 px-8 flex items-center justify-center hover:bg-theme-accent/20 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'memory' && (
            <div className="animate-in fade-in duration-500">
              <SectionTitle>User Training Protocols</SectionTitle>
              <div className="bg-theme-card glow-border border border-theme-border p-8 mb-12">
                <p className="text-theme-text font-mono text-sm mb-4">
                  These are the exact rules you've taught the assistant.
                </p>
                <textarea 
                  className="w-full h-48 bg-[#0a0300] focus:border-theme-accent focus:glow-border border border-theme-border p-4 text-theme-text font-mono text-[13px] outline-none"
                  readOnly
                  value={`Kurallar:\n• Sadece onayladığım araçları kullan.\n• İşlem yaparken her zaman önce bana sor.\n• Terminalde renkli arayüz kullan.\n\nBilgiler:\n• Tercih edilen dil: Türkçe\n• Son yedekleme: 12.04.2024\n• Yetki durumu: Tam`}
                />
              </div>

              <SectionTitle>System Abilities Toggle</SectionTitle>
              <div className="bg-theme-card glow-border border border-theme-border p-8 mb-12">
                <p className="text-theme-text font-mono text-sm mb-6">
                  Switch off an ability to restrict the assistant from using it.
                </p>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-theme-border scrollbar-track-transparent">
                  {[
                    { name: 'update_training', desc: 'Kullanıcı komutlarını ve kişisel kuralları hafızaya kaydeder.' },
                    { name: 'computer_settings', desc: 'Bilgisayar kontrolü: Ses, ekran parlaklığı, sekmeler, vb.' },
                    { name: 'open_app', desc: 'Bilgisayardaki her türlü yazılım ve oyunu otomatik başlatır.' },
                    { name: 'file_controller', desc: 'Dosya oluşturma, silme, masaüstünü düzenleme işlemleri.' },
                    { name: 'browser_control', desc: 'Web\'de gezinme, form doldurma, işlem yapma.' },
                    { name: 'cmd_control', desc: 'Arka planda terminal kullanarak her türlü sistemi yönetme.' },
                    { name: 'code_helper', desc: 'Sizin için kod yazar, düzenler ve hatalarını ayıklar.' },
                    { name: 'dev_agent', desc: 'Komple bir yazılım projesini yaratıp VSCode\'ta çalıştırır.' },
                    { name: 'screen_process', desc: 'Ekranınızda ne olduğuna bakar veya web kameranızı analiz eder.' }
                  ].map((skill, i) => (
                    <div key={i} className="flex justify-between items-center bg-[#0a0300] border border-theme-border p-5">
                      <div>
                        <div className="text-theme-accent font-bold font-mono text-sm mb-1 tracking-widest">❖ {skill.name.toUpperCase()}</div>
                        <div className="text-theme-text font-mono text-[11px] opacity-80 mt-1">{skill.desc}</div>
                      </div>
                      <ToggleButton />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentPage === 'settings' && (
            <div className="animate-in fade-in duration-500">
              <SectionTitle>API Configuration</SectionTitle>
              <div className="bg-theme-card glow-border border border-theme-border p-8 mb-12 max-w-2xl">
                <div className="space-y-6 mb-8">
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Access Key</label>
                    <input type="password" placeholder="••••••••••••••••" className="w-full bg-theme-bg focus:border-theme-accent focus:glow-border border border-theme-border p-3 text-theme-accent glow-text font-mono text-xs outline-none focus:border-theme-accent transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Secret Signature</label>
                    <input type="password" placeholder="••••••••••••••••" className="w-full bg-theme-bg focus:border-theme-accent focus:glow-border border border-theme-border p-3 text-theme-accent glow-text font-mono text-xs outline-none focus:border-theme-accent transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Passphrase Validation</label>
                    <input type="password" placeholder="••••••••••••••••" className="w-full bg-theme-bg focus:border-theme-accent focus:glow-border border border-theme-border p-3 text-theme-accent glow-text font-mono text-xs outline-none focus:border-theme-accent transition-colors" />
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mb-8 cursor-pointer text-xs text-theme-dim">
                  <div className="w-3 h-3 border border-theme-accent bg-theme-accent/20"></div>
                  <span>Engage Testnet Mode</span>
                </div>
                
                <button className="bg-theme-accent/[0.05] text-theme-accent glow-text border border-theme-accent/20 py-3 px-8 font-mono  text-sm transition-colors hover:bg-theme-accent/[0.15] hover:border-theme-accent hover:text-theme-accent cursor-pointer">
                  Persist & Validate
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal / Dialog */}
      {/* Modal / Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-300">
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const payload: any = {
              bot_type: selectedBotType,
              symbol: fd.get('symbol'),
              config: {}
            };
            // Dynamic config based on type
            fd.forEach((val, key) => {
              if (key !== 'symbol') payload.config[key] = val;
            });
            deployBot(payload);
          }} className="bg-theme-bg focus:border-theme-accent focus:glow-border border border-theme-border p-10 w-[560px] max-h-[90vh] overflow-y-auto">
            <h3 className="text-3xl font-mono  text-theme-accent mb-8">Deploy Instance.</h3>
            
            <div className="flex gap-2 mb-8 flex-wrap">
              {['spot_grid', 'futures_grid', 'signal', 'dca'].map((t) => (
                <div key={t} onClick={() => setSelectedBotType(t)} 
                  className={`flex-1 min-w-[110px] p-3 text-center cursor-pointer text-[10px] uppercase tracking-widest transition-all
                  ${selectedBotType === t ? 'border border-theme-accent text-theme-accent bg-theme-accent/5' : 'border border-theme-border text-theme-dim hover:text-theme-accent glow-text'}`}>
                  {t === 'spot_grid' ? 'Spot Grid' : t === 'futures_grid' ? 'Futures Grid' : t === 'signal' ? 'Signal Node' : 'DCA Route'}
                </div>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Target Asset</label>
              <input name="symbol" defaultValue="BTC-USDT" required className="w-full bg-theme-bg border glow-border border-theme-border p-3 text-theme-accent glow-text font-mono text-xs outline-none focus:border-theme-accent transition-colors" />
            </div>

            {(selectedBotType === 'spot_grid' || selectedBotType === 'futures_grid') && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Lower Bound</label>
                    <input name="lower_price" placeholder="90000" className="w-full bg-theme-bg border glow-border border-theme-border p-3 text-theme-accent glow-text font-mono text-xs outline-none focus:border-theme-accent transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Upper Bound</label>
                    <input name="upper_price" placeholder="110000" className="w-full bg-theme-bg border glow-border border-theme-border p-3 text-theme-accent glow-text font-mono text-xs outline-none focus:border-theme-accent transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Grid Count</label>
                    <input name="grid_count" placeholder="20" className="w-full bg-theme-bg border glow-border border-theme-border p-3 text-theme-accent glow-text font-mono text-xs outline-none focus:border-theme-accent transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Volume (USDT)</label>
                    <input name="investment" placeholder="1000" className="w-full bg-theme-bg border glow-border border-theme-border p-3 text-theme-accent glow-text font-mono text-xs outline-none focus:border-theme-accent transition-colors" />
                  </div>
                </div>
                {selectedBotType === 'futures_grid' && (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Leverage Multiplier</label>
                      <input name="leverage" placeholder="3" className="w-full bg-theme-bg border glow-border border-theme-border p-3 text-theme-accent glow-text font-mono text-xs outline-none focus:border-theme-accent transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Deployment Mode</label>
                      <select name="mode" className="w-full bg-theme-bg border glow-border border-theme-border p-3 text-theme-accent glow-text font-mono text-xs outline-none focus:border-theme-accent transition-colors">
                        <option value="neutral">Neutral Strategy</option><option value="long">Long Bias</option><option value="short">Short Bias</option>
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}

            {selectedBotType === 'signal' && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Temporal Resolution</label>
                    <select name="timeframe" className="w-full bg-theme-bg border glow-border border-theme-border p-3 text-theme-accent glow-text font-mono text-xs outline-none focus:border-theme-accent transition-colors" defaultValue="4h">
                      <option>1m</option><option>5m</option><option>15m</option><option>1h</option><option>4h</option><option>1d</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Base Volume (USDT)</label>
                    <input name="base_volume" placeholder="200" className="w-full bg-theme-bg border glow-border border-theme-border p-3 text-theme-accent glow-text font-mono text-xs outline-none focus:border-theme-accent transition-colors" />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-3">Signaling Entities</label>
                  <div className="grid grid-cols-2 gap-3 text-theme-dim">
                    {['EMA Matrix', 'RSI Threshold', 'MACD Osc', 'SuperTrend', 'Bollinger Bands', 'Custom Logic'].map((ind) => (
                      <label key={ind} className="flex items-center gap-3 text-xs cursor-pointer hover:text-theme-accent glow-text transition-colors">
                        <input type="checkbox" name="indicators" value={ind} className="hidden" />
                        <div className="w-3 h-3 border border-theme-border flex items-center justify-center"></div> {ind}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Stop Threshold (%)</label>
                    <input name="stop_loss" placeholder="2.0" className="w-full bg-theme-bg border glow-border border-theme-border p-3 text-theme-accent glow-text font-mono text-xs outline-none focus:border-theme-accent transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Target Yield (%)</label>
                    <input name="take_profit" placeholder="4.0" className="w-full bg-theme-bg border glow-border border-theme-border p-3 text-theme-accent glow-text font-mono text-xs outline-none focus:border-theme-accent transition-colors" />
                  </div>
                </div>
              </>
            )}

            {selectedBotType === 'dca' && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Initial Tranche (USDT)</label>
                    <input name="base_order" placeholder="10" className="w-full bg-theme-bg border glow-border border-theme-border p-3 text-theme-accent glow-text font-mono text-xs outline-none focus:border-theme-accent transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Recovery Tranche (USDT)</label>
                    <input name="safety_order" placeholder="20" className="w-full bg-theme-bg border glow-border border-theme-border p-3 text-theme-accent glow-text font-mono text-xs outline-none focus:border-theme-accent transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Max Recovery Moves</label>
                    <input name="max_safety_orders" placeholder="5" className="w-full bg-theme-bg border glow-border border-theme-border p-3 text-theme-accent glow-text font-mono text-xs outline-none focus:border-theme-accent transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-theme-dim mb-2">Dip Step (%)</label>
                    <input name="deviation" placeholder="1.0" className="w-full bg-theme-bg border glow-border border-theme-border p-3 text-theme-accent glow-text font-mono text-xs outline-none focus:border-theme-accent transition-colors" />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-4 mt-10">
              <button type="submit" className="bg-theme-accent text-black border border-theme-accent py-3 font-mono  text-sm transition-colors cursor-pointer flex-1">
                Acknowledge & Deploy
              </button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="bg-transparent text-theme-dim border border-theme-border hover:border-theme-accent py-3 font-mono  text-sm transition-colors cursor-pointer px-6">
                Abort
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
