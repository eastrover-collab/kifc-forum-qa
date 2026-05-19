-- KIFC 창립 기념 포럼 · 현장 질문 보드 · Supabase 스키마
-- 적용: Supabase Dashboard → SQL Editor → 통째 붙여넣고 Run.
--
-- 보안 모델
--   - questions 테이블: 익명 INSERT/SELECT 허용 (행사 1회용, 진입장벽 X)
--   - is_hidden 토글: admin_toggle_hidden(uuid, text) RPC 만 변경 가능
--     · ADMIN_KEY 평문 비교 (1회성 행사 — 충분)
--     · ADMIN_KEY 는 ALTER 로 DB 에 저장 (config.js 의 값과 동일해야 함)

-- ── 1. 테이블 ─────────────────────────────────────────────────
create table if not exists public.questions (
  id           uuid          primary key default gen_random_uuid(),
  topic        text          not null check (topic in (
                                'keynote','topic1_rice','topic2_land',
                                'topic3_solar','topic4_youth','general')),
  name         text          not null check (char_length(name) between 1 and 8),
  affiliation  text          not null check (char_length(affiliation) between 1 and 40),
  content      text          not null check (char_length(content) between 1 and 200),
  is_hidden    boolean       not null default false,
  created_at   timestamptz   not null default now()
);

create index if not exists questions_created_at_idx
  on public.questions (created_at desc);

-- ── 2. Realtime 활성화 ────────────────────────────────────────
alter publication supabase_realtime add table public.questions;

-- ── 3. RLS ───────────────────────────────────────────────────
alter table public.questions enable row level security;

-- 모든 anon 사용자 SELECT (is_hidden 포함 — 운영자 화면 C 가 숨김 카드도 봐야 함)
drop policy if exists qna_anon_select on public.questions;
create policy qna_anon_select on public.questions
  for select to anon using (true);

-- 모든 anon 사용자 INSERT (관객 질문 제출)
drop policy if exists qna_anon_insert on public.questions;
create policy qna_anon_insert on public.questions
  for insert to anon
  with check (
    char_length(name) between 1 and 8
    and char_length(affiliation) between 1 and 40
    and char_length(content) between 1 and 200
  );

-- UPDATE / DELETE 직접 차단 — 오직 admin RPC 만 사용 (SECURITY DEFINER)
-- (anon 에 update 권한 안 줌)

-- ── 4. Admin RPC ─────────────────────────────────────────────
-- ADMIN_KEY 는 app_settings.admin_key 행에 저장. config.js 값과 일치 필요.
create table if not exists public.app_settings (
  key   text primary key,
  value text not null
);

-- 초기 ADMIN_KEY 설정 — 배포 전 본인 값으로 교체
insert into public.app_settings (key, value)
  values ('admin_key', 'REPLACE_WITH_ADMIN_SECRET')
  on conflict (key) do nothing;

create or replace function public.admin_toggle_hidden(
  q_id uuid,
  admin_key text
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  stored_key text;
begin
  select value into stored_key from public.app_settings where key = 'admin_key';
  if stored_key is null or admin_key <> stored_key then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  update public.questions
     set is_hidden = not is_hidden
   where id = q_id;
  return true;
end
$$;

grant execute on function public.admin_toggle_hidden(uuid, text) to anon;

-- 전체 초기화 RPC — 운영자 키 검증 후 questions 전부 삭제
create or replace function public.admin_clear_all(admin_key text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  stored_key text;
  deleted    integer;
begin
  select value into stored_key from public.app_settings where key = 'admin_key';
  if stored_key is null or admin_key <> stored_key then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  with d as (delete from public.questions where true returning 1)
  select count(*) into deleted from d;
  return deleted;
end
$$;

grant execute on function public.admin_clear_all(text) to anon;

-- app_settings 는 anon 접근 차단 (admin_key 노출 방지)
alter table public.app_settings enable row level security;
-- (정책 안 만들면 anon SELECT 도 차단됨)

-- ── 5. 헬스체크 (배포 후 확인용) ─────────────────────────────
-- select count(*) from public.questions;  -- 0 이어야 함
-- select id from public.app_settings where key = 'admin_key';  -- 1 row
