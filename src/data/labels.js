export const projectStatus = {
  draft: '임시저장',
  pending_approval: '결재 대기',
  active: '운영중',
  closed: '종료',
}

export const projectStatusChip = {
  draft: 'neutral',
  pending_approval: 'warning',
  active: 'success',
  closed: 'neutral',
}

export const provisionStatus = {
  queued: '대기',
  running: '진행중',
  succeeded: '완료',
  failed: '실패',
}

export const provisionStatusChip = {
  queued: 'neutral',
  running: 'info',
  succeeded: 'success',
  failed: 'danger',
}

export const provisionRollup = {
  none: '프로비저닝 없음',
  in_progress: '프로비저닝 진행중',
  succeeded: '리소스 준비됨',
  failed: '프로비저닝 실패',
}

export const platformType = {
  azure_ml: 'Azure ML',
  azure_databricks: 'Azure Databricks',
}

export const modelStage = {
  draft: 'Draft',
  challenger: 'Challenger',
  champion: 'Champion',
}

export const modelStageChip = {
  draft: 'neutral',
  challenger: 'info',
  champion: 'success',
}

export const championHealth = {
  healthy: '정상',
  at_risk: '위험',
  disqualified_pending: '자격 정지 대기',
}

export const championHealthChip = {
  healthy: 'success',
  at_risk: 'warning',
  disqualified_pending: 'danger',
}

export const monitorResult = {
  pass: '정상',
  fail: '실패',
  no_data: '데이터 없음',
}

export const monitorResultChip = {
  pass: 'success',
  fail: 'danger',
  no_data: 'warning',
}

export const approvalType = {
  project_create: '프로젝트 생성',
  budget_change: '예산 변경',
  deadline_change: '기한 변경',
  project_close: '프로젝트 종료',
  champion_promote: 'Champion 승격',
  champion_demote: 'Champion 강등',
  dataset_promote: '데이터셋 승격',
  dataset_demote: '데이터셋 강등',
  member_sensitive: '민감 멤버 변경',
  compute_upgrade: '컴퓨팅 상향',
}

export const provisionKind = {
  workspace: '워크스페이스',
  compute_upgrade: '컴퓨팅 상향',
}

export const approvalStatus = {
  pending: '대기',
  approved: '승인',
  rejected: '반려',
}

export const approvalStatusChip = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}

export const notificationType = {
  approval_done: '결재 완료',
  provision_done: '프로비저닝 완료',
  provision_failed: '프로비저닝 실패',
  monitor_fail: '모니터 실패',
  drift_alert: '드리프트 경보',
  budget_80: '예산 80% 도달',
  budget_100: '예산 초과',
  champion_at_risk: 'Champion 위험',
  model_stage_change: '스테이지 변경',
  notice_published: '공지',
  analysis_request_submitted: '분석요청 접수',
  analysis_request_updated: '분석요청 업데이트',
}

export const notificationSeverityChip = {
  champion_at_risk: 'danger',
  monitor_fail: 'danger',
  provision_failed: 'danger',
  budget_100: 'danger',
  drift_alert: 'warning',
  budget_80: 'warning',
  provision_done: 'success',
  approval_done: 'info',
  model_stage_change: 'info',
  notice_published: 'warning',
  analysis_request_submitted: 'info',
  analysis_request_updated: 'info',
}

export const notificationSeverityLabel = {
  danger: '위험',
  warning: '주의',
  success: '완료',
  info: '안내',
}

export const platformRole = {
  dsp_admin: '관리자',
  officer: '직책자',
  general: '일반 사용자',
}

export const projectRole = {
  owner: '프로젝트오너',
  coordinator: '코디네이터',
  member: '프로젝트원',
  viewer: '뷰어',
}

export const nodeType = {
  dataset: '데이터셋',
  job: 'Job',
  modelVersion: '모델 버전',
  endpoint: '엔드포인트',
}

export const guideCategory = {
  getting_started: '시작하기',
  project: '프로젝트',
  model: '모델',
  monitoring: '모니터링',
  approval: '결재',
  cost: '비용',
  lineage: '리니지',
  faq: 'FAQ',
}

export const noticeSeverity = {
  info: '안내',
  warning: '주의',
  important: '중요',
}

export const noticeSeverityChip = {
  info: 'info',
  warning: 'warning',
  important: 'danger',
}

export const postStatus = {
  draft: '임시저장',
  published: '게시',
}

export const postStatusChip = {
  draft: 'neutral',
  published: 'success',
}

export const analysisRequestStatus = {
  draft: '임시저장',
  submitted: '접수',
  reviewing: '검토중',
  linked_existing: '기존 프로젝트',
  new_project: '새 프로젝트',
  rejected: '반려',
  completed: '완료',
}

export const analysisRequestStatusChip = {
  draft: 'neutral',
  submitted: 'warning',
  reviewing: 'info',
  linked_existing: 'success',
  new_project: 'success',
  rejected: 'danger',
  completed: 'neutral',
}

export const fulfillmentIntent = {
  existing_project: '기존 프로젝트에 추가',
  new_project: '새 프로젝트로 진행',
  undecided: '미정 (운영 판단)',
}
