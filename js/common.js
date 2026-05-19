// common.js — 공통 컴포넌트 + 상수. 화면 A/B/C 모두 사용.

const { useState, useEffect, useMemo, useRef } = React;

// ── 분과 메타 (포럼 5개 세션 + 종합) ─────────────────────────
const TOPICS = [
  { id: 'keynote',     short: '기조',    label: '기조강연',          speaker: '김홍상 이사장', chipBg: 'var(--primary-900)',   chipFg: '#fff', softBg: '#E8EFE9',           softFg: 'var(--primary-900)', icon: 'campaign' },
  { id: 'topic1_rice', short: '쌀',      label: '제1주제 · 쌀 시장', speaker: '진중현 교수',  chipBg: 'var(--accent-500)',    chipFg: '#fff', softBg: 'var(--accent-50)',  softFg: 'var(--accent-700)',  icon: 'grass' },
  { id: 'topic2_land', short: '농지',    label: '제2주제 · 농지제도',speaker: '이주량 박사',  chipBg: 'var(--neutral-700)',   chipFg: '#fff', softBg: '#EFECE2',           softFg: 'var(--neutral-900)', icon: 'terrain' },
  { id: 'topic3_solar',short: '태양광',  label: '제3주제 · 영농형 태양광', speaker: '윤성 대표',   chipBg: 'var(--secondary-500)', chipFg: '#fff', softBg: 'var(--secondary-50)',softFg: 'var(--secondary-700)',icon: 'wb_sunny' },
  { id: 'topic4_youth',short: '청년',    label: '제4주제 · 청년·일자리', speaker: '남재작 대표', chipBg: 'var(--primary-500)',   chipFg: '#fff', softBg: 'var(--primary-50)', softFg: 'var(--primary-700)', icon: 'diversity_3' },
  { id: 'general',     short: '종합',    label: '종합·기타',          speaker: '',           chipBg: 'var(--neutral-300)',   chipFg: 'var(--neutral-900)', softBg: 'var(--neutral-100)', softFg: 'var(--neutral-700)', icon: 'forum' },
];
const TOPIC_BY_ID = Object.fromEntries(TOPICS.map((t) => [t.id, t]));

// ── 시간 헬퍼 ──────────────────────────────────────────────
function formatHM(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
}
function formatRelative(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return '방금';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return formatHM(iso);
}

// ── TopicChip ─────────────────────────────────────────────
function TopicChip({ topic, size = 'md' }) {
  const t = TOPIC_BY_ID[topic];
  const sizes = {
    sm: { fontSize: 11, padding: '3px 8px',  iconSize: 13, gap: 4, weight: 600 },
    md: { fontSize: 12, padding: '5px 10px', iconSize: 15, gap: 5, weight: 600 },
    lg: { fontSize: 14, padding: '6px 14px', iconSize: 18, gap: 6, weight: 600 },
  };
  const s = sizes[size];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: s.gap, padding: s.padding,
      background: t.chipBg, color: t.chipFg, borderRadius: 999,
      fontSize: s.fontSize, fontWeight: s.weight,
      letterSpacing: '-0.01em', lineHeight: 1, whiteSpace: 'nowrap',
    }}>
      <span className="material-symbols-rounded" style={{ fontSize: s.iconSize, fontVariationSettings: '"FILL" 1' }}>
        {t.icon}
      </span>
      {t.short}
    </span>
  );
}

// ── Header ────────────────────────────────────────────────
function Header({ size = 'md', subtitle, eventMeta }) {
  const isLg = size === 'lg';
  return (
    <header style={{
      display: 'flex', alignItems: 'center',
      gap: isLg ? 20 : 12, padding: isLg ? '20px 32px' : '14px 16px',
      background: 'rgba(250, 249, 245, 0.92)',
      backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 5,
    }}>
      <img src="assets/logo-color.png" alt="KIFC 식량과기후"
           style={{ height: isLg ? 44 : 32, width: 'auto', display: 'block' }} />
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
        <div style={{
          fontSize: isLg ? 18 : 13, fontWeight: 600,
          color: 'var(--neutral-900)', letterSpacing: '-0.01em',
          lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          (사)식량과기후 창립 기념 포럼 · 현장 질문 보드
        </div>
        {subtitle && (
          <div style={{ fontSize: isLg ? 13 : 11, color: 'var(--fg-subtle)', marginTop: 2 }}>
            {subtitle}
          </div>
        )}
      </div>
      {eventMeta && (
        <div style={{
          fontSize: isLg ? 13 : 11, color: 'var(--fg-subtle)',
          textAlign: 'right', whiteSpace: 'nowrap',
        }}>
          {eventMeta}
        </div>
      )}
    </header>
  );
}

// ── Toast ─────────────────────────────────────────────────
function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  const isErr = toast.kind === 'error';
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      background: isErr ? 'var(--error)' : 'var(--primary-900)',
      color: '#fff', padding: '12px 20px', borderRadius: 10,
      fontSize: 14, fontWeight: 500,
      boxShadow: '0 8px 24px rgba(10, 61, 42, 0.3)',
      display: 'flex', alignItems: 'center', gap: 8, zIndex: 100,
      animation: 'kifcToastIn 220ms cubic-bezier(0.22, 0.61, 0.36, 1)',
    }}>
      <span className="material-symbols-rounded"
            style={{ fontSize: 18, color: isErr ? '#fff' : 'var(--primary-300)' }}>
        {isErr ? 'error' : 'check_circle'}
      </span>
      {toast.text}
    </div>
  );
}

function Spinner() {
  return (
    <span style={{
      width: 18, height: 18, borderRadius: 999,
      border: '2px solid rgba(255,255,255,0.35)',
      borderTopColor: '#fff',
      animation: 'kifcSpin 700ms linear infinite',
    }} />
  );
}

// ── 연결 상태 표시 (모든 화면) ────────────────────────────
function ConnectionStatus() {
  const { connected, error } = useStore();
  if (error) {
    return (
      <div style={{
        position: 'fixed', top: 8, right: 12, zIndex: 200,
        fontSize: 11, color: 'var(--error)', background: '#fff',
        padding: '4px 10px', borderRadius: 999, border: '1px solid var(--error)',
        display: 'inline-flex', alignItems: 'center', gap: 5,
      }}>
        <span className="material-symbols-rounded" style={{ fontSize: 13 }}>error</span>
        {error}
      </div>
    );
  }
  return null;  // 정상이면 표시 안 함 (LivePulse 가 보드에서 따로 보여줌)
}

Object.assign(window, {
  TOPICS, TOPIC_BY_ID, formatHM, formatRelative,
  TopicChip, Header, Toast, Spinner, ConnectionStatus,
});
