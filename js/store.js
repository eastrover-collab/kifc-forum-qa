// store.js — Supabase 클라이언트 + 질문 store (React Context) + Realtime 구독
// 화면 A/B/C 가 모두 사용. config.js 가 먼저 로드되어야 함.

const SB = (() => {
  const cfg = window.KIFC_CONFIG || {};
  if (!window.supabase) {
    console.error('[KIFC] supabase-js 미로드');
    return null;
  }
  if (!cfg.SUPABASE_URL || cfg.SUPABASE_URL.includes('YOUR-PROJECT')) {
    console.error('[KIFC] config.js 의 SUPABASE_URL 미설정');
    return null;
  }
  return window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
    realtime: { params: { eventsPerSecond: 10 } },
  });
})();

const Store = React.createContext(null);

function useStore() {
  return React.useContext(Store);
}

function StoreProvider({ children }) {
  const [questions, setQuestions] = React.useState([]);
  const [recentlyAdded, setRecentlyAdded] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const [connected, setConnected] = React.useState(false);
  const [error, setError] = React.useState(null);

  // ── 초기 로드 + Realtime 구독 ───────────────────────────
  React.useEffect(() => {
    if (!SB) {
      setError('Supabase 미설정 — config.js 확인');
      return;
    }
    let mounted = true;

    (async () => {
      const { data, error: e } = await SB
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });
      if (!mounted) return;
      if (e) {
        setError(e.message);
      } else {
        setQuestions(data || []);
      }
    })();

    const channel = SB
      .channel('questions-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'questions' },
        (payload) => {
          const q = payload.new;
          setQuestions((prev) => {
            if (prev.find((x) => x.id === q.id)) return prev;
            return [q, ...prev];
          });
          setRecentlyAdded(q.id);
          setTimeout(() => setRecentlyAdded(null), 1400);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'questions' },
        (payload) => {
          const q = payload.new;
          setQuestions((prev) =>
            prev.map((x) => (x.id === q.id ? { ...x, ...q } : x))
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'questions' },
        (payload) => {
          setQuestions((prev) => prev.filter((x) => x.id !== payload.old.id));
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    return () => {
      mounted = false;
      SB.removeChannel(channel);
    };
  }, []);

  // ── 질문 제출 (화면 A) ─────────────────────────────────
  const submit = async (q) => {
    if (!SB) {
      setToast({ kind: 'error', text: '서버 연결 실패' });
      setTimeout(() => setToast(null), 2500);
      return { ok: false };
    }
    const { error: e } = await SB.from('questions').insert([{
      topic: q.topic,
      name: q.name.trim(),
      affiliation: q.affiliation.trim(),
      content: q.content.trim(),
    }]);
    if (e) {
      setToast({ kind: 'error', text: '전송 실패: ' + e.message });
      setTimeout(() => setToast(null), 3000);
      return { ok: false, error: e };
    }
    setToast({ kind: 'success', text: '접수되었습니다. 감사합니다.' });
    setTimeout(() => setToast(null), 2500);
    return { ok: true };
  };

  // ── 운영자: is_hidden 토글 (화면 C) ────────────────────
  const toggleHidden = async (id) => {
    if (!SB) return;
    const cfg = window.KIFC_CONFIG || {};
    const urlKey = new URLSearchParams(location.search).get('key');
    const adminKey = urlKey || cfg.ADMIN_KEY;
    const { error: e } = await SB.rpc('admin_toggle_hidden', {
      q_id: id,
      admin_key: adminKey,
    });
    if (e) {
      setToast({ kind: 'error', text: '권한 오류: ' + e.message });
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    React.createElement(Store.Provider, {
      value: { questions, submit, toggleHidden, recentlyAdded, toast, setToast, connected, error },
    }, children)
  );
}

Object.assign(window, { Store, useStore, StoreProvider });
