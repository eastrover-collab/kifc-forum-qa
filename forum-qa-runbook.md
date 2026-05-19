# 현장 질문 보드 운영 가이드북

(사)식량과기후 행사용 실시간 Q&A 시스템 운영·재사용 매뉴얼.
2026-05-20 창립 기념 포럼에서 처음 사용. 이후 모든 KIFC 행사에 동일 인프라 재활용.

---

## TL;DR (3분 요약)

- **3개 화면**: A 관객 모바일 폼 / B 무대 라이브 보드 / C 운영자 모드
- **백엔드**: Supabase (테이블 1개 + RPC 2개 + Realtime)
- **호스팅**: GitHub Pages (정적) + WordPress iframe wrapper
- **재사용 시 변경**: `common.js` (분과) + `config.js` (행사 메타) + QR 재생성
- **변경 후**: GitHub 에 push → 자동 재배포 (30~60초)

---

## 시스템 구성

```
관객 휴대폰 ──QR스캔──> https://www.foodandclimate.or.kr/qa/  (WP iframe wrapper)
                                  │
                                  ▼ iframe src
              https://eastrover-collab.github.io/kifc-forum-qa/  (GH Pages 정적)
                                  │
                                  ▼ supabase-js REST + Realtime websocket
              https://epxivpzuikrdbfoenytq.supabase.co/  (questions 테이블)
                                  │
                                  ▲ Realtime broadcast
              board.html · admin.html  (무대 노트북 · 운영자 단말)
```

| 레이어 | 어디 있나 | 누가 수정 |
|---|---|---|
| WP iframe wrapper | `scripts/setup_forum_qa.py` → `/qa/` | 발행 1회면 충분 |
| GH Pages 정적 앱 | `apps/forum-qa/` (이 repo) → `kifc-forum-qa` repo | 행사마다 일부 수정 |
| Supabase DB | `apps/forum-qa/supabase-schema.sql` | 최초 1회만 |

---

## 재사용 — 변경할 것 vs 그대로 둘 것

### 변경 필요 (행사마다)

| 항목 | 위치 | 예시 |
|---|---|---|
| 분과 메타 | `apps/forum-qa/js/common.js` 의 `TOPICS` | 발표자·아이콘·라벨 변경 |
| 행사 일시·장소 | `apps/forum-qa/js/config.js` 의 `EVENT_META` | "2026. 7. 15 (화) · ..." |
| QR 인코딩 URL | `apps/forum-qa/js/config.js` 의 `SUBMIT_URL` | 같은 `/qa/` 쓰면 그대로 |
| 포럼 페이지 안내 카드 | 해당 행사 페이지 `setup_*.py` 에 `section_qa_board()` 복사 | |

### 그대로 사용

| 항목 | URL/위치 |
|---|---|
| Supabase 프로젝트 | https://supabase.com/dashboard/project/epxivpzuikrdbfoenytq |
| GH Pages repo | https://github.com/eastrover-collab/kifc-forum-qa |
| WP `/qa/` 페이지 (id=1711) | https://www.foodandclimate.or.kr/qa/ |
| `ADMIN_KEY` | `kifc2026` (변경하려면 STEP 2-2 참고) |

> **언제 새로 만들지**: 동시에 두 행사가 진행되어 데이터가 섞이면 안 될 때.
> 그 외에는 같은 인프라 재사용이 정석.

---

## STEP 1 · 행사 메타 수정 (D-7)

### 1-1) 분과 6개 정의 — `common.js`

`apps/forum-qa/js/common.js` 의 `TOPICS` 배열 6개 항목 수정. **개수는 6 고정**(기조 + 4 주제 + 종합) — 늘리려면 chipBg 색·icon 추가 디자인 필요. 줄이려면 빈 자리 'general' 유지.

```js
const TOPICS = [
  { id: 'keynote',     short: '기조',   label: '기조강연',          speaker: '○○○ 이사장', ..., icon: 'campaign' },
  { id: 'topic1_xxx',  short: '쌀',     label: '제1주제 · …',      speaker: '○○○ 교수',   ..., icon: 'grass' },
  { id: 'topic2_xxx',  short: '농지',   label: '제2주제 · …',      speaker: '○○○ 박사',   ..., icon: 'terrain' },
  { id: 'topic3_xxx',  short: '에너지', label: '제3주제 · …',      speaker: '○○○ 대표',   ..., icon: 'wb_sunny' },
  { id: 'topic4_xxx',  short: '청년',   label: '제4주제 · …',      speaker: '○○○ 대표',   ..., icon: 'diversity_3' },
  { id: 'general',     short: '종합',   label: '종합·기타',         speaker: '',          ..., icon: 'forum' },
];
```

**중요**:
- `id` 변경 시 Supabase 스키마의 `check (topic in (...))` 도 같이 변경해야 INSERT 통과 (`apps/forum-qa/supabase-schema.sql`).
- 색상 토큰은 `assets/tokens.css` 의 `--primary-*` / `--accent-*` / `--secondary-*` / `--neutral-*` 6쌍 활용.
- Material Symbols 아이콘명: https://fonts.google.com/icons (filled 또는 outlined 모두 동일 이름)

### 1-2) 행사 일시·장소 — `config.js`

`apps/forum-qa/js/config.js`:
```js
EVENT_META:  "2026. 7. 15 (화) · 14:00 – 17:30 · 서울 aT센터",
SUBMIT_URL:  "https://www.foodandclimate.or.kr/qa/",      // 그대로 두면 됨
SUBMIT_URL_DISPLAY: "foodandclimate.or.kr/qa"
```

`EVENT_META` 는 보드 화면 우측 상단 + 운영자 화면에 표시. 형식 자유.

### 1-3) GitHub 에 push

방법 A — **GitHub 웹에서 직접 (간편)**:
- https://github.com/eastrover-collab/kifc-forum-qa/edit/main/js/common.js
- https://github.com/eastrover-collab/kifc-forum-qa/edit/main/js/config.js
- 각각 편집 → Commit changes → 30~60초 후 GH Pages 자동 재배포

방법 B — **로컬 git**:
```bash
git clone https://github.com/eastrover-collab/kifc-forum-qa.git /tmp/qa
cp apps/forum-qa/js/common.js /tmp/qa/js/
cp apps/forum-qa/js/config.js /tmp/qa/js/
cd /tmp/qa && git commit -am "event: 다음 행사 메타 업데이트" && git push
```

### 1-4) 검증

배포 완료되면:
- https://eastrover-collab.github.io/kifc-forum-qa/ → 분과 6개 라벨·발표자 확인
- https://eastrover-collab.github.io/kifc-forum-qa/board.html → EVENT_META 우측 상단에 표시되는지 확인

---

## STEP 2 · Supabase 점검 (D-3)

### 2-1) 기존 데이터 비우기

이전 행사 데이터가 남아있으면 운영자 화면에서 **전체 초기화** 버튼 (2단계 확인) 사용. 또는 SQL Editor 에서:
```sql
select public.admin_clear_all('kifc2026');
```

### 2-2) ADMIN_KEY 변경 (선택)

행사마다 키 돌리고 싶으면:
- https://supabase.com/dashboard/project/epxivpzuikrdbfoenytq/sql/new
- ```sql
  update public.app_settings set value = '새로운키' where key = 'admin_key';
  ```
- `apps/forum-qa/js/config.js` 의 `ADMIN_KEY` 도 같은 값으로 변경 → push

> 변경 안 해도 됨 — 공개 repo 에 들어가는 약한 비밀이고, 행사 1회용 게이트라 재사용 가능.

### 2-3) 토픽 ID 바꿨다면 스키마도

`TOPICS` 의 `id` 를 변경했다면 (예: `topic1_rice` → `topic1_grain`):
- https://supabase.com/dashboard/project/epxivpzuikrdbfoenytq/sql/new
- ```sql
  alter table public.questions drop constraint questions_topic_check;
  alter table public.questions add constraint questions_topic_check
    check (topic in ('keynote','topic1_grain','topic2_xxx','topic3_xxx','topic4_xxx','general'));
  ```

---

## STEP 3 · QR 코드 (D-2)

### 3-1) URL 그대로 (`/qa/`) 면 기존 QR 재사용

`apps/forum-qa/qa-qr-*.png` 3종 그대로 인쇄. 변경 없음.

### 3-2) URL 바꿨다면 재생성

`scripts/gen_qr.py` 가 있으면:
```bash
python scripts/gen_qr.py
```

없으면 `/tmp/gen_qr.py` 에 아래 한 번 만들고 실행 (Pillow + qrcode 필요):
```python
import qrcode
from qrcode.constants import ERROR_CORRECT_H
URL = "https://www.foodandclimate.or.kr/qa/"  # 또는 새 URL
qr = qrcode.QRCode(version=None, error_correction=ERROR_CORRECT_H, box_size=24, border=3)
qr.add_data(URL); qr.make(fit=True)
qr.make_image(fill_color=(10,61,42), back_color="white").save("apps/forum-qa/qa-qr.png")
```

또는 무료 온라인 생성기: https://www.qr-code-generator.com (단순 PNG 면 충분).

### 3-3) 인쇄

- **테이블 카드 (4인 1장)**: A5 크기, `qa-qr-print.png` 그대로
- **무대 슬라이드**: `qa-qr-branded.png` (중앙 KIFC 로고)
- **현수막**: 벡터 SVG 가 필요하면 따로 요청

---

## STEP 4 · WordPress 페이지 (D-1)

### 4-1) `/qa/` 진입점 페이지

이미 있음 (id=1711). 새로 발행할 필요 없음. 확인:
- https://www.foodandclimate.or.kr/qa/ → 폼 화면 뜨면 OK

iframe target 변경 필요 시 `scripts/setup_forum_qa.py` 의 `PAGE_TARGET_URL` 수정 후 재실행:
```bash
python scripts/setup_forum_qa.py
```

### 4-2) 새 행사 페이지에 안내 카드 끼우기

기존 패턴: `scripts/setup_inaugural_forum_2026.py` 의 `section_qa_board()` 함수 복사 → 새 행사 페이지 스크립트에 붙여넣고 `build_content()` 의 sections 리스트에 추가:
```python
def build_content() -> str:
    return "\n\n".join([
        section_hero(),
        section_overview(),
        section_why(),
        section_program(),
        section_qa_board(),    # ← 추가
        section_speakers(),
        section_cta(),
    ])
```

`section_qa_board()` 자체는 `/qa/` 만 가리키므로 행사가 바뀌어도 그대로 재사용 가능.

### 4-3) 검증

- 새 행사 페이지 발행 후 브라우저로 열어서 "현장 질문 보드 — 발표 중 질문을 모바일로" 카드 확인
- 카드의 "지금 열어보기" 버튼 → `/qa/` 로 이동 확인

---

## STEP 5 · 행사 당일 (D-0)

### 5-1) 무대 노트북 (T-60분 까지)

- **Chrome** 으로 https://eastrover-collab.github.io/kifc-forum-qa/board.html 열기
- **F11** 풀스크린
- 화면 우측 상단 "실시간 연결됨" 상태 확인 (안 뜨면 새로고침)
- 발표자 PC 가 별도면 같은 URL 미러링 (백업)

### 5-2) 운영자 단말 (T-60분 까지)

- 별도 노트북/태블릿에서 https://eastrover-collab.github.io/kifc-forum-qa/admin.html?key=kifc2026
- "키워드 패널" 켜두기 (자동) → 사회자에게 실시간 키워드 공유 시 "전체 복사" 버튼

### 5-3) 리허설 (T-30분)

체크리스트:
- [ ] 자신의 휴대폰으로 QR 스캔 → 폼 진입 OK
- [ ] 더미 질문 1건 제출 → 보드에 1초 안에 등장 (강조 애니메이션 보임)
- [ ] 운영자 화면에도 같은 카드 등장
- [ ] 운영자에서 "숨김" 클릭 → 보드에서 즉시 사라짐
- [ ] "공개" 다시 클릭 → 보드에 다시 등장
- [ ] 운영자 "전체 초기화" → 빨간 경고 → 다시 클릭 → 보드 비워짐

리허설 통과하면 **마지막으로 한 번 더 "전체 초기화"** 해서 본 행사 시작.

### 5-4) 진행 중

- 부적절·중복 질문 → 운영자에서 "숨김"
- 사회자가 토론 자료로 쓰고 싶으면 운영자에서 "복사" 또는 "전체 복사"
- 종합 토론 시작 전: 보드에서 분과 필터로 해당 세션만 골라 띄우기

### 5-5) 종료 직후 (10분 안)

- **데이터 export 먼저 — 초기화 전에**:
  - https://supabase.com/dashboard/project/epxivpzuikrdbfoenytq/editor
  - `questions` 테이블 → 우상단 **Export → CSV**
- 또는 운영자 화면 "전체 복사" 텍스트 메모

### 5-6) 정리

- 데이터 백업 확인 후 운영자 모드 "전체 초기화"
- 다음 행사 때 STEP 1 부터 다시

---

## STEP 6 · 사후 (D+1 ~ D+7)

### 6-1) 보고서 데이터

- Supabase Dashboard → Table Editor → questions → Filter (created_at) → CSV
- 또는 SQL:
  ```sql
  copy (
    select created_at, topic, name, affiliation, content, is_hidden
    from public.questions
    order by created_at
  ) to stdout with csv header;
  ```

### 6-2) 회고

- 보드에 안 뜬 질문 있었나? → Realtime 연결 로그 확인 (https://supabase.com/dashboard/project/epxivpzuikrdbfoenytq/logs/realtime-logs)
- 운영자가 숨김 처리한 카드 비율?
- 분과별 질문 수 균형?

---

## 트러블슈팅

### 보드에 카드가 안 나타남

| 증상 | 점검 |
|---|---|
| 우측 상단 "연결 중..." 이 안 사라짐 | 새로고침. 그래도 안 되면 console 에 supabase 에러 확인 |
| 한 화면만 안 나옴 | 다른 화면도 같은 증상이면 Supabase 자체 문제. 그 화면만이면 새로고침 |
| Realtime 끊김 | Supabase 무료 plan 동시 연결 제한 (~200) — 행사 규모 작으면 무관 |
| 폼에서 제출 후 "전송 실패" | RLS 정책 확인. config.js 의 anon key 가 맞는지 |

### 운영자 화면이 "운영자 키 필요" 에서 안 넘어감

URL 에 `?key=kifc2026` 빠짐. 정확히:
```
https://eastrover-collab.github.io/kifc-forum-qa/admin.html?key=kifc2026
```

### 운영자에서 "권한 오류" — RPC 401

config.js 의 `ADMIN_KEY` 와 Supabase `app_settings.admin_key` 값이 다름. STEP 2-2 재확인.

### QR 스캔 시 404

`/qa/` 페이지가 발행 안 됨. `python scripts/setup_forum_qa.py` 실행.

### 화면이 깨짐 (스타일 안 입혀짐)

`tokens.css` 또는 Pretendard CDN 차단. 회사 방화벽이면 무대 노트북 Wi-Fi 를 핫스팟으로 우회.

### 진짜 비상 — Supabase 다운

- 백업: Google Form 으로 즉시 대체 (분과 6개 라디오 + 이름·소속·내용)
- 응답 시트 → 사회자가 직접 읽음

---

## 모든 링크 정리

### 라이브 사이트
| | URL |
|---|---|
| 관객 (QR 진입점) | https://www.foodandclimate.or.kr/qa/ |
| 무대 보드 | https://eastrover-collab.github.io/kifc-forum-qa/board.html |
| 운영자 모드 | https://eastrover-collab.github.io/kifc-forum-qa/admin.html?key=kifc2026 |
| GH Pages 루트 (관객용 직접 URL) | https://eastrover-collab.github.io/kifc-forum-qa/ |

### 코드 저장소
| | URL |
|---|---|
| GH Pages 앱 (배포 단위) | https://github.com/eastrover-collab/kifc-forum-qa |
| 메인 repo (이 가이드 포함) | https://github.com/eastrover-collab/wp-homepage |
| 디자인 원본 (목업) | `wp-homepage/plugin/KIFC 행사 - 질문창/` |

### 핵심 파일 편집 바로가기
| 파일 | GitHub 웹 편집 URL |
|---|---|
| 분과 정의 (`common.js`) | https://github.com/eastrover-collab/kifc-forum-qa/edit/main/js/common.js |
| 행사 메타 (`config.js`) | https://github.com/eastrover-collab/kifc-forum-qa/edit/main/js/config.js |
| 스키마 (`supabase-schema.sql`) | https://github.com/eastrover-collab/kifc-forum-qa/edit/main/supabase-schema.sql |

### Supabase 콘솔
| | URL |
|---|---|
| 프로젝트 대시보드 | https://supabase.com/dashboard/project/epxivpzuikrdbfoenytq |
| SQL Editor (새 쿼리) | https://supabase.com/dashboard/project/epxivpzuikrdbfoenytq/sql/new |
| Table Editor | https://supabase.com/dashboard/project/epxivpzuikrdbfoenytq/editor |
| API 설정 (URL/Key) | https://supabase.com/dashboard/project/epxivpzuikrdbfoenytq/settings/api |
| Realtime 로그 | https://supabase.com/dashboard/project/epxivpzuikrdbfoenytq/logs/realtime-logs |
| Auth 로그 | https://supabase.com/dashboard/project/epxivpzuikrdbfoenytq/logs/auth-logs |

### WordPress 관리
| | URL |
|---|---|
| `/qa/` 진입점 페이지 편집 | https://www.foodandclimate.or.kr/wp-admin/post.php?post=1711&action=edit |
| 페이지 목록 | https://www.foodandclimate.or.kr/wp-admin/edit.php?post_type=page |
| 미디어 라이브러리 | https://www.foodandclimate.or.kr/wp-admin/upload.php |

### 자격증명 (이 가이드 외부 공유 시 마스킹)
| | 값 |
|---|---|
| Supabase URL | `https://epxivpzuikrdbfoenytq.supabase.co` |
| Supabase Anon Key | `sb_publishable_a6UxCuluNIzQMXXJxhPiBA_oqy4eJQ3` (클라이언트 노출 전제) |
| Admin Key | `kifc2026` |

---

## 보안·운영 노트

- `ADMIN_KEY` 는 GH Pages 공개 repo 에 들어가는 약한 비밀. **실명·계좌·민감 정보 절대 금지**.
- 1회 행사용 운영자 게이트일 뿐. 상시 운영 시 Supabase Auth (이메일 매직링크) 로 교체 권장.
- 폼에 reCAPTCHA 없음 — 1회 행사 규모(< 200명) 면 무관. 100명 이상 대규모 행사면 rate limit 또는 hCaptcha 추가 검토.
- `noindex` meta + 비공개 URL → 검색엔진 노출 차단.
- 데이터 보존 정책 미정. **개인정보 (성명·소속)** 가 들어가므로 행사 후 30일 안 삭제 권장.

---

## 변경 이력

| 날짜 | 변경 | 비고 |
|---|---|---|
| 2026-05-19 | 초판 작성 | 창립 기념 포럼 직전 |
| | | |
