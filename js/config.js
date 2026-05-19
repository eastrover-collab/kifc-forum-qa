// config.js — 배포 전 채워 넣는 환경 설정
// GH Pages 정적 호스팅이므로 anon-key 만 노출. is_hidden 토글은 ADMIN_KEY 로 게이트.
// Supabase Dashboard → Settings → API 에서 URL/anon key 복사.
window.KIFC_CONFIG = {
  SUPABASE_URL:      "https://epxivpzuikrdbfoenytq.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_a6UxCuluNIzQMXXJxhPiBA_oqy4eJQ3",
  // 운영자 모드 URL: /admin.html?key=<ADMIN_KEY>
  // supabase-schema.sql 의 admin_toggle_hidden RPC 가 같은 값을 체크함.
  ADMIN_KEY:         "kifc2026",
  // 행사 메타 — 화면 B 우측 상단에 표시
  EVENT_META:        "2026. 5. 20 (수) · 14:00 – 17:30 · 수원 국립농업박물관",
  // QR 코드가 실제로 인코딩할 URL (관객 모바일 진입점)
  SUBMIT_URL:         "https://www.foodandclimate.or.kr/qa/",
  // QR 옆에 같이 보여줄 짧은 표시 텍스트
  SUBMIT_URL_DISPLAY: "foodandclimate.or.kr/qa"
};
