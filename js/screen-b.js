// screen-b.js — 화면 B · 실시간 보드 (무대 스크린)

function ScreenB() {
  const { questions, recentlyAdded, connected } = useStore();
  const [filter, setFilter] = useState('all');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const cfg = window.KIFC_CONFIG || {};
  const visible = questions.filter((q) => !q.is_hidden);
  const shown = filter === 'all' ? visible : visible.filter((q) => q.topic === filter);
  const lastUpdate = new Date().toLocaleTimeString('ko-KR', { hour12: false });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', position: 'relative' }}>
      <Header size="lg" eventMeta={cfg.EVENT_META || ''} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '20px 32px 16px', background: 'var(--bg)' }}>
        <Stat label="총 질문" value={visible.length} accent />
        <div style={{ width: 1, height: 36, background: 'var(--border)' }} />
        <Stat label="필터된 질문" value={shown.length} subtle={filter === 'all'} />
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--fg-subtle)' }}>
          <LivePulse on={connected} />
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            {connected ? '실시간 연결됨' : '연결 중...'} · 마지막 갱신 {lastUpdate} KST
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '0 32px 16px', overflowX: 'auto', flex: '0 0 auto', flexWrap: 'wrap' }}>
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="전체" count={visible.length} icon="all_inclusive" />
        {TOPICS.map((t) => {
          const count = visible.filter((q) => q.topic === t.id).length;
          return (
            <FilterChip key={t.id} active={filter === t.id} onClick={() => setFilter(t.id)}
                        label={t.short} count={count} chipColor={t.chipBg} icon={t.icon} />
          );
        })}
      </div>

      <div style={{ flex: 1, padding: '4px 32px 130px' }}>
        {shown.length === 0 ? <EmptyState /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, alignContent: 'start' }}>
            {shown.map((q) => (
              <BoardCard key={q.id} q={q} highlight={recentlyAdded === q.id} />
            ))}
          </div>
        )}
      </div>

      <div style={{
        position: 'fixed', left: 32, right: 32, bottom: 24,
        padding: '14px 22px',
        background: 'rgba(28, 28, 23, 0.92)', backdropFilter: 'blur(8px)',
        color: '#fff', borderRadius: 12,
        display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: '0 12px 32px rgba(28, 28, 23, 0.18)', zIndex: 50,
      }}>
        <QRBlock url={cfg.SUBMIT_URL} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em' }}>
            QR을 스캔하여 질문을 보내 주세요
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
            {cfg.SUBMIT_URL_DISPLAY || cfg.SUBMIT_URL || ''}
          </div>
        </div>
      </div>

      <Toast />
      <ConnectionStatus />
    </div>
  );
}

function Stat({ label, value, accent, subtle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
      <span style={{
        fontSize: 32, fontWeight: 700,
        color: accent ? 'var(--primary-700)' : subtle ? 'var(--neutral-300)' : 'var(--neutral-900)',
        letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', lineHeight: 1,
      }}>{value}</span>
      <span style={{ fontSize: 13, color: 'var(--fg-subtle)' }}>{label}</span>
    </div>
  );
}

function LivePulse({ on = true }) {
  const color = on ? 'var(--primary-500)' : 'var(--neutral-300)';
  return (
    <span style={{ position: 'relative', width: 10, height: 10, display: 'inline-block' }}>
      {on && (
        <span style={{
          position: 'absolute', inset: 0, borderRadius: 999,
          background: color, animation: 'kifcPulseRing 1.6s var(--ease-out) infinite',
        }} />
      )}
      <span style={{ position: 'absolute', inset: 2, borderRadius: 999, background: color }} />
    </span>
  );
}

function FilterChip({ active, onClick, label, count, chipColor, icon }) {
  return (
    <button type="button" onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px',
      background: active ? 'var(--accent-500)' : '#fff',
      color: active ? '#fff' : 'var(--neutral-900)',
      border: active ? '1px solid var(--accent-500)' : '1px solid var(--border)',
      borderRadius: 999, fontSize: 13.5, fontWeight: 600,
      fontFamily: 'var(--font-sans)', cursor: 'pointer',
      letterSpacing: '-0.01em', whiteSpace: 'nowrap',
      transition: 'all 140ms var(--ease-out)', flexShrink: 0,
    }}>
      {chipColor && !active && (<span style={{ width: 8, height: 8, borderRadius: 999, background: chipColor }} />)}
      {!chipColor && (<span className="material-symbols-rounded" style={{ fontSize: 16 }}>{icon || 'category'}</span>)}
      {label}
      <span style={{
        fontSize: 12, fontWeight: 600, padding: '1px 7px',
        background: active ? 'rgba(255,255,255,0.22)' : 'var(--neutral-100)',
        color: active ? '#fff' : 'var(--fg-subtle)',
        borderRadius: 999, fontVariantNumeric: 'tabular-nums',
      }}>{count}</span>
    </button>
  );
}

function BoardCard({ q, highlight }) {
  return (
    <article style={{
      background: '#fff',
      border: `1px solid ${highlight ? 'var(--accent-500)' : 'var(--border)'}`,
      borderRadius: 12, padding: '18px 20px 16px', position: 'relative',
      boxShadow: highlight ? '0 0 0 4px rgba(200, 134, 31, 0.18), 0 4px 14px rgba(28,28,23,0.08)' : 'var(--shadow-xs)',
      animation: highlight ? 'kifcCardIn 400ms var(--ease-out)' : 'none',
      transition: 'border-color 220ms var(--ease-out), box-shadow 220ms var(--ease-out)',
      display: 'flex', flexDirection: 'column', minHeight: 180,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <TopicChip topic={q.topic} size="md" />
        <span style={{ fontSize: 12, color: 'var(--fg-subtle)', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
          {formatHM(q.created_at)}
        </span>
      </div>
      <p style={{
        flex: 1, fontSize: 15.5, lineHeight: 1.55,
        color: 'var(--neutral-900)', fontWeight: 500,
        letterSpacing: '-0.01em', margin: 0, marginBottom: 14,
      }}>{q.content}</p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
        <div style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>
          <span style={{ fontWeight: 600, color: 'var(--neutral-900)' }}>{q.name}</span>
          <span style={{ color: 'var(--fg-subtle)', marginLeft: 6 }}>({q.affiliation})</span>
        </div>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--fg-subtle)' }}>
      <span className="material-symbols-rounded" style={{ fontSize: 56, color: 'var(--neutral-300)', marginBottom: 16, display: 'block' }}>forum</span>
      <div style={{ fontSize: 18, color: 'var(--fg-muted)', fontWeight: 500, marginBottom: 6 }}>
        아직 질문이 없습니다.
      </div>
      <div style={{ fontSize: 14 }}>첫 번째 질문을 남겨 주세요.</div>
    </div>
  );
}

function QRBlock({ url }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!url || !canvasRef.current || !window.QRCode) return;
    window.QRCode.toCanvas(canvasRef.current, url, {
      width: 56, margin: 1, color: { dark: '#0A3D2A', light: '#ffffff' },
    }, (e) => { if (e) console.error('[KIFC] QR 생성 실패', e); });
  }, [url]);
  return (
    <div style={{
      width: 60, height: 60, borderRadius: 8, background: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 2, flexShrink: 0,
    }}>
      <canvas ref={canvasRef} style={{ width: 56, height: 56 }} />
    </div>
  );
}

window.ScreenB = ScreenB;
