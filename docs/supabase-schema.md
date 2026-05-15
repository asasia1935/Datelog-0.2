# Supabase 스키마 설계

## 개요

DateLog v1은 Supabase Auth, Postgres, Storage를 사용합니다. 인증 계정은 Supabase Auth의 `auth.users`를 사용하고, 서비스에서 필요한 사용자 정보는 `public.profiles`에 저장합니다.

데이트 기록 데이터는 `couple_id` 기준으로 분리합니다. 사용자는 자신이 속한 커플의 데이터만 접근할 수 있어야 합니다.

## 테이블 목록

- `profiles`
- `couples`
- `couple_members`
- `couple_invites`
- `date_logs`
- `log_photos`

## profiles

서비스 사용자 프로필을 저장합니다.

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `uuid` | `auth.users.id`와 동일한 사용자 ID입니다. |
| `display_name` | `text` | 서비스에서 표시할 이름입니다. |
| `created_at` | `timestamptz` | 프로필 생성 시각입니다. |
| `updated_at` | `timestamptz` | 프로필 수정 시각입니다. |

제약 조건:

- `id`는 Primary Key입니다.
- `id`는 `auth.users.id`를 참조합니다.
- 한 인증 계정은 하나의 프로필만 가집니다.

## couples

커플 단위 정보를 저장합니다.

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `uuid` | 커플 ID입니다. |
| `name` | `text` | 커플 이름 또는 캘린더 제목입니다. |
| `created_by` | `uuid` | 커플을 생성한 사용자 ID입니다. |
| `created_at` | `timestamptz` | 커플 생성 시각입니다. |
| `updated_at` | `timestamptz` | 커플 수정 시각입니다. |

제약 조건:

- `id`는 Primary Key입니다.
- `created_by`는 `auth.users.id`를 참조합니다.

## couple_members

사용자와 커플의 멤버십을 저장합니다.

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `uuid` | 멤버십 row ID입니다. |
| `couple_id` | `uuid` | 참여 중인 커플 ID입니다. |
| `user_id` | `uuid` | 참여 사용자 ID입니다. |
| `role` | `text` | `owner` 또는 `member`입니다. |
| `joined_at` | `timestamptz` | 참여 시각입니다. |

제약 조건:

- `id`는 Primary Key입니다.
- `couple_id`는 `couples.id`를 참조합니다.
- `user_id`는 `auth.users.id`를 참조합니다.
- `user_id`에는 unique 제약을 둡니다. v1에서는 한 사용자가 하나의 커플만 참여할 수 있기 때문입니다.
- `(couple_id, user_id)`에는 unique 제약을 둡니다.
- 애플리케이션 또는 DB 레벨에서 커플당 최대 2명 제한을 보장해야 합니다.

## couple_invites

커플 초대코드를 저장합니다.

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `uuid` | 초대 row ID입니다. |
| `couple_id` | `uuid` | 초대 대상 커플 ID입니다. |
| `code` | `text` | 초대코드입니다. |
| `created_by` | `uuid` | 초대코드를 만든 사용자 ID입니다. |
| `expires_at` | `timestamptz` | 만료 시각입니다. |
| `used_at` | `timestamptz` | 사용 시각입니다. |
| `created_at` | `timestamptz` | 생성 시각입니다. |

제약 조건:

- `id`는 Primary Key입니다.
- `couple_id`는 `couples.id`를 참조합니다.
- `created_by`는 `auth.users.id`를 참조합니다.
- `code`는 unique 해야 합니다.
- v1에서는 커플당 활성 초대코드를 하나만 유지하는 방식이 권장됩니다.

## date_logs

데이트 기록 본문을 저장합니다.

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `uuid` | 기록 ID입니다. |
| `couple_id` | `uuid` | 기록이 속한 커플 ID입니다. |
| `log_date` | `date` | 데이트 날짜입니다. |
| `title` | `text` | 기록 제목입니다. |
| `content` | `text` | 기록 본문입니다. |
| `rating_user_1` | `int` | 첫 번째 사용자 만족도입니다. |
| `rating_user_2` | `int` | 두 번째 사용자 만족도입니다. |
| `created_by` | `uuid` | 기록을 작성한 사용자 ID입니다. |
| `created_at` | `timestamptz` | 생성 시각입니다. |
| `updated_at` | `timestamptz` | 수정 시각입니다. |

제약 조건:

- `id`는 Primary Key입니다.
- `couple_id`는 `couples.id`를 참조합니다.
- `created_by`는 `auth.users.id`를 참조합니다.
- `rating_user_1`, `rating_user_2`는 1부터 5 사이 값으로 제한하는 것이 권장됩니다.
- 모든 조회/작성/수정/삭제는 사용자가 해당 `couple_id`의 멤버일 때만 허용해야 합니다.

## log_photos

데이트 기록에 연결된 사진 메타데이터를 저장합니다.

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `uuid` | 사진 row ID입니다. |
| `couple_id` | `uuid` | 사진이 속한 커플 ID입니다. |
| `log_id` | `uuid` | 연결된 데이트 기록 ID입니다. |
| `storage_path` | `text` | Supabase Storage 경로입니다. |
| `caption` | `text` | 사진 설명입니다. |
| `sort_order` | `int` | 기록 내 사진 정렬 순서입니다. |
| `created_by` | `uuid` | 업로드한 사용자 ID입니다. |
| `created_at` | `timestamptz` | 생성 시각입니다. |

제약 조건:

- `id`는 Primary Key입니다.
- `couple_id`는 `couples.id`를 참조합니다.
- `log_id`는 `date_logs.id`를 참조합니다.
- `created_by`는 `auth.users.id`를 참조합니다.
- 기록당 최대 3장 제한을 적용해야 합니다.
- `storage_path`는 다음 형식을 사용합니다.

```text
couples/{coupleId}/logs/{logId}/{fileName}
```

## Storage 버킷

사진 파일은 Supabase Storage에 저장합니다. 버킷 이름은 예를 들어 `date-log-photos`로 둘 수 있습니다.

Storage path는 커플과 기록 기준으로 분리합니다.

```text
couples/{coupleId}/logs/{logId}/{fileName}
```

이 경로는 RLS 또는 Storage 정책에서 `coupleId`를 추출해 사용자가 해당 커플 멤버인지 확인하는 기준으로 사용합니다.
