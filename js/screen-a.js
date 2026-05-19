// screen-a.js — 화면 A · 관객 모바일 질문 작성

function ScreenA() {
  const { submit } = useStore();
  const [affiliation, setAffiliation] = useState('');
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!affiliation.trim()) e.affiliation = '소속을 입력해 주세요.';
    if (!name.trim()) e.name = '성명을 입력해 주세요.';
    else if (name.length > 8) e.name = '성명은 8자 이내로 입력해 주세요.';
    if (!topic) e.topic = '분과를 선택해 주세요.';
    if (!content.trim()) e.content = '질문 내용을 입력해 주세요.';
    else if (content.length > 200) e.content = '200자 이내로 입력해 주세요.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const r = await submit({ affiliation, name, topic, content });
    if (r.ok) {
      setAffiliation(''); setName(''); setTopic(''); setContent('');
      setErrors({});
    }
    setSubmitting(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', maxWidth: 560, margin: '0 auto', position: 'relative' }}>
      <Header size="md" />

      <div style={{ flex: 1, padding: '20px 16px 40px' }}>
        {/* Hero card */}
        <div style={{
          background: 'linear-gradient(155deg, #0A3D2A 0%, #0F6B41 100%)',
          color: '#fff', borderRadius: 14, padding: '20px 18px',
          marginBottom: 24, position: 'relative', overflow: 'hidden',
        }}>
          <span className="material-symbols-rounded" style={{
            position: 'absolute', right: -8, bottom: -10,
            fontSize: 110, color: 'rgba(255,255,255,0.06)',
            fontVariationSettings: '"FILL" 1',
          }}>eco</span>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--primary-300)', marginBottom: 6 }}>
            Q &amp; A · Open Floor
          </div>
          <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.35, letterSpacing: '-0.015em', position: 'relative' }}>
            깊이 듣고 싶은 질문을<br />남겨 주세요.
          </div>
          <div style={{ fontSize: 12.5, lineHeight: 1.55, marginTop: 10, color: 'rgba(255,255,255,0.78)', position: 'relative' }}>
            네 개 발표 중 더 깊이 듣고 싶은 질문을 남겨 주세요. 오픈 플로어 토론에서 다룹니다.
          </div>
        </div>

        <Field label="소속" required error={errors.affiliation}>
          <input type="text" value={affiliation}
                 onChange={(e) => setAffiliation(e.target.value)}
                 placeholder="예) 식량과기후, 농민단체, 학생, 언론"
                 aria-invalid={!!errors.affiliation}
                 style={inputStyle(!!errors.affiliation)} />
        </Field>

        <Field label="성명" required error={errors.name} hint="8자 이내 · 익명 희망 시 '익명' 입력">
          <input type="text" value={name} maxLength={8}
                 onChange={(e) => setName(e.target.value)}
                 placeholder="예) 남재작"
                 aria-invalid={!!errors.name}
                 style={inputStyle(!!errors.name)} />
        </Field>

        <Field label="분과 선택" required error={errors.topic}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
            {TOPICS.map((t) => {
              const active = topic === t.id;
              return (
                <button key={t.id} type="button" onClick={() => setTopic(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px',
                    background: active ? t.softBg : '#fff',
                    border: active ? '1.5px solid var(--primary-700)' : '1px solid var(--border)',
                    borderRadius: 10, cursor: 'pointer',
                    fontFamily: 'var(--font-sans)', textAlign: 'left', width: '100%',
                    minHeight: 56, transition: 'all 140ms var(--ease-out)', position: 'relative',
                  }}>
                  <span style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: t.chipBg, color: t.chipFg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 18, fontVariationSettings: '"FILL" 1' }}>
                      {t.icon}
                    </span>
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--neutral-900)', letterSpacing: '-0.01em' }}>
                      {t.label}
                    </div>
                    {t.speaker && (
                      <div style={{ fontSize: 12, color: 'var(--fg-subtle)', marginTop: 2 }}>
                        {t.speaker}
                      </div>
                    )}
                  </div>
                  <span className="material-symbols-rounded" style={{
                    fontSize: 22,
                    color: active ? 'var(--primary-700)' : 'var(--neutral-300)',
                    fontVariationSettings: active ? '"FILL" 1' : '"FILL" 0',
                  }}>
                    {active ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="질문 내용" required error={errors.content} counter={`${content.length} / 200`}>
          <textarea value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 200))}
            placeholder="예) 쌀 의무수입량을 줄이려면 무엇이 먼저 바뀌어야 하나요?"
            rows={5} aria-invalid={!!errors.content}
            style={{ ...inputStyle(!!errors.content), minHeight: 120, height: 'auto', padding: '12px 14px',
                     resize: 'none', lineHeight: 1.6, fontFamily: 'var(--font-sans)' }} />
        </Field>

        <button type="button" onClick={onSubmit} disabled={submitting}
          style={{
            marginTop: 20, width: '100%', height: 52, borderRadius: 12, border: 'none',
            background: submitting ? 'var(--primary-700)' : 'var(--primary-500)',
            color: '#fff', fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-sans)',
            letterSpacing: '-0.01em', cursor: submitting ? 'wait' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'background 140ms var(--ease-out)',
            boxShadow: '0 2px 8px rgba(15, 107, 65, 0.18)',
          }}>
          {submitting ? <Spinner /> : (
            <>
              질문 보내기
              <span className="material-symbols-rounded" style={{ fontSize: 20 }}>arrow_forward</span>
            </>
          )}
        </button>

        <div style={{ marginTop: 16, padding: '14px 16px', background: 'var(--neutral-100)', borderRadius: 10, fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.55 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: '-2px', marginRight: 6, color: 'var(--primary-700)' }}>info</span>
          제출하신 질문은 무대 스크린에 실시간으로 표시되며, 운영자가 토론용으로 선별합니다.
        </div>
      </div>

      <Toast />
      <ConnectionStatus />
    </div>
  );
}

function Field({ label, required, error, hint, counter, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--neutral-900)', letterSpacing: '-0.01em' }}>
          {label}
          {required && <span style={{ color: 'var(--error)', marginLeft: 4 }}>*</span>}
        </label>
        {counter && (
          <span style={{ fontSize: 11, color: 'var(--fg-subtle)', fontVariantNumeric: 'tabular-nums' }}>
            {counter}
          </span>
        )}
      </div>
      {children}
      {error ? (
        <div style={{ fontSize: 12, color: 'var(--error)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 14 }}>error</span>
          {error}
        </div>
      ) : hint ? (
        <div style={{ fontSize: 11.5, color: 'var(--fg-subtle)', marginTop: 6 }}>{hint}</div>
      ) : null}
    </div>
  );
}

function inputStyle(hasError) {
  return {
    width: '100%', height: 48, padding: '0 14px',
    background: '#fff',
    border: `1px solid ${hasError ? 'var(--error)' : 'var(--border)'}`,
    borderRadius: 10, fontSize: 15, fontFamily: 'var(--font-sans)',
    color: 'var(--neutral-900)', outline: 'none', boxSizing: 'border-box',
    letterSpacing: '-0.005em',
    transition: 'border-color 140ms var(--ease-out), box-shadow 140ms var(--ease-out)',
  };
}

window.ScreenA = ScreenA;
