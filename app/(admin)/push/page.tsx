'use client';

/**
 * /admin/push  —  Vertex DB Push Terminal
 *
 * Full-screen terminal UI to push all local data into MongoDB Atlas:
 *   • Products  (lib/products.json)   — one request per document
 *   • Users     (seed data)           — one request per document
 *   • Logs      (seed data)           — one request per document
 *
 * Access: http://localhost:3000/admin/push
 * Remove or auth-gate before production.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';

/* ── Types ─────────────────────────────────────────────────── */

type CollectionKey = 'products' | 'brands' | 'users' | 'logs';
type Mode          = 'upsert' | 'reset';
type JobState      = 'idle' | 'running' | 'done' | 'error';

interface CollectionStatus {
  localCount: number;
  dbCount:    number;
  state:      JobState;
  pushed:     number;
  errors:     number;
}

interface LogLine {
  id:        number;
  ts:        string;
  level:     'info' | 'success' | 'warn' | 'error' | 'dim';
  text:      string;
  col?:      string; // collection tag colour class
}

const COLLECTIONS: { key: CollectionKey; label: string; endpoint: string; color: string }[] = [
  { key: 'products', label: 'Products',  endpoint: '/api/admin/push-products', color: 'text-violet-400' },
  { key: 'brands',   label: 'Brands',    endpoint: '/api/admin/push-brands',   color: 'text-pink-400'   },
  { key: 'users',    label: 'Users',     endpoint: '/api/admin/push-users',    color: 'text-cyan-400'   },
  { key: 'logs',     label: 'Logs',      endpoint: '/api/admin/push-logs',     color: 'text-amber-400'  },
];

const COL_COLOR: Record<CollectionKey, string> = {
  products: 'text-violet-400',
  brands:   'text-pink-400',
  users:    'text-cyan-400',
  logs:     'text-amber-400',
};

const LEVEL_COLOR: Record<string, string> = {
  info:    'text-white/70',
  success: 'text-emerald-400',
  warn:    'text-amber-400',
  error:   'text-red-400',
  dim:     'text-white/30',
};

const LEVEL_PREFIX: Record<string, string> = {
  info:    '  ',
  success: '✓ ',
  warn:    '⚠ ',
  error:   '✗ ',
  dim:     '  ',
};

let logId = 0;

function mkLogClient(level: LogLine['level'], text: string, col?: string): LogLine {
  return {
    id:    ++logId,
    ts:    new Date().toLocaleTimeString('en-US', { hour12: false }),
    level,
    text,
    col,
  };
}

/* ── Component ─────────────────────────────────────────────── */

export default function PushTerminal() {
  const [secret,    setSecret]    = useState('');
  const [mode,      setMode]      = useState<Mode>('upsert');
  const [running,   setRunning]   = useState(false);
  const [aborted,   setAborted]   = useState(false);
  const abortRef                  = useRef(false);

  const [statuses, setStatuses]   = useState<Record<CollectionKey, CollectionStatus>>({
    products: { localCount: 0, dbCount: 0, state: 'idle', pushed: 0, errors: 0 },
    brands:   { localCount: 0, dbCount: 0, state: 'idle', pushed: 0, errors: 0 },
    users:    { localCount: 0, dbCount: 0, state: 'idle', pushed: 0, errors: 0 },
    logs:     { localCount: 0, dbCount: 0, state: 'idle', pushed: 0, errors: 0 },
  });

  const [lines,     setLines]     = useState<LogLine[]>(() => [
    mkLogClient('dim', 'Vertex Computers — DB Push Terminal v2.0'),
    mkLogClient('dim', '─────────────────────────────────────────────'),
    mkLogClient('dim', 'Enter admin secret and click PUSH ALL to begin.'),
  ]);

  const termRef = useRef<HTMLDivElement>(null);

  /* ── Auto-scroll terminal ─────────────────────────────────── */
  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [lines]);

  const addLog = useCallback((level: LogLine['level'], text: string, col?: string) => {
    flushSync(() => setLines((prev) => [...prev, mkLogClient(level, text, col)]));
  }, []);

  const patchStatus = useCallback((key: CollectionKey, patch: Partial<CollectionStatus>) => {
    setStatuses((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }, []);

  /* ── Fetch DB counts ──────────────────────────────────────── */
  const fetchCounts = useCallback(async (sec: string) => {
    addLog('dim', '─────────────────────────────────────────────');
    addLog('info', 'Checking collection counts…');

    await Promise.all(
      COLLECTIONS.map(async ({ key, label, endpoint, color }) => {
        try {
          const res  = await fetch(endpoint, { headers: { 'x-admin-secret': sec } });
          const data = await res.json();
          if (data.error) {
            addLog('error', `[${label}] ${data.error} ${data.detail ?? ''}`);
            patchStatus(key, { state: 'error' });
          } else {
            addLog('info', `[${label}]  local=${data.localCount}  db=${data.dbCount}`, color);
            patchStatus(key, { localCount: data.localCount, dbCount: data.dbCount, state: 'idle' });
          }
        } catch (e) {
          addLog('error', `[${label}] Network error: ${e instanceof Error ? e.message : String(e)}`);
        }
      }),
    );
  }, [addLog, patchStatus]);

  /* ── Push a single collection one-by-one ─────────────────── */
  const pushCollection = useCallback(async (
    key: CollectionKey,
    endpoint: string,
    label: string,
    localCount: number,
    sec: string,
    pushMode: Mode,
  ): Promise<{ pushed: number; errors: number }> => {
    patchStatus(key, { state: 'running', pushed: 0, errors: 0 });
    addLog('info', `[${label}] Starting push — ${localCount} documents (mode: ${pushMode})`, COL_COLOR[key]);
    if (pushMode === 'reset') addLog('warn', `[${label}] Reset mode — collection will be wiped first`);

    const MAX_RETRIES = 3;
    const RETRY_DELAYS = [1500, 4000, 8000]; // ms — 1.5s, 4s, 8s

    let pushed = 0;
    let errors = 0;

    for (let i = 0; i < localCount; i++) {
      if (abortRef.current) {
        addLog('warn', `[${label}] Aborted at index ${i}`);
        break;
      }

      let attempt  = 0;
      let success  = false;

      while (attempt <= MAX_RETRIES && !success) {
        if (abortRef.current) break;

        if (attempt > 0) {
          const delay = RETRY_DELAYS[attempt - 1] ?? 8000;
          addLog('warn', `[${label}] [${i + 1}/${localCount}] retry ${attempt}/${MAX_RETRIES} — waiting ${delay / 1000}s…`);
          await new Promise((r) => setTimeout(r, delay));
          if (abortRef.current) break;
          addLog('info', `[${label}] [${i + 1}/${localCount}] retrying now…`);
        }

        try {
          const res  = await fetch(endpoint, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-secret': sec },
            body:    JSON.stringify({ index: i, mode: pushMode }),
          });
          const data = await res.json();

          if (data.error) {
            attempt++;
            if (attempt > MAX_RETRIES) {
              errors++;
              addLog('error', `[${label}] [${i + 1}/${localCount}] FAILED after ${MAX_RETRIES} retries — ${data.error}`);
            }
          } else {
            success = true;
            pushed++;
            // Log every item for small sets, every 25 for large sets
            const logEvery = localCount > 100 ? 25 : 1;
            if (i % logEvery === 0 || data.done) {
              const name = data.name ?? data.email ?? data.message ?? `index ${i}`;
              addLog('success', `[${label}] [${i + 1}/${localCount}] ${name}`, COL_COLOR[key]);
            }
          }
        } catch (e) {
          attempt++;
          if (attempt > MAX_RETRIES) {
            errors++;
            addLog('error', `[${label}] [${i + 1}/${localCount}] FAILED after ${MAX_RETRIES} retries — ${e instanceof Error ? e.message : String(e)}`);
          }
        }
      }

      patchStatus(key, { pushed, errors });
    }

    const finalState: JobState = errors === 0 ? 'done' : pushed > 0 ? 'done' : 'error';
    patchStatus(key, { state: finalState });

    if (errors === 0) {
      addLog('success', `[${label}] Complete — ${pushed}/${localCount} pushed`, COL_COLOR[key]);
    } else {
      addLog('warn', `[${label}] Finished with errors — ${pushed} ok, ${errors} failed`);
    }

    return { pushed, errors };
  }, [addLog, patchStatus]);

  /* ── Main push sequence ───────────────────────────────────── */
  const runPushAll = useCallback(async () => {
    if (!secret.trim()) { addLog('warn', 'Enter admin secret before pushing.'); return; }

    abortRef.current = false;
    setAborted(false);
    setRunning(true);

    const t0 = Date.now();
    addLog('dim', '═════════════════════════════════════════════');
    addLog('info', `PUSH ALL — mode: ${mode.toUpperCase()}`);
    addLog('dim', new Date().toLocaleString());

    // Re-fetch counts to get latest localCount
    await fetchCounts(secret);

    // Read fresh statuses from state via ref
    // We push each collection in sequence
    let totalPushed = 0;
    let totalErrors = 0;

    for (const { key, label, endpoint, color } of COLLECTIONS) {
      if (abortRef.current) break;

      // Get current local count from status state (may have just been refreshed)
      const localCount = await (async () => {
        const res  = await fetch(endpoint, { headers: { 'x-admin-secret': secret } });
        const data = await res.json();
        return (data.localCount as number) ?? 0;
      })();

      addLog('dim', '─────────────────────────────────────────────');
      const { pushed, errors } = await pushCollection(key, endpoint, label, localCount, secret, mode);
      totalPushed += pushed;
      totalErrors += errors;

      void color; // used via COL_COLOR
    }

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    addLog('dim', '═════════════════════════════════════════════');

    if (abortRef.current) {
      addLog('warn', `Push aborted by user.`);
    } else if (totalErrors === 0) {
      addLog('success', `All done — ${totalPushed} documents pushed in ${elapsed}s`);
    } else {
      addLog('warn', `Finished — ${totalPushed} pushed, ${totalErrors} errors, ${elapsed}s`);
    }

    setRunning(false);
    // Refresh final counts
    await fetchCounts(secret);
  }, [secret, mode, fetchCounts, pushCollection, addLog]);

  /* ── Abort ────────────────────────────────────────────────── */
  const abort = useCallback(() => {
    abortRef.current = true;
    setAborted(true);
    addLog('warn', 'Abort requested — stopping after current document…');
  }, [addLog]);

  /* ── Auto-check on secret entry ───────────────────────────── */
  useEffect(() => {
    if (secret.length < 6) return;
    const t = setTimeout(() => fetchCounts(secret), 900);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secret]);

  /* ── Clear terminal ────────────────────────────────────────── */
  const clearTerm = useCallback(() => {
    setLines([mkLogClient('dim', 'Terminal cleared.')]);
  }, []);

  /* ── Total progress ────────────────────────────────────────── */
  const totalLocal = Object.values(statuses).reduce((s, v) => s + v.localCount, 0);
  const totalDb    = Object.values(statuses).reduce((s, v) => s + v.dbCount, 0);
  const totalPushedNow = Object.values(statuses).reduce((s, v) => s + v.pushed, 0);

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 bg-[#0c0c10] flex flex-col font-mono overflow-hidden">

      {/* ════ TOP BAR ════ */}
      <div className="flex-none flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.07] bg-[#111116]">
        {/* Traffic lights */}
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-white/50 text-xs">vertex-db-push — bash</span>
        <span className="ml-auto flex items-center gap-2 text-[11px]">
          <span className="text-amber-400/70 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded">
            ADMIN
          </span>
          <span className="text-white/30">Temp tool · remove before shipping</span>
        </span>
      </div>

      {/* ════ MAIN LAYOUT ════ */}
      <div className="flex flex-1 min-h-0">

        {/* ── LEFT PANEL: controls ── */}
        <div className="flex-none w-72 border-r border-white/[0.07] bg-[#0f0f14] flex flex-col overflow-y-auto">

          {/* Secret */}
          <div className="p-4 border-b border-white/[0.06]">
            <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-1.5">
              Admin Secret
            </label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="ADMIN_PUSH_SECRET"
              disabled={running}
              className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-white/80 outline-none focus:border-violet-500/50 placeholder:text-white/15 disabled:opacity-40"
            />
          </div>

          {/* Mode */}
          <div className="p-4 border-b border-white/[0.06]">
            <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-2">
              Mode
            </label>
            <div className="space-y-1.5">
              {(['upsert', 'reset'] as Mode[]).map((m) => (
                <label
                  key={m}
                  className={`flex items-center gap-2.5 rounded px-3 py-2 cursor-pointer text-xs transition-colors ${
                    mode === m ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' : 'text-white/40 hover:text-white/60 border border-transparent'
                  } ${running ? 'pointer-events-none opacity-40' : ''}`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value={m}
                    checked={mode === m}
                    onChange={() => setMode(m)}
                    className="accent-violet-500"
                  />
                  <div>
                    <p className="font-medium capitalize">{m}</p>
                    <p className="text-[10px] opacity-60 mt-0.5">
                      {m === 'upsert' ? 'Insert new, update existing' : 'Drop collection, insert fresh'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Collection status cards */}
          <div className="p-4 border-b border-white/[0.06] space-y-2">
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Collections</p>
            {COLLECTIONS.map(({ key, label, color }) => {
              const s = statuses[key];
              const pct = s.localCount > 0 ? Math.round((s.pushed / s.localCount) * 100) : 0;
              return (
                <div key={key} className="rounded border border-white/[0.06] bg-black/30 p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${color}`}>{label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      s.state === 'done'    ? 'bg-emerald-500/20 text-emerald-400' :
                      s.state === 'running' ? 'bg-violet-500/20 text-violet-400'  :
                      s.state === 'error'   ? 'bg-red-500/20 text-red-400'        :
                      'bg-white/5 text-white/30'
                    }`}>
                      {s.state === 'running' ? `${s.pushed}/${s.localCount}` : s.state}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-white/40">
                    <span>local <span className="text-white/60">{s.localCount}</span></span>
                    <span>db <span className="text-white/60">{s.dbCount}</span></span>
                  </div>
                  {/* Progress bar */}
                  {s.state === 'running' && (
                    <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 transition-all duration-150"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                  {s.state === 'done' && (
                    <div className="h-0.5 bg-emerald-500/50 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Total summary */}
          <div className="p-4 border-b border-white/[0.06]">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-base font-bold text-white">{totalLocal}</p>
                <p className="text-[10px] text-white/30 mt-0.5">Local</p>
              </div>
              <div>
                <p className="text-base font-bold text-white">{totalDb}</p>
                <p className="text-[10px] text-white/30 mt-0.5">In DB</p>
              </div>
              <div>
                <p className="text-base font-bold text-emerald-400">{totalPushedNow}</p>
                <p className="text-[10px] text-white/30 mt-0.5">Pushed</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="p-4 space-y-2 mt-auto">
            {!running ? (
              <button
                onClick={runPushAll}
                disabled={!secret}
                className={`w-full py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                  !secret
                    ? 'bg-white/5 text-white/20 cursor-not-allowed'
                    : mode === 'reset'
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-violet-600 hover:bg-violet-500 text-white'
                }`}
              >
                {mode === 'reset' ? '⚠ Reset & Push All' : '▶ Push All Collections'}
              </button>
            ) : (
              <button
                onClick={abort}
                disabled={aborted}
                className="w-full py-2.5 rounded text-xs font-bold uppercase tracking-wider bg-red-600/80 hover:bg-red-600 text-white disabled:opacity-40 transition-all"
              >
                {aborted ? '◼ Aborting…' : '◼ Abort'}
              </button>
            )}
            <button
              onClick={clearTerm}
              disabled={running}
              className="w-full py-1.5 rounded text-[11px] text-white/30 hover:text-white/50 border border-white/[0.06] hover:border-white/10 disabled:opacity-30 transition-all"
            >
              Clear terminal
            </button>
          </div>
        </div>

        {/* ── RIGHT PANEL: terminal output ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Terminal toolbar */}
          <div className="flex-none flex items-center gap-3 px-4 py-2 border-b border-white/[0.06] bg-[#0f0f14] text-[11px] text-white/30">
            <span className="text-white/50">output</span>
            <span className="ml-auto">{lines.length} lines</span>
          </div>

          {/* Terminal body */}
          <div
            ref={termRef}
            className="flex-1 overflow-y-auto px-5 py-4 space-y-[1px] text-xs leading-5"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#ffffff18 transparent' }}
          >
            {lines.map((line) => (
              <div key={line.id} className="flex gap-3 min-w-0">
                <span className="flex-none text-white/20 select-none w-[7ch]">{line.ts}</span>
                <span className={`flex-none select-none w-4 ${LEVEL_COLOR[line.level]}`}>
                  {LEVEL_PREFIX[line.level]}
                </span>
                <span className={`min-w-0 break-all ${line.col ?? LEVEL_COLOR[line.level]}`}>
                  {line.text}
                </span>
              </div>
            ))}

            {/* Blinking cursor */}
            {!running && (
              <div className="flex gap-3 mt-1">
                <span className="flex-none text-white/20 w-[7ch]" />
                <span className="flex-none w-4" />
                <span className="text-white/60 animate-pulse">█</span>
              </div>
            )}

            {running && (
              <div className="flex gap-3 mt-1">
                <span className="flex-none text-white/20 w-[7ch]" />
                <span className="flex-none w-4" />
                <span className="text-violet-400">
                  <span className="inline-block animate-spin mr-1">⟳</span>
                  running…
                </span>
              </div>
            )}
          </div>

          {/* Bottom status bar */}
          <div className="flex-none flex items-center gap-4 px-4 py-1.5 border-t border-white/[0.06] bg-[#0f0f14] text-[11px]">
            <span className={running ? 'text-violet-400' : 'text-emerald-400/70'}>
              {running ? '● running' : '○ idle'}
            </span>
            <span className="text-white/20">·</span>
            <span className="text-white/30">
              mode: <span className="text-white/50">{mode}</span>
            </span>
            <span className="text-white/20">·</span>
            <span className="text-white/30">
              collections: <span className="text-white/50">products · brands · users · logs</span>
            </span>
            <span className="ml-auto text-white/20">
              localhost:3000/admin/push
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
