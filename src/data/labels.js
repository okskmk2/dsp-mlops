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
  member_sensitive: '민감 멤버 변경',
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
