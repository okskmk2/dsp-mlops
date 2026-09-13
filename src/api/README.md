# DSP 화면 API

각 화면이 호출해야 하는 HTTP API 계약이다. 지금 앱은 Pinia 시드로 동작하고, 이 폴더는 백엔드 연동 시 화면별로 붙일 엔드포인트의 단일 목록이다.

근거: `docs/dsp-web-spec.json` 페이지·권한, `src/stores/dsp.js` 읽기/쓰기, `src/router/index.js` 라우트.

## 읽는 법

| 파일 | 내용 |
|---|---|
| `common.json` | base path, 인증, 응답 봉투, 공통 타입, 셸(GNB) API |
| `index.json` | 화면 id → 라우트 → 정의 파일 |
| `screens/*.json` | 화면별 `endpoints` |

각 화면 파일의 `usesCommon`은 인증된 셸에서 항상 쓰는 API다. 화면 전용 호출만 `endpoints`에 적는다.

## 규칙

- prefix: `/api/v1`
- 인증: `Authorization: Bearer <token>` 또는 세션 쿠키. 데모 로그인은 `POST /session`
- 성공: `{ "ok": true, "data": ... }`
- 실패: `{ "ok": false, "error": { "code", "message" } }`
- 목록은 권한 범위가 이미 필터된 결과만 반환한다. 클라이언트가 전 건을 받아 걸러내지 않는다.
- 모바일 전용 API 없음. 학습/클러스터 설계 API 없음.
- 전자결재 승인/반려는 `approver`만. 그 외 쓰기는 `permissionMatrix`를 따른다.

## 화면 추가 시

1. `screens/<name>.json`에 화면과 엔드포인트를 적는다.
2. `index.json` `screens`에 `{ id, route, file }`을 추가한다.
