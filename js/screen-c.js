// screen-c.js — 화면 C · 운영자 모드 (URL: /admin.html?key=<ADMIN_KEY>)

function ScreenC() {
  const { questions, toggleHidden } = useStore();
  const [keywordPanelOpen, setKeywordPanelOpen] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // ── 게이트: URL ?key=... 가 없으면 안내만 ──────────────
  const urlKey = new URLSearchParams(location.search).get('key');
  if (!urlKey) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '28px 32px', maxWidth: 460, textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
          <span className="material-symbols-rounded" style={{ fontSize: 38, color: 'var(--accent-500)', marginBottom: 12, display: 'block' }}>shield_lock</span>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--neutral-900)', margin: '0 0 8px' }}>운영자 키 필요</h2>
          <p style={{ fontSize: 14, color: 'var(--fg-muted)', lineHeight: 1.6, margin: 0 }}>
            URL 끝에 <code style={{ background: 'var(--neutral-100)', padding: '1px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 12 }}>?key=YOUR_KEY</code> 를 붙여 주세요.
          </p>
        </div>
      </div>
    );
  }

  const grouped = TOPICS.map((t) => ({
    topic: t,
    items: questions.filter((q) => q.topic === t.id)
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
  })).filter((g) => g.items.length > 0);

  const allContents = questions.filter((q) => !q.is_hidden).map((q) => q.content).join('\n\n');

  const onCopy = (q) => {
    navigator.clipboard?.writeText(q.content);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Header size="lg" eventMeta={(
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 14, color: 'var(--accent-500)' }}>shield_person</span>
          <span style={{ fontWeight: 600, color: 'var(--accent-700)' }}>운영자 모드</span>
        </span>
      )} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 28px', borderBottom: '1px solid var(--border)', background: '#fff', flexWrap: 'wrap' }}>
        <CStat label="총 질문" value={questions.length} accent />
        <div style={{ width: 1, height: 32, background: 'var(--border)' }} />
        <CStat label="공개" value={questions.filter((q) => !q.is_hidden).length} />
        <div style={{ width: 1, height: 32, background: 'var(--border)' }} />
        <CStat label="숨김" value={questions.filter((q) => q.is_hidden).length} subtle />
        <div style={{ flex: 1 }} />
        <button type="button" onClick={() => setKeywordPanelOpen((v) => !v)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            background: keywordPanelOpen ? 'var(--primary-50)' : '#fff',
            color: keywordPanelOpen ? 'var(--primary-700)' : 'var(--neutral-900)',
            border: `1px solid ${keywordPanelOpen ? 'var(--primary-300)' : 'var(--border)'}`,
            borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer',
          }}>
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>
            {keywordPanelOpen ? 'visibility_off' : 'visibility'}
          </span>
          {keywordPanelOpen ? '키워드 패널 접기' : '키워드 패널 열기'}
        </button>
      </div>

      <div style={{ flex: 1, padding: '20px 28px 32px' }}>
        {keywordPanelOpen && (
          <section style={{
            background: '#fff', border: '1px solid var(--border)', borderRadius: 12,
            padding: '18px 20px', marginBottom: 24, borderLeft: '4px solid var(--primary-500)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 18, color: 'var(--primary-700)' }}>summarize</span>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--neutral-900)', margin: 0, letterSpacing: '-0.01em' }}>
                세션 키워드 추출 · 본문 모음
              </h2>
              <span style={{ fontSize: 11.5, color: 'var(--fg-subtle)', marginLeft: 4 }}>
                공개 {questions.filter((q) => !q.is_hidden).length}건 본문 통합
              </span>
              <div style={{ flex: 1 }} />
              <button onClick={() => navigator.clipboard?.writeText(allContents)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px',
                  background: 'var(--neutral-100)', color: 'var(--neutral-900)',
                  border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, fontWeight: 500,
                  fontFamily: 'var(--font-sans)', cursor: 'pointer',
                }}>
                <span className="material-symbols-rounded" style={{ fontSize: 14 }}>content_copy</span>
                전체 복사
              </button>
            </div>
            <div style={{
              background: 'var(--neutral-50)', border: '1px solid var(--border)', borderRadius: 8,
              padding: '14px 16px', fontSize: 13, lineHeight: 1.7, color: 'var(--fg-muted)',
              maxHeight: 200, overflowY: 'auto', fontFamily: 'var(--font-sans)', whiteSpace: 'pre-wrap',
            }}>
              {allContents || '아직 공개 질문이 없습니다.'}
            </div>
          </section>
        )}

        {grouped.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--fg-subtle)' }}>
            <span className="material-symbols-rounded" style={{ fontSize: 48, color: 'var(--neutral-300)', display: 'block', marginBottom: 12 }}>inbox</span>
            <div style={{ fontSize: 15, color: 'var(--fg-muted)' }}>아직 접수된 질문이 없습니다.</div>
          </div>
        )}

        {grouped.map((g) => (
          <section key={g.topic.id} style={{ marginBottom: 32 }}>
            <header style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
              paddingBottom: 10, borderBottom: '1px solid var(--border)', flexWrap: 'wrap',
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: 8,
                background: g.topic.chipBg, color: g.topic.chipFg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: 17, fontVariationSettings: '"FILL" 1' }}>
                  {g.topic.icon}
                </span>
              </span>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--neutral-900)', margin: 0, letterSpacing: '-0.01em' }}>
                {g.topic.label}
              </h3>
              {g.topic.speaker && (
                <span style={{ fontSize: 13, color: 'var(--fg-subtle)' }}>· {g.topic.speaker}</span>
              )}
              <span style={{
                marginLeft: 'auto', fontSize: 12, fontWeight: 600,
                padding: '3px 10px', background: 'var(--neutral-100)', color: 'var(--fg-muted)',
                borderRadius: 999, fontVariantNumeric: 'tabular-nums',
              }}>{g.items.length}건</span>
            </header>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
              {g.items.map((q) => (
                <AdminCard key={q.id} q={q}
                           onToggleHidden={() => toggleHidden(q.id)}
                           onCopy={() => onCopy(q)}
                           copied={copiedId === q.id} />
              ))}
            </div>
          </section>
        ))}
      </div>
      <Toast />
      <ConnectionStatus />
    </div>
  );
}

function CStat({ label, value, accent, subtle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
      <span style={{
        fontSize: 28, fontWeight: 700,
        color: accent ? 'var(--primary-700)' : subtle ? 'var(--neutral-300)' : 'var(--neutral-900)',
        letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', lineHeight: 1,
      }}>{value}</span>
      <span style={{ fontSize: 12, color: 'var(--fg-subtle)' }}>{label}</span>
    </div>
  );
}

function AdminCard({ q, onToggleHidden, onCopy, copied }) {
  return (
    <article style={{
      background: q.is_hidden ? 'var(--neutral-100)' : '#fff',
      border: '1px solid var(--border)', borderRadius: 10,
      padding: '14px 16px 12px', opacity: q.is_hidden ? 0.7 : 1,
      position: 'relative', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: 'var(--fg-subtle)', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
          {formatHM(q.created_at)} · {formatRelative(q.created_at)}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          <IconBtn label={copied ? '복사됨' : '복사'}
                   icon={copied ? 'check' : 'content_copy'}
                   onClick={onCopy} tone={copied ? 'success' : 'default'} />
          <IconBtn label={q.is_hidden ? '공개' : '숨김'}
                   icon={q.is_hidden ? 'visibility' : 'visibility_off'}
                   onClick={onToggleHidden}
                   tone={q.is_hidden ? 'default' : 'warning'} />
        </div>
      </div>
      <p style={{
        fontSize: 14, lineHeight: 1.55,
        color: q.is_hidden ? 'var(--fg-muted)' : 'var(--neutral-900)',
        margin: 0, marginBottom: 12, letterSpacing: '-0.005em',
        textDecoration: q.is_hidden ? 'line-through' : 'none',
      }}>{q.content}</p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
        <div style={{ color: 'var(--fg-muted)' }}>
          <span style={{ fontWeight: 600, color: 'var(--neutral-900)' }}>{q.name}</span>
          <span style={{ color: 'var(--fg-subtle)', marginLeft: 5 }}>({q.affiliation})</span>
        </div>
        {q.is_hidden && (
          <span style={{
            padding: '2px 7px', background: 'var(--neutral-700)', color: '#fff',
            fontSize: 10, fontWeight: 600, borderRadius: 999, letterSpacing: '0.02em',
          }}>보드 비공개</span>
        )}
      </div>
    </article>
  );
}

function IconBtn({ icon, label, onClick, tone = 'default' }) {
  const tones = {
    default: { bg: 'var(--neutral-100)', fg: 'var(--neutral-900)', border: 'var(--border)' },
    success: { bg: 'var(--primary-50)',  fg: 'var(--primary-700)',  border: 'var(--primary-300)' },
    warning: { bg: 'var(--accent-50)',   fg: 'var(--accent-700)',   border: 'var(--accent-300)' },
  };
  const c = tones[tone];
  return (
    <button type="button" onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 9px', background: c.bg, color: c.fg,
      border: `1px solid ${c.border}`, borderRadius: 6,
      fontSize: 11.5, fontWeight: 600, fontFamily: 'var(--font-sans)',
      cursor: 'pointer', letterSpacing: '-0.005em',
      transition: 'all 120ms var(--ease-out)',
    }}>
      <span className="material-symbols-rounded" style={{ fontSize: 14 }}>{icon}</span>
      {label}
    </button>
  );
}

window.ScreenC = ScreenC;
