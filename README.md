# KIFC 현장 질문 보드 (Forum Q&A)

(사)식량과기후 창립 기념 포럼 (2026-05-20) 현장 Q&A 시스템.
React + Babel(브라우저 컴파일) + Supabase Realtime. 빌드 도구 없음.

## 3개 화면

| 화면 | URL | 용도 |
|---|---|---|
| A · 질문 작성 | `index.html` | 관객 모바일. QR 스캔 → 폼 제출 |
| B · 실시간 보드 | `board.html` | 무대 스크린. 분과 필터·라이브 카운터·QR 표시 |
| C · 운영자 모드 | `admin.html?key=<ADMIN_KEY>` | 사회자/PD. 분과별 그룹·숨김 토글·키워드 패널 |

A 에서 제출하면 Postgres `INSERT` → Realtime → B·C 즉시 갱신.

## 배포

### 1) Supabase 프로젝트

1. https://supabase.com 에서 새 프로젝트 생성 (Free tier)
2. SQL Editor → `supabase-schema.sql` 통째 붙여넣고 Run
3. 같은 SQL 안의 `'REPLACE_WITH_ADMIN_SECRET'` 를 본인 비밀값으로 교체 후 재실행, 또는:
   ```sql
   update public.app_settings set value = 'your-admin-secret' where key = 'admin_key';
   ```
4. Settings → API 에서 `Project URL` 과 `anon public` 키 복사

### 2) config.js 채우기

`js/config.js`:
```js
window.KIFC_CONFIG = {
  SUPABASE_URL:      "https://xxxxxxx.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOi...",
  ADMIN_KEY:         "your-admin-secret",         // ← supabase 의 값과 동일
  EVENT_META:        "2026. 5. 20 (수) · 14:00 – 17:30 · 수원 국립농업박물관",
  SUBMIT_URL:        "https://www.foodandclimate.or.kr/qa/",  // QR 가 인코딩할 URL
  SUBMIT_URL_DISPLAY:"foodandclimate.or.kr/qa"
};
```

### 3) GitHub Pages 배포

```bash
# 별도 저장소로 (strawberry-farm 패턴)
gh repo create eastrover-collab/kifc-forum-qa --public
cp -r apps/forum-qa /tmp/kifc-forum-qa
cd /tmp/kifc-forum-qa
git init && git add . && git commit -m "init"
git remote add origin https://github.com/eastrover-collab/kifc-forum-qa.git
git push -u origin main
# GitHub → Settings → Pages → Source: main / (root)
```

URL: `https://eastrover-collab.github.io/kifc-forum-qa/`

### 4) WordPress 진입점 (선택)

`scripts/setup_forum_qa.py` 의 `PAGE_TARGET_URL` 을 GH Pages URL 로 교체 후:
```bash
python scripts/setup_forum_qa.py
```
→ `https://www.foodandclimate.or.kr/qa/` 에 iframe wrapper 페이지 생성.
QR 코드는 이 짧은 URL 을 인코딩.

## 운영 체크리스트 (행사 당일)

- [ ] 무대 노트북에서 `board.html` 풀스크린 (F11) — Chrome 권장
- [ ] 사회자/PD 단말에서 `admin.html?key=<ADMIN_KEY>` 열기
- [ ] QR 인쇄물에 짧은 URL 같이 표기 (`foodandclimate.or.kr/qa`)
- [ ] 시작 30분 전 테스트 제출 → 보드·운영자 화면 모두 즉시 반영 확인
- [ ] 행사 종료 후 운영자 모드 "전체 복사" 버튼 → 발표자/속기록에 인계
- [ ] 다음날: Supabase Table Editor → questions 테이블 export 백업

## 보안 주의

- `anon` 키는 클라이언트 노출 전제 — RLS 로 INSERT/SELECT 만 허용
- `is_hidden` 토글은 `admin_toggle_hidden(uuid, text)` RPC 가 ADMIN_KEY 평문 비교
- 1회 행사용 모델. 상시 운영시 Supabase Auth 로 교체 권장
- `noindex` meta + GH Pages 비공개 URL → 검색 노출 차단

## 디자인 원본

`plugin/KIFC 행사 - 질문창/` (iOS 프레임 + Design Canvas 목업) 에서 추출.
프로덕션은 디자인 캔버스 chrome 제거하고 3개 화면을 직접 라우트화.
