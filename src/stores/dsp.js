import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { createSeed } from '../data/seed'
import { nid, nowIso } from '../lib/format'
import {
  canListAllProjects,
  canManageDspSettings,
  canRetryProvisioning,
  canViewProject,
  hasProjectRole,
  isApprover,
} from '../lib/permissions'
import { useAuthStore } from './auth'
import { useUiStore } from './ui'

function deepClone(value) {
  return structuredClone(value)
}

export const useDspStore = defineStore('dsp', () => {
  const state = ref(createSeed())

  const users = computed(() => state.value.users)
  const projects = computed(() => state.value.projects)
  const members = computed(() => state.value.members)
  const provisions = computed(() => state.value.provisions)
  const models = computed(() => state.value.models)
  const monitorRules = computed(() => state.value.monitorRules)
  const monitorChecks = computed(() => state.value.monitorChecks)
  const driftSnapshots = computed(() => state.value.driftSnapshots)
  const driftSeries = computed(() => state.value.driftSeries)
  const costRecords = computed(() => state.value.costRecords)
  const datasets = computed(() => state.value.datasets)
  const jobs = computed(() => state.value.jobs)
  const endpoints = computed(() => state.value.endpoints)
  const lineageEdges = computed(() => state.value.lineageEdges)
  const contaminations = computed(() => state.value.contaminations)
  const retrainRequests = computed(() => state.value.retrainRequests)
  const approvals = computed(() => state.value.approvals)
  const notifications = computed(() => state.value.notifications)
  const thresholdTemplates = computed(() => state.value.thresholdTemplates)
  const approvalLines = computed(() => state.value.approvalLines)
  const codes = computed(() => state.value.codes)

  function userById(id) {
    return state.value.users.find((u) => u.id === id) || null
  }

  function projectById(id) {
    return state.value.projects.find((p) => p.id === id) || null
  }

  function modelById(id) {
    return state.value.models.find((m) => m.id === id) || null
  }

  function approvalById(id) {
    return state.value.approvals.find((a) => a.id === id) || null
  }

  function visibleProjects() {
    const auth = useAuthStore()
    const user = auth.user
    if (!user) return []
    if (canListAllProjects(user)) return state.value.projects
    const ids = new Set(
      state.value.members.filter((m) => m.userId === user.id).map((m) => m.projectId),
    )
    return state.value.projects.filter((p) => ids.has(p.id))
  }

  function visibleModels() {
    const ids = new Set(visibleProjects().map((p) => p.id))
    return state.value.models.filter((m) => ids.has(m.projectId))
  }

  function provisionRollup(projectId) {
    const items = state.value.provisions.filter((p) => p.projectId === projectId)
    if (!items.length) return 'none'
    if (items.some((p) => p.status === 'queued' || p.status === 'running')) return 'in_progress'
    if (items.some((p) => p.status === 'failed')) return 'failed'
    if (items.every((p) => p.status === 'succeeded')) return 'succeeded'
    return 'none'
  }

  function spentOf(projectId) {
    return state.value.costRecords
      .filter((c) => c.projectId === projectId)
      .reduce((sum, c) => sum + c.amount, 0)
  }

  function budgetUsedPct(project) {
    if (!project?.budgetAmount) return 0
    return Math.round((spentOf(project.id) / project.budgetAmount) * 1000) / 10
  }

  function championCount(projectId) {
    return state.value.models.filter(
      (m) => m.projectId === projectId && m.stage === 'champion',
    ).length
  }

  function latestCheck(ruleId) {
    return (
      state.value.monitorChecks
        .filter((c) => c.ruleId === ruleId)
        .sort((a, b) => (a.checkedAt < b.checkedAt ? 1 : -1))[0] || null
    )
  }

  function kpis() {
    const visModels = visibleModels()
    const visProjects = visibleProjects().filter((p) => p.status === 'active')
    return {
      championCount: visModels.filter((m) => m.stage === 'champion').length,
      monitorFailCount: visModels.filter((m) => m.lastMonitor === 'fail').length,
      driftCount: visModels.filter((m) => m.driftScore != null && m.driftScore >= 0.25).length,
      overBudgetProjectCount: visProjects.filter((p) => budgetUsedPct(p) >= 100).length,
    }
  }

  function attentionModels() {
    return visibleModels().filter(
      (m) => m.lastMonitor === 'fail' || m.championHealth === 'at_risk' || (m.driftScore ?? 0) >= 0.25,
    )
  }

  function myPendingApprovals() {
    const auth = useAuthStore()
    const user = auth.user
    if (!user) return []
    return state.value.approvals.filter((a) => {
      if (a.status !== 'pending') return false
      if (isApprover(user) && a.approverId === user.id) return true
      if (a.requesterId === user.id) return true
      return false
    })
  }

  function unreadNotifications() {
    const auth = useAuthStore()
    if (!auth.user) return []
    return state.value.notifications.filter((n) => n.userId === auth.user.id && !n.read)
  }

  function myNotifications() {
    const auth = useAuthStore()
    if (!auth.user) return []
    return state.value.notifications
      .filter((n) => n.userId === auth.user.id)
      .slice()
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }

  function notify(userId, payload) {
    state.value.notifications.unshift({
      id: nid('n'),
      userId,
      read: false,
      createdAt: nowIso(),
      ...payload,
    })
  }

  function defaultApprover(type) {
    const line = state.value.approvalLines.find((l) => l.type === type)
    return line?.approverId || 'u-approver'
  }

  function pushApproval(partial) {
    const row = {
      id: nid('a'),
      status: 'pending',
      comment: null,
      createdAt: nowIso(),
      decidedAt: null,
      ...partial,
    }
    state.value.approvals.unshift(row)
    notify(row.approverId, {
      type: 'approval_done',
      title: '결재 대기',
      body: '처리할 품의가 도착했습니다.',
      href: '/approvals',
    })
    return row
  }

  function saveProjectDraft(form, draftId, { silent = false } = {}) {
    const auth = useAuthStore()
    const ui = useUiStore()
    if (!auth.user) return { ok: false }
    const platforms = []
    if (form.useAzureMl) platforms.push('azure_ml')
    if (form.useAzureDatabricks) platforms.push('azure_databricks')
    const payload = {
      name: form.name.trim(),
      goal: form.goal.trim(),
      background: form.background.trim(),
      techStack: form.techStack.filter(Boolean),
      ownerUserId: auth.user.id,
      budgetAmount: Number(form.budgetAmount),
      budgetCurrency: 'KRW',
      startAt: form.startAt,
      endAt: form.endAt,
      platforms,
      azureMlSpec: form.useAzureMl ? { ...form.azureMlSpec } : null,
      databricksSpec: form.useAzureDatabricks ? { ...form.databricksSpec } : null,
    }
    if (draftId) {
      const existing = projectById(draftId)
      if (!existing || existing.status !== 'draft') {
        ui.toast('임시저장 건만 수정할 수 있습니다.', 'danger')
        return { ok: false }
      }
      Object.assign(existing, payload)
      if (!silent) ui.toast('임시저장했습니다.')
      return { ok: true, id: existing.id }
    }
    const id = nid('p')
    state.value.projects.unshift({
      id,
      status: 'draft',
      approvalId: null,
      createdBy: auth.user.id,
      createdAt: nowIso(),
      ...payload,
    })
    state.value.members.push({
      projectId: id,
      userId: auth.user.id,
      projectRole: 'owner',
      addedBy: auth.user.id,
      addedAt: nowIso(),
    })
    for (const member of form.members) {
      if (!member.userId || member.userId === auth.user.id) continue
      if (state.value.members.some((m) => m.projectId === id && m.userId === member.userId)) continue
      state.value.members.push({
        projectId: id,
        userId: member.userId,
        projectRole: member.projectRole,
        addedBy: auth.user.id,
        addedAt: nowIso(),
      })
    }
    if (!silent) ui.toast('임시저장했습니다.')
    return { ok: true, id }
  }

  function submitCreateApproval(form, draftId) {
    const saved = saveProjectDraft(form, draftId, { silent: true })
    if (!saved.ok) return saved
    const project = projectById(saved.id)
    if (!project || project.status !== 'draft') return { ok: false }
    if (!project.platforms.length) {
      useUiStore().toast('플랫폼을 하나 이상 선택하세요.', 'danger')
      return { ok: false }
    }
    const approval = pushApproval({
      type: 'project_create',
      payloadRef: project.id,
      requesterId: useAuthStore().user.id,
      approverId: defaultApprover('project_create'),
      amount: project.budgetAmount,
    })
    project.status = 'pending_approval'
    project.approvalId = approval.id
    useUiStore().toast('결재를 상신했습니다.')
    return { ok: true, id: project.id }
  }

  function discardDraft(projectId) {
    const auth = useAuthStore()
    const project = projectById(projectId)
    if (!project || project.status !== 'draft') return
    if (project.ownerUserId !== auth.user?.id) return
    state.value.projects = state.value.projects.filter((p) => p.id !== projectId)
    state.value.members = state.value.members.filter((m) => m.projectId !== projectId)
    useUiStore().toast('임시저장을 삭제했습니다.')
  }

  function decideApproval(approvalId, decision, comment = '') {
    const auth = useAuthStore()
    const ui = useUiStore()
    const approval = approvalById(approvalId)
    if (!approval || approval.status !== 'pending') return { ok: false }
    if (!isApprover(auth.user) || approval.approverId !== auth.user.id) {
      ui.toast('이 품의를 처리할 권한이 없습니다.', 'danger')
      return { ok: false }
    }
    if (decision === 'rejected' && !comment.trim()) {
      ui.toast('반려 사유를 입력하세요.', 'danger')
      return { ok: false }
    }
    approval.status = decision === 'approved' ? 'approved' : 'rejected'
    approval.comment = comment.trim() || approval.comment
    approval.decidedAt = nowIso()

    if (approval.type === 'project_create') {
      const project = projectById(approval.payloadRef)
      if (project) {
        if (approval.status === 'approved') {
          project.status = 'active'
          for (const platform of project.platforms) {
            state.value.provisions.push({
              id: nid('pr'),
              projectId: project.id,
              platform,
              resourceSpec:
                platform === 'azure_ml' ? project.azureMlSpec : project.databricksSpec,
              status: 'queued',
              cloudResourceId: null,
              errorMessage: null,
              createdAt: nowIso(),
            })
          }
        } else {
          project.status = 'draft'
        }
      }
    }

    if (approval.type === 'project_close' && approval.status === 'approved') {
      const project = projectById(approval.payloadRef)
      if (project) project.status = 'closed'
    }

    if (approval.type === 'budget_change' && approval.status === 'approved') {
      const project = projectById(approval.payloadRef)
      if (project && approval.amount) project.budgetAmount = approval.amount
    }

    if (approval.type === 'champion_promote' && approval.status === 'approved') {
      promoteModel(approval.payloadRef)
    }

    if (approval.type === 'champion_demote' && approval.status === 'approved') {
      demoteModel(approval.payloadRef)
    }

    notify(approval.requesterId, {
      type: 'approval_done',
      title: approval.status === 'approved' ? '품의가 승인되었습니다' : '품의가 반려되었습니다',
      body: approval.comment || '',
      href: '/approvals',
    })
    ui.toast(approval.status === 'approved' ? '승인했습니다.' : '반려했습니다.')
    return { ok: true }
  }

  function promoteModel(modelId) {
    const challenger = modelById(modelId)
    if (!challenger) return
    const current = state.value.models.find(
      (m) => m.projectId === challenger.projectId && m.stage === 'champion' && m.name === challenger.name,
    )
    if (current) {
      current.stage = 'challenger'
      current.championHealth = null
    }
    challenger.stage = 'champion'
    challenger.championHealth = 'healthy'
  }

  function demoteModel(modelId) {
    const champion = modelById(modelId)
    if (!champion || champion.stage !== 'champion') return
    champion.stage = 'challenger'
    champion.championHealth = null
  }

  function submitClose(projectId) {
    const auth = useAuthStore()
    const project = projectById(projectId)
    if (!project || project.status !== 'active') return { ok: false }
    if (!hasProjectRole(auth.user, projectId, state.value.members, ['owner'])) return { ok: false }
    if (
      state.value.approvals.some(
        (a) => a.payloadRef === projectId && a.type === 'project_close' && a.status === 'pending',
      )
    ) {
      useUiStore().toast('이미 종료 결재가 진행 중입니다.', 'warning')
      return { ok: false }
    }
    pushApproval({
      type: 'project_close',
      payloadRef: projectId,
      requesterId: auth.user.id,
      approverId: defaultApprover('project_close'),
    })
    useUiStore().toast('종료 품의를 상신했습니다.')
    return { ok: true }
  }

  function submitBudgetChange(projectId, amount) {
    const auth = useAuthStore()
    const project = projectById(projectId)
    if (!project || project.status !== 'active') return { ok: false }
    if (!hasProjectRole(auth.user, projectId, state.value.members, ['owner'])) return { ok: false }
    pushApproval({
      type: 'budget_change',
      payloadRef: projectId,
      requesterId: auth.user.id,
      approverId: defaultApprover('budget_change'),
      amount: Number(amount),
    })
    useUiStore().toast('예산 변경 품의를 상신했습니다.')
    return { ok: true }
  }

  function retryProvisioning(provisionId) {
    const auth = useAuthStore()
    const ui = useUiStore()
    if (!canRetryProvisioning(auth.user)) {
      ui.toast('관리자만 재시도할 수 있습니다.', 'danger')
      return
    }
    const item = state.value.provisions.find((p) => p.id === provisionId)
    if (!item || item.status !== 'failed') return
    const project = projectById(item.projectId)
    if (!project || project.status === 'closed') {
      ui.toast('종료된 프로젝트는 재시도할 수 없습니다.', 'danger')
      return
    }
    item.status = 'queued'
    item.errorMessage = null
    ui.toast('프로비저닝을 다시 대기열에 넣었습니다.')
  }

  function addMember(projectId, userId, role) {
    const auth = useAuthStore()
    const project = projectById(projectId)
    if (!project || project.status !== 'active') return { ok: false }
    const actorRole = state.value.members.find(
      (m) => m.projectId === projectId && m.userId === auth.user?.id,
    )?.projectRole
    if (!['owner', 'coordinator'].includes(actorRole)) return { ok: false }
    if (actorRole === 'coordinator' && ['owner', 'coordinator'].includes(role)) {
      useUiStore().toast('코디네이터는 오너·코디네이터를 지정할 수 없습니다.', 'danger')
      return { ok: false }
    }
    if (state.value.members.some((m) => m.projectId === projectId && m.userId === userId)) {
      useUiStore().toast('이미 팀에 있는 사용자입니다.', 'warning')
      return { ok: false }
    }
    state.value.members.push({
      projectId,
      userId,
      projectRole: role,
      addedBy: auth.user.id,
      addedAt: nowIso(),
    })
    useUiStore().toast('멤버를 추가했습니다.')
    return { ok: true }
  }

  function changeMemberRole(projectId, userId, role) {
    const auth = useAuthStore()
    const actorRole = state.value.members.find(
      (m) => m.projectId === projectId && m.userId === auth.user?.id,
    )?.projectRole
    const target = state.value.members.find((m) => m.projectId === projectId && m.userId === userId)
    if (!target) return
    if (actorRole === 'coordinator' && (['owner', 'coordinator'].includes(target.projectRole) || ['owner', 'coordinator'].includes(role))) {
      useUiStore().toast('코디네이터는 오너·코디네이터를 변경할 수 없습니다.', 'danger')
      return
    }
    if (actorRole !== 'owner' && actorRole !== 'coordinator') return
    if (role === 'owner' && actorRole !== 'owner') return
    target.projectRole = role
    useUiStore().toast('역할을 변경했습니다.')
  }

  function removeMember(projectId, userId) {
    const auth = useAuthStore()
    const actorRole = state.value.members.find(
      (m) => m.projectId === projectId && m.userId === auth.user?.id,
    )?.projectRole
    const target = state.value.members.find((m) => m.projectId === projectId && m.userId === userId)
    if (!target) return
    if (target.projectRole === 'owner') {
      useUiStore().toast('오너는 제거할 수 없습니다.', 'danger')
      return
    }
    if (actorRole === 'coordinator' && target.projectRole === 'coordinator') {
      useUiStore().toast('코디네이터는 코디네이터를 제거할 수 없습니다.', 'danger')
      return
    }
    if (actorRole !== 'owner' && actorRole !== 'coordinator') return
    state.value.members = state.value.members.filter(
      (m) => !(m.projectId === projectId && m.userId === userId),
    )
    useUiStore().toast('멤버를 제거했습니다.')
  }

  function requestRetrain({ modelId, reason, datasetRef, existingJobId }) {
    const auth = useAuthStore()
    const model = modelById(modelId)
    if (!model) return { ok: false }
    const project = projectById(model.projectId)
    if (!project || project.status !== 'active') return { ok: false }
    if (!hasProjectRole(auth.user, model.projectId, state.value.members, ['owner', 'coordinator', 'member'])) {
      return { ok: false }
    }
    const row = {
      id: nid('rr'),
      modelId,
      reason,
      datasetRef,
      existingJobId,
      status: 'running',
      cloudRunUrl: `https://ml.azure.com/jobs/${existingJobId}?run=${nid('run')}`,
      requestedBy: auth.user.id,
      requestedAt: nowIso(),
    }
    state.value.retrainRequests.unshift(row)
    useUiStore().toast('재학습 Job을 요청했습니다.')
    return { ok: true, row }
  }

  function submitPromotion(modelId) {
    const auth = useAuthStore()
    const model = modelById(modelId)
    if (!model || model.stage !== 'challenger') return { ok: false }
    if (!hasProjectRole(auth.user, model.projectId, state.value.members, ['owner', 'coordinator'])) {
      useUiStore().toast('오너 또는 코디네이터만 상신할 수 있습니다.', 'danger')
      return { ok: false }
    }
    pushApproval({
      type: 'champion_promote',
      payloadRef: modelId,
      requesterId: auth.user.id,
      approverId: defaultApprover('champion_promote'),
      checklist: { metrics: true, monitorPass: model.lastMonitor === 'pass', driftBelow: (model.driftScore ?? 0) < 0.25 },
    })
    useUiStore().toast('승격 품의를 상신했습니다.')
    return { ok: true }
  }

  function submitDemotion(modelId) {
    const auth = useAuthStore()
    const model = modelById(modelId)
    if (!model || model.stage !== 'champion') return { ok: false }
    if (!hasProjectRole(auth.user, model.projectId, state.value.members, ['owner', 'coordinator'])) {
      return { ok: false }
    }
    pushApproval({
      type: 'champion_demote',
      payloadRef: modelId,
      requesterId: auth.user.id,
      approverId: defaultApprover('champion_promote'),
    })
    useUiStore().toast('강등 품의를 상신했습니다.')
    return { ok: true }
  }

  function saveMonitorRule(rule) {
    const auth = useAuthStore()
    const project = projectById(rule.projectId)
    if (!project) return { ok: false }
    const admin = auth.user?.platformRole === 'dsp_admin'
    const allowed = admin || hasProjectRole(auth.user, rule.projectId, state.value.members, ['owner', 'coordinator'])
    if (!allowed) return { ok: false }
    if (rule.id) {
      const existing = state.value.monitorRules.find((r) => r.id === rule.id)
      if (existing) Object.assign(existing, rule)
    } else {
      state.value.monitorRules.unshift({ ...rule, id: nid('mr'), enabled: true })
    }
    useUiStore().toast('기준치를 저장했습니다.')
    return { ok: true }
  }

  function disableMonitorRule(id) {
    const rule = state.value.monitorRules.find((r) => r.id === id)
    if (!rule) return
    rule.enabled = false
    useUiStore().toast('규칙을 비활성화했습니다.')
  }

  function applyTemplate(ruleId, templateId) {
    const rule = state.value.monitorRules.find((r) => r.id === ruleId)
    const template = state.value.thresholdTemplates.find((t) => t.id === templateId)
    if (!rule || !template) return
    rule.metricName = template.metricName
    rule.operator = template.operator
    rule.threshold = template.threshold
    rule.cron = template.interval
    useUiStore().toast('템플릿을 적용했습니다.')
  }

  function declareContamination(payload) {
    const auth = useAuthStore()
    state.value.contaminations.unshift({
      id: nid('ct'),
      status: 'open',
      declaredBy: auth.user.id,
      declaredAt: nowIso(),
      ...payload,
    })
    useUiStore().toast('오염 구간을 선언했습니다.')
  }

  function closeContamination(id) {
    const row = state.value.contaminations.find((c) => c.id === id)
    if (!row) return
    row.status = 'closed'
    useUiStore().toast('오염 구간을 닫았습니다.')
  }

  function markRead(id) {
    const row = state.value.notifications.find((n) => n.id === id)
    if (row) row.read = true
  }

  function markAllRead() {
    const auth = useAuthStore()
    for (const n of state.value.notifications) {
      if (n.userId === auth.user?.id) n.read = true
    }
  }

  function search(query) {
    const q = query.trim().toLowerCase()
    if (!q) {
      return { project: [], model: [], dataset: [], approval: [] }
    }
    const vis = new Set(visibleProjects().map((p) => p.id))
    return {
      project: visibleProjects().filter((p) => p.name.toLowerCase().includes(q) || p.goal.includes(query)),
      model: visibleModels().filter((m) => `${m.name} ${m.version}`.toLowerCase().includes(q)),
      dataset: state.value.datasets.filter(
        (d) => vis.has(d.projectId) && (d.name.toLowerCase().includes(q) || d.ref.toLowerCase().includes(q)),
      ),
      approval: state.value.approvals.filter((a) => {
        const project = projectById(a.payloadRef)
        const model = modelById(a.payloadRef)
        const inScope = project ? vis.has(project.id) : model ? vis.has(model.projectId) : isApprover(useAuthStore().user)
        if (!inScope) return false
        return a.id.toLowerCase().includes(q) || a.type.includes(q)
      }),
    }
  }

  function canSeeProject(projectId) {
    const auth = useAuthStore()
    return canViewProject(auth.user, projectId, state.value.members)
  }

  function patchSettings(partial) {
    Object.assign(state.value.settings, partial)
  }

  function requireAdmin() {
    const auth = useAuthStore()
    if (!canManageDspSettings(auth.user)) {
      useUiStore().toast('관리자만 할 수 있습니다.', 'danger')
      return false
    }
    return true
  }

  function saveUser(payload) {
    if (!requireAdmin()) return { ok: false }
    const ui = useUiStore()
    const name = payload.name?.trim()
    const email = payload.email?.trim()
    if (!name || !email) {
      ui.toast('이름과 메일을 입력하세요.', 'danger')
      return { ok: false }
    }
    if (payload.id) {
      const existing = userById(payload.id)
      if (!existing) return { ok: false }
      const admins = state.value.users.filter((u) => u.platformRole === 'dsp_admin' && u.enabled !== false)
      if (existing.platformRole === 'dsp_admin' && payload.platformRole !== 'dsp_admin' && admins.length <= 1) {
        ui.toast('마지막 관리자 역할은 해제할 수 없습니다.', 'danger')
        return { ok: false }
      }
      Object.assign(existing, {
        name,
        email,
        title: payload.title?.trim() || existing.title,
        platformRole: payload.platformRole,
        isApprover: Boolean(payload.isApprover),
        initials: name.slice(0, 2),
        enabled: payload.enabled !== false,
      })
      ui.toast('사용자를 저장했습니다.')
      return { ok: true, id: existing.id }
    }
    if (state.value.users.some((u) => u.email === email)) {
      ui.toast('이미 있는 메일입니다.', 'danger')
      return { ok: false }
    }
    const id = nid('u')
    state.value.users.push({
      id,
      name,
      email,
      title: payload.title?.trim() || '',
      platformRole: payload.platformRole || 'general',
      isApprover: Boolean(payload.isApprover),
      initials: name.slice(0, 2),
      enabled: true,
    })
    ui.toast('사용자를 추가했습니다.')
    return { ok: true, id }
  }

  function setUserEnabled(userId, enabled) {
    if (!requireAdmin()) return { ok: false }
    const existing = userById(userId)
    if (!existing) return { ok: false }
    const auth = useAuthStore()
    if (userId === auth.user?.id && !enabled) {
      useUiStore().toast('자기 자신은 비활성할 수 없습니다.', 'danger')
      return { ok: false }
    }
    if (existing.platformRole === 'dsp_admin' && !enabled) {
      const admins = state.value.users.filter((u) => u.platformRole === 'dsp_admin' && u.enabled !== false)
      if (admins.length <= 1) {
        useUiStore().toast('마지막 관리자는 비활성할 수 없습니다.', 'danger')
        return { ok: false }
      }
    }
    existing.enabled = enabled
    useUiStore().toast(enabled ? '사용자를 활성했습니다.' : '사용자를 비활성했습니다.')
    return { ok: true }
  }

  function setPlatformRole(userId, platformRole) {
    if (!requireAdmin()) return { ok: false }
    const existing = userById(userId)
    if (!existing) return { ok: false }
    const admins = state.value.users.filter((u) => u.platformRole === 'dsp_admin' && u.enabled !== false)
    if (existing.platformRole === 'dsp_admin' && platformRole !== 'dsp_admin' && admins.length <= 1) {
      useUiStore().toast('마지막 관리자 역할은 해제할 수 없습니다.', 'danger')
      return { ok: false }
    }
    existing.platformRole = platformRole
    useUiStore().toast('플랫폼 역할을 변경했습니다.')
    return { ok: true }
  }

  function setApproverFlag(userId, isApproverFlag) {
    if (!requireAdmin()) return { ok: false }
    const existing = userById(userId)
    if (!existing) return { ok: false }
    existing.isApprover = Boolean(isApproverFlag)
    useUiStore().toast(isApproverFlag ? '승인권자로 지정했습니다.' : '승인권자를 해제했습니다.')
    return { ok: true }
  }

  function saveApprovalLine(line) {
    if (!requireAdmin()) return { ok: false }
    if (line.id) {
      const existing = state.value.approvalLines.find((l) => l.id === line.id)
      if (existing) Object.assign(existing, { type: line.type, approverId: line.approverId })
    } else {
      state.value.approvalLines.push({
        id: nid('al'),
        type: line.type,
        approverId: line.approverId,
      })
    }
    useUiStore().toast('결재선을 저장했습니다.')
    return { ok: true }
  }

  function saveCode(payload) {
    if (!requireAdmin()) return { ok: false }
    const ui = useUiStore()
    const code = payload.code?.trim()
    const label = payload.label?.trim()
    if (!payload.group || !code || !label) {
      ui.toast('그룹·코드·표시명을 입력하세요.', 'danger')
      return { ok: false }
    }
    if (payload.id) {
      const existing = state.value.codes.find((c) => c.id === payload.id)
      if (!existing) return { ok: false }
      Object.assign(existing, { code, label, enabled: payload.enabled !== false, sort: Number(payload.sort) || existing.sort })
      ui.toast('코드를 저장했습니다.')
      return { ok: true }
    }
    if (state.value.codes.some((c) => c.group === payload.group && c.code === code)) {
      ui.toast('같은 그룹에 이미 있는 코드입니다.', 'danger')
      return { ok: false }
    }
    const groupLabel =
      state.value.codes.find((c) => c.group === payload.group)?.groupLabel || payload.groupLabel || payload.group
    const sort =
      Number(payload.sort) ||
      Math.max(0, ...state.value.codes.filter((c) => c.group === payload.group).map((c) => c.sort || 0)) + 1
    state.value.codes.push({
      id: nid('code'),
      group: payload.group,
      groupLabel,
      code,
      label,
      enabled: true,
      sort,
    })
    ui.toast('코드를 추가했습니다.')
    return { ok: true }
  }

  function setCodeEnabled(id, enabled) {
    if (!requireAdmin()) return { ok: false }
    const existing = state.value.codes.find((c) => c.id === id)
    if (!existing) return { ok: false }
    existing.enabled = enabled
    useUiStore().toast(enabled ? '코드를 활성했습니다.' : '코드를 비활성했습니다.')
    return { ok: true }
  }

  function reset() {
    state.value = deepClone(createSeed())
  }

  return {
    users,
    projects,
    members,
    provisions,
    models,
    monitorRules,
    monitorChecks,
    driftSnapshots,
    driftSeries,
    costRecords,
    datasets,
    jobs,
    endpoints,
    lineageEdges,
    contaminations,
    retrainRequests,
    approvals,
    notifications,
    thresholdTemplates,
    approvalLines,
    codes,
    settings: computed(() => state.value.settings),
    userById,
    projectById,
    modelById,
    approvalById,
    visibleProjects,
    visibleModels,
    provisionRollup,
    spentOf,
    budgetUsedPct,
    championCount,
    latestCheck,
    kpis,
    attentionModels,
    myPendingApprovals,
    unreadNotifications,
    myNotifications,
    saveProjectDraft,
    submitCreateApproval,
    discardDraft,
    decideApproval,
    submitClose,
    submitBudgetChange,
    retryProvisioning,
    addMember,
    changeMemberRole,
    removeMember,
    requestRetrain,
    submitPromotion,
    submitDemotion,
    saveMonitorRule,
    disableMonitorRule,
    applyTemplate,
    declareContamination,
    closeContamination,
    markRead,
    markAllRead,
    search,
    canSeeProject,
    patchSettings,
    saveUser,
    setUserEnabled,
    setPlatformRole,
    setApproverFlag,
    saveApprovalLine,
    saveCode,
    setCodeEnabled,
    reset,
  }
})
