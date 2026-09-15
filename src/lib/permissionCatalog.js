// Checkbox catalog for the permission edit screen: page access + API call grants.
export const PAGE_PERMISSION_GROUPS = [
  {
    group: '홈/공통',
    items: [
      { key: 'home', label: '홈' },
      { key: 'search', label: '통합 검색' },
      { key: 'notifications', label: '알림' },
    ],
  },
  {
    group: '프로젝트',
    items: [
      { key: 'projects.list', label: '프로젝트 목록' },
      { key: 'projects.create', label: '프로젝트 생성' },
      { key: 'projects.detail', label: '프로젝트 개요/정보' },
      { key: 'projects.team', label: '프로젝트 팀' },
      { key: 'projects.resources', label: '프로젝트 리소스' },
    ],
  },
  {
    group: '모델',
    items: [
      { key: 'models.registry', label: '모델 레지스트리' },
      { key: 'models.promotions', label: '승격 현황' },
      { key: 'models.detail', label: '모델 상세' },
    ],
  },
  {
    group: '모니터링',
    items: [
      { key: 'monitoring.status', label: '모니터 현황' },
      { key: 'monitoring.thresholds', label: '기준치 관리' },
      { key: 'monitoring.drift', label: '드리프트' },
    ],
  },
  {
    group: '비용',
    items: [
      { key: 'cost.overview', label: '비용 개요' },
      { key: 'cost.resources', label: '리소스 비용' },
    ],
  },
  {
    group: '리니지',
    items: [
      { key: 'lineage.explore', label: '리니지 탐색' },
      { key: 'lineage.contamination', label: '오염 관리' },
    ],
  },
  {
    group: '결재/요청',
    items: [
      { key: 'approvals', label: '결재함' },
      { key: 'requests', label: '분석요청' },
    ],
  },
  {
    group: '지원',
    items: [
      { key: 'support.guides', label: '사용법' },
      { key: 'support.notices', label: '공지' },
    ],
  },
  {
    group: '관리자',
    items: [
      { key: 'admin.users', label: '사용자 관리' },
      { key: 'admin.permissions', label: '권한 관리' },
      { key: 'admin.codes', label: '코드 관리' },
      { key: 'admin.batch', label: '배치 작업' },
      { key: 'admin.usage', label: '사용 통계' },
    ],
  },
]

export const API_PERMISSION_GROUPS = [
  {
    group: '프로젝트',
    items: [
      { key: 'api.projects.read', label: 'GET /api/v1/projects' },
      { key: 'api.projects.write', label: 'POST·PUT /api/v1/projects' },
    ],
  },
  {
    group: '모델',
    items: [
      { key: 'api.models.read', label: 'GET /api/v1/models' },
      { key: 'api.models.promote', label: 'POST /api/v1/models/:id/promote' },
    ],
  },
  {
    group: '모니터링',
    items: [
      { key: 'api.monitoring.read', label: 'GET /api/v1/monitoring' },
      { key: 'api.monitoring.write', label: 'PUT /api/v1/monitoring/thresholds' },
    ],
  },
  {
    group: '비용',
    items: [{ key: 'api.cost.read', label: 'GET /api/v1/cost' }],
  },
  {
    group: '리니지',
    items: [
      { key: 'api.lineage.read', label: 'GET /api/v1/lineage' },
      { key: 'api.contamination.write', label: 'POST /api/v1/contaminations' },
    ],
  },
  {
    group: '결재/요청',
    items: [
      { key: 'api.approvals.decide', label: 'POST /api/v1/approvals/:id/decide' },
      { key: 'api.requests.write', label: 'POST /api/v1/requests' },
    ],
  },
  {
    group: '관리자',
    items: [
      { key: 'api.admin.users', label: '사용자 관리 API' },
      { key: 'api.admin.permissions', label: '권한 관리 API' },
      { key: 'api.admin.codes', label: '코드 관리 API' },
      { key: 'api.admin.batch', label: '배치 작업 API' },
    ],
  },
]

export function pageLabel(key) {
  for (const g of PAGE_PERMISSION_GROUPS) {
    const item = g.items.find((i) => i.key === key)
    if (item) return item.label
  }
  return key
}

export function apiLabel(key) {
  for (const g of API_PERMISSION_GROUPS) {
    const item = g.items.find((i) => i.key === key)
    if (item) return item.label
  }
  return key
}
