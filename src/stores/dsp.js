import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { modelStage } from '../data/labels'
import { createSeed } from '../data/seed'
import {
  computeClassById,
  computeClassLabel,
  currentClassId,
  DEFAULT_COMPUTE_CLASS,
  isWorkspaceProvision,
  monthlyDelta,
} from '../lib/compute'
import { nid, nowIso } from '../lib/format'
import {
  canListAllProjects,
  canManageDspSettings,
  canManageSupport,
  canRetryProvisioning,
  canTriageAnalysisRequest,
  canViewAllAnalysisRequests,
  canViewProject,
  canWriteProject,
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
  const permissions = computed(() => state.value.permissions)
  const codes = computed(() => state.value.codes)
  const computeClasses = computed(() => state.value.computeClasses)
  const supportPosts = computed(() => state.value.supportPosts)
  const analysisRequests = computed(() => state.value.analysisRequests)
  const batchJobs = computed(() => state.value.batchJobs)
  const batchRuns = computed(() => state.value.batchRuns)
  const usageDaily = computed(() => state.value.usageDaily)
  const usageByUser = computed(() => state.value.usageByUser)
  const usageByPage = computed(() => state.value.usageByPage)
  const usageByApi = computed(() => state.value.usageByApi)

  function usageSummary() {
    return {
      totalPageViews: state.value.usageByUser.reduce((sum, u) => sum + u.pageViews, 0),
      totalApiCalls: state.value.usageByUser.reduce((sum, u) => sum + u.apiCalls, 0),
      activeUserCount: state.value.usageByUser.length,
    }
  }

  function userById(id) {
    return state.value.users.find((u) => u.id === id) || null
  }

  function projectById(id) {
    return state.value.projects.find((p) => p.id === id) || null
  }

  function modelById(id) {
    return state.value.models.find((m) => m.id === id) || null
  }

  function datasetById(id) {
    return state.value.datasets.find((d) => d.id === id) || null
  }

  function approvalById(id) {
    return state.value.approvals.find((a) => a.id === id) || null
  }

  function permissionById(id) {
    return state.value.permissions.find((p) => p.id === id) || null
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

  function attentionSeverity(m) {
    if (m.lastMonitor === 'fail') return 3
    if ((m.driftScore ?? 0) >= 0.25) return 2
    if (m.championHealth === 'at_risk') return 1
    return 0
  }

  function attentionModels() {
    return visibleModels()
      .filter(
        (m) => m.lastMonitor === 'fail' || m.championHealth === 'at_risk' || (m.driftScore ?? 0) >= 0.25,
      )
      .sort((a, b) => attentionSeverity(b) - attentionSeverity(a))
  }

  function myPendingApprovals() {
    const auth = useAuthStore()
    const user = auth.user
    if (!user) return []
    return state.value.approvals
      .filter((a) => {
        if (a.status !== 'pending') return false
        if (isApprover(user) && a.approverId === user.id) return true
        if (a.requesterId === user.id) return true
        return false
      })
      .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
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

  function notifyProjectMembers(projectId, payload) {
    const ids = state.value.members.filter((m) => m.projectId === projectId).map((m) => m.userId)
    for (const userId of ids) notify(userId, payload)
  }

  function stageChangeBody(fromStage, toStage) {
    const from = modelStage[fromStage] || fromStage
    const to = modelStage[toStage] || toStage
    if (fromStage === 'draft' && toStage === 'challenger') {
      return `${from} → ${to}. 스테이징에서 비교 검증을 시작합니다.`
    }
    if (toStage === 'champion') {
      return `${from} → ${to}. 운영(prod) 모델로 승격되었습니다.`
    }
    if (fromStage === 'champion') {
      return `${from} → ${to}. 운영 모델에서 강등되었습니다.`
    }
    return `${from} → ${to}`
  }

  function notifyStageChange(model, fromStage, toStage) {
    if (!model || fromStage === toStage) return
    notifyProjectMembers(model.projectId, {
      type: 'model_stage_change',
      title: `${model.name} ${model.version} 스테이지 변경`,
      body: stageChangeBody(fromStage, toStage),
      href: `/models/${model.id}`,
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
      href: `/approvals/${row.id}`,
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
      sourceRequestId: form.sourceRequestId || null,
    }
    if (draftId) {
      const existing = projectById(draftId)
      if (!existing || existing.status !== 'draft') {
        ui.toast('임시저장 건만 수정할 수 있습니다.', 'danger')
        return { ok: false }
      }
      Object.assign(existing, payload)
      syncDraftMembers(draftId, form.members, auth.user.id)
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
    syncDraftMembers(id, form.members, auth.user.id)
    if (!silent) ui.toast('임시저장했습니다.')
    return { ok: true, id }
  }

  function syncDraftMembers(projectId, members, addedBy) {
    state.value.members = state.value.members.filter((member) => member.projectId !== projectId || member.projectRole === 'owner')
    const seen = new Set()
    for (const member of members || []) {
      if (!member.userId || member.userId === addedBy || seen.has(member.userId)) continue
      seen.add(member.userId)
      state.value.members.push({
        projectId,
        userId: member.userId,
        projectRole: member.projectRole || 'member',
        addedBy,
        addedAt: nowIso(),
      })
    }
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
    if (project.sourceRequestId) {
      attachRequestToNewProject(project.sourceRequestId, project.id)
    }
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
            const spec = {
              ...(platform === 'azure_ml' ? project.azureMlSpec : project.databricksSpec),
              computeClass: DEFAULT_COMPUTE_CLASS[platform],
            }
            state.value.provisions.push({
              id: nid('pr'),
              projectId: project.id,
              platform,
              kind: 'workspace',
              resourceSpec: spec,
              fromSpec: null,
              toSpec: null,
              approvalId: approval.id,
              estimatedMonthlyDelta: null,
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
      if (project) {
        project.status = 'closed'
        cancelPendingComputeUpgrades(project.id)
      }
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

    if (approval.type === 'dataset_promote' && approval.status === 'approved') {
      promoteDataset(approval.payloadRef)
    }

    if (approval.type === 'dataset_demote' && approval.status === 'approved') {
      demoteDataset(approval.payloadRef)
    }

    if (approval.type === 'compute_upgrade' && approval.status === 'approved') {
      applyComputeUpgrade(approval)
    }

    const doneTitle = approval.status === 'approved' ? '품의가 승인되었습니다' : '품의가 반려되었습니다'
    notify(approval.requesterId, {
      type: 'approval_done',
      title: doneTitle,
      body: approval.comment || '',
      href: `/approvals/${approval.id}`,
    })
    if (approval.type === 'compute_upgrade' && approval.projectId) {
      const project = projectById(approval.projectId)
      if (project && project.ownerUserId !== approval.requesterId) {
        notify(project.ownerUserId, {
          type: 'approval_done',
          title: doneTitle,
          body: approval.comment || `${computeClassLabel(state.value.computeClasses, approval.fromClass)} → ${computeClassLabel(state.value.computeClasses, approval.toClass)}`,
          href: `/projects/${project.id}/resources`,
        })
      }
    }
    ui.toast(approval.status === 'approved' ? '승인했습니다.' : '반려했습니다.')
    return { ok: true }
  }

  function promoteModel(modelId) {
    const challenger = modelById(modelId)
    if (!challenger) return
    const from = challenger.stage
    const current = state.value.models.find(
      (m) => m.projectId === challenger.projectId && m.stage === 'champion' && m.name === challenger.name,
    )
    if (current) {
      const prevFrom = current.stage
      current.stage = 'challenger'
      current.championHealth = null
      notifyStageChange(current, prevFrom, 'challenger')
    }
    challenger.stage = 'champion'
    challenger.championHealth = 'healthy'
    notifyStageChange(challenger, from, 'champion')
  }

  function demoteModel(modelId) {
    const champion = modelById(modelId)
    if (!champion || champion.stage !== 'champion') return
    champion.stage = 'challenger'
    champion.championHealth = null
    notifyStageChange(champion, 'champion', 'challenger')
  }

  function promoteDataset(datasetId) {
    const dataset = datasetById(datasetId)
    if (!dataset) return
    const from = dataset.stage
    dataset.stage = 'champion'
    notifyStageChange(dataset, from, 'champion')
  }

  function demoteDataset(datasetId) {
    const dataset = datasetById(datasetId)
    if (!dataset || dataset.stage !== 'champion') return
    dataset.stage = 'challenger'
    notifyStageChange(dataset, 'champion', 'challenger')
  }

  function registerChallenger(modelId) {
    const auth = useAuthStore()
    const ui = useUiStore()
    const model = modelById(modelId)
    if (!model || model.stage !== 'draft') return { ok: false }
    const project = projectById(model.projectId)
    if (!canWriteProject(auth.user, project, state.value.members, 'registerChallenger')) {
      ui.toast('Challenger로 등록할 권한이 없습니다.', 'danger')
      return { ok: false }
    }
    model.stage = 'challenger'
    notifyStageChange(model, 'draft', 'challenger')
    ui.toast('Challenger로 등록했습니다.')
    return { ok: true }
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

  function provisionById(id) {
    return state.value.provisions.find((p) => p.id === id) || null
  }

  function approvalTarget(approval) {
    if (!approval) return { name: '', href: '', projectId: null }
    const project = projectById(approval.payloadRef)
    if (project) return { name: project.name, href: `/projects/${project.id}`, projectId: project.id }
    const model = modelById(approval.payloadRef)
    if (model) {
      return {
        name: `${model.name} ${model.version}`.trim(),
        href: `/models/${model.id}`,
        projectId: model.projectId,
      }
    }
    const dataset = datasetById(approval.payloadRef)
    if (dataset) {
      return {
        name: dataset.name,
        href: `/datasets/${dataset.id}`,
        projectId: dataset.projectId,
      }
    }
    const provision = provisionById(approval.payloadRef)
    if (provision) {
      const parent = projectById(provision.projectId)
      return {
        name: parent?.name || provision.cloudResourceId || provision.id,
        href: `/projects/${provision.projectId}/resources`,
        projectId: provision.projectId,
      }
    }
    if (approval.projectId) {
      const parent = projectById(approval.projectId)
      return {
        name: parent?.name || approval.payloadRef,
        href: `/projects/${approval.projectId}/resources`,
        projectId: approval.projectId,
      }
    }
    return { name: approval.payloadRef, href: '', projectId: null }
  }

  function hasInFlightComputeUpgrade(projectId, platform) {
    const pending = state.value.approvals.some(
      (a) =>
        a.type === 'compute_upgrade' &&
        a.status === 'pending' &&
        a.projectId === projectId &&
        a.platform === platform,
    )
    const running = state.value.provisions.some(
      (p) =>
        p.projectId === projectId &&
        p.platform === platform &&
        p.kind === 'compute_upgrade' &&
        (p.status === 'queued' || p.status === 'running'),
    )
    return pending || running
  }

  function pendingComputeUpgrade(projectId, platform) {
    return (
      state.value.approvals.find(
        (a) =>
          a.type === 'compute_upgrade' &&
          a.status === 'pending' &&
          a.projectId === projectId &&
          a.platform === platform,
      ) || null
    )
  }

  function workspaceOf(projectId, platform) {
    return (
      state.value.provisions.find(
        (p) => p.projectId === projectId && p.platform === platform && isWorkspaceProvision(p),
      ) || null
    )
  }

  function cancelPendingComputeUpgrades(projectId) {
    for (const row of state.value.approvals) {
      if (row.type !== 'compute_upgrade' || row.status !== 'pending' || row.projectId !== projectId) continue
      row.status = 'rejected'
      row.comment = '프로젝트 종료로 취소'
      row.decidedAt = nowIso()
      notify(row.requesterId, {
        type: 'approval_done',
        title: '품의가 반려되었습니다',
        body: row.comment,
        href: `/approvals/${row.id}`,
      })
    }
  }

  function applyComputeUpgrade(approval) {
    const workspace = provisionById(approval.payloadRef)
    const project = projectById(approval.projectId)
    if (!project || project.status === 'closed' || !workspace || !isWorkspaceProvision(workspace)) return
    if (approval.budgetAfter && approval.budgetAfter > project.budgetAmount) {
      project.budgetAmount = approval.budgetAfter
    }
    const fromSpec = { ...workspace.resourceSpec }
    const toSpec = { ...workspace.resourceSpec, computeClass: approval.toClass }
    state.value.provisions.push({
      id: nid('pr'),
      projectId: project.id,
      platform: workspace.platform,
      kind: 'compute_upgrade',
      resourceSpec: toSpec,
      fromSpec,
      toSpec,
      approvalId: approval.id,
      estimatedMonthlyDelta: approval.estimatedMonthlyDelta,
      status: 'succeeded',
      cloudResourceId: workspace.cloudResourceId,
      errorMessage: null,
      createdAt: nowIso(),
    })
    workspace.resourceSpec = toSpec
    notify(approval.requesterId, {
      type: 'provision_done',
      title: '컴퓨팅 등급이 변경되었습니다',
      body: `${computeClassLabel(state.value.computeClasses, approval.fromClass)} → ${computeClassLabel(state.value.computeClasses, approval.toClass)}`,
      href: `/projects/${project.id}/resources`,
    })
  }

  function submitComputeUpgrade(workspaceId, toClassId, reason) {
    const auth = useAuthStore()
    const ui = useUiStore()
    const workspace = provisionById(workspaceId)
    if (!workspace || !isWorkspaceProvision(workspace) || workspace.status !== 'succeeded') {
      ui.toast('준비된 워크스페이스만 상향할 수 있습니다.', 'danger')
      return { ok: false }
    }
    const project = projectById(workspace.projectId)
    if (!project || project.status !== 'active') {
      ui.toast('운영중인 프로젝트만 상향할 수 있습니다.', 'danger')
      return { ok: false }
    }
    if (!canWriteProject(auth.user, project, state.value.members, 'requestComputeUpgrade')) {
      ui.toast('상향을 신청할 권한이 없습니다.', 'danger')
      return { ok: false }
    }
    if (hasInFlightComputeUpgrade(project.id, workspace.platform)) {
      ui.toast('이미 진행 중인 컴퓨팅 상향이 있습니다.', 'warning')
      return { ok: false }
    }
    const toClass = computeClassById(state.value.computeClasses, toClassId)
    const fromClass = computeClassById(state.value.computeClasses, currentClassId(workspace))
    if (!toClass || toClass.platform !== workspace.platform) {
      ui.toast('요청 등급을 확인하세요.', 'danger')
      return { ok: false }
    }
    if (!fromClass || toClass.monthlyCost <= fromClass.monthlyCost) {
      ui.toast('현재보다 높은 등급만 신청할 수 있습니다.', 'danger')
      return { ok: false }
    }
    if (!String(reason || '').trim()) {
      ui.toast('사유를 입력하세요.', 'danger')
      return { ok: false }
    }
    const delta = monthlyDelta(fromClass, toClass)
    const spent = spentOf(project.id)
    const remaining = project.budgetAmount - spent
    const budgetAfter = remaining < delta ? spent + delta : project.budgetAmount
    const approval = pushApproval({
      type: 'compute_upgrade',
      payloadRef: workspace.id,
      requesterId: auth.user.id,
      approverId: defaultApprover('compute_upgrade'),
      amount: delta,
      fromClass: fromClass.id,
      toClass: toClass.id,
      reason: String(reason).trim(),
      projectId: project.id,
      platform: workspace.platform,
      estimatedMonthlyDelta: delta,
      budgetAfter,
    })
    if (project.ownerUserId !== auth.user.id) {
      notify(project.ownerUserId, {
        type: 'approval_done',
        title: '컴퓨팅 상향 품의가 상신되었습니다',
        body: `${fromClass.label} → ${toClass.label}`,
        href: `/projects/${project.id}/resources`,
      })
    }
    ui.toast('컴퓨팅 상향 품의를 상신했습니다.')
    return { ok: true, id: approval.id }
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

  function batchJobById(id) {
    return state.value.batchJobs.find((j) => j.id === id) || null
  }

  function batchRunsFor(jobId) {
    return state.value.batchRuns
      .filter((r) => r.jobId === jobId)
      .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))
  }

  function setBatchJobEnabled(jobId, enabled) {
    if (!requireAdmin()) return { ok: false }
    const job = batchJobById(jobId)
    if (!job) return { ok: false }
    job.enabled = enabled
    useUiStore().toast(enabled ? '배치를 활성화했습니다.' : '배치를 비활성화했습니다.')
    return { ok: true }
  }

  function retryBatchJob(jobId) {
    if (!requireAdmin()) return { ok: false }
    const job = batchJobById(jobId)
    if (!job || job.lastStatus !== 'failed') return { ok: false }
    const now = nowIso()
    job.lastStatus = 'running'
    job.lastRunAt = now
    job.lastError = null
    state.value.batchRuns.unshift({ id: nid('run'), jobId, startedAt: now, finishedAt: null, status: 'running' })
    useUiStore().toast('배치를 다시 실행합니다.')
    return { ok: true }
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

  function submitDemotion(modelId, reason = '') {
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
      reason: reason?.trim() || 'Champion 지위를 철회합니다.',
    })
    useUiStore().toast('강등 품의를 상신했습니다.')
    return { ok: true }
  }

  function submitDatasetPromotion(datasetId, reason = '') {
    const auth = useAuthStore()
    const dataset = datasetById(datasetId)
    if (!dataset || dataset.stage !== 'challenger') return { ok: false }
    if (!dataset.projectId || !hasProjectRole(auth.user, dataset.projectId, state.value.members, ['owner', 'coordinator'])) {
      return { ok: false }
    }
    pushApproval({
      type: 'dataset_promote',
      payloadRef: datasetId,
      requesterId: auth.user.id,
      approverId: defaultApprover('champion_promote'),
      reason: reason?.trim() || '데이터셋을 Champion으로 승격합니다.',
    })
    useUiStore().toast('데이터셋 승격 품의를 상신했습니다.')
    return { ok: true }
  }

  function submitDatasetDemotion(datasetId, reason = '') {
    const auth = useAuthStore()
    const dataset = datasetById(datasetId)
    if (!dataset || dataset.stage !== 'champion') return { ok: false }
    if (!dataset.projectId || !hasProjectRole(auth.user, dataset.projectId, state.value.members, ['owner', 'coordinator'])) {
      return { ok: false }
    }
    pushApproval({
      type: 'dataset_demote',
      payloadRef: datasetId,
      requesterId: auth.user.id,
      approverId: defaultApprover('champion_promote'),
      reason: reason?.trim() || 'Champion 지위를 철회합니다.',
    })
    useUiStore().toast('데이터셋 강등 품의를 상신했습니다.')
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

  function supportPostById(id) {
    return state.value.supportPosts.find((p) => p.id === id) || null
  }

  function canSeeSupportPost(post) {
    const auth = useAuthStore()
    if (!post || !auth.user) return false
    if (post.status === 'published') return true
    return post.authorId === auth.user.id || canManageSupport(auth.user)
  }

  function visibleSupportPosts(board) {
    return state.value.supportPosts
      .filter((p) => (!board || p.board === board) && canSeeSupportPost(p))
      .slice()
      .sort((a, b) => {
        if (Boolean(b.pinned) !== Boolean(a.pinned)) return a.pinned ? -1 : 1
        const at = a.updatedAt || a.publishedAt || ''
        const bt = b.updatedAt || b.publishedAt || ''
        return bt < at ? -1 : 1
      })
  }

  function pinnedNotices() {
    const now = nowIso()
    return visibleSupportPosts('notice')
      .filter((p) => p.status === 'published' && p.pinned && (!p.expiresAt || p.expiresAt > now))
      .slice(0, 2)
  }

  function saveSupportPost(payload) {
    if (!requireAdmin()) return { ok: false }
    const ui = useUiStore()
    const title = payload.title?.trim()
    const body = payload.body?.trim()
    if (!title || !body) {
      ui.toast('제목과 본문을 입력하세요.', 'danger')
      return { ok: false }
    }
    const auth = useAuthStore()
    const board = payload.board === 'notice' ? 'notice' : 'guide'
    const status = payload.status === 'published' ? 'published' : 'draft'
    const stamp = nowIso()
    if (payload.id) {
      const existing = supportPostById(payload.id)
      if (!existing || existing.board !== board) return { ok: false }
      const wasPublished = existing.status === 'published'
      Object.assign(existing, {
        title,
        body,
        category: board === 'guide' ? payload.category || 'getting_started' : null,
        severity: board === 'notice' ? payload.severity || 'info' : null,
        pinned: Boolean(payload.pinned),
        status,
        expiresAt: board === 'notice' ? payload.expiresAt || null : null,
        updatedAt: stamp,
        publishedAt: status === 'published' ? existing.publishedAt || stamp : existing.publishedAt,
      })
      if (status === 'published' && board === 'notice' && existing.severity === 'important' && !wasPublished) {
        notifyAllUsers({
          type: 'notice_published',
          title: '공지',
          body: existing.title,
          href: `/support/notices/${existing.id}`,
        })
      }
      ui.toast(status === 'published' ? '게시했습니다.' : '임시저장했습니다.')
      return { ok: true, id: existing.id }
    }
    const id = nid(board === 'notice' ? 'nt' : 'g')
    const row = {
      id,
      board,
      title,
      body,
      category: board === 'guide' ? payload.category || 'getting_started' : null,
      severity: board === 'notice' ? payload.severity || 'info' : null,
      pinned: Boolean(payload.pinned),
      status,
      authorId: auth.user.id,
      publishedAt: status === 'published' ? stamp : null,
      updatedAt: stamp,
      expiresAt: board === 'notice' ? payload.expiresAt || null : null,
    }
    state.value.supportPosts.unshift(row)
    if (status === 'published' && board === 'notice' && row.severity === 'important') {
      notifyAllUsers({
        type: 'notice_published',
        title: '공지',
        body: row.title,
        href: `/support/notices/${row.id}`,
      })
    }
    ui.toast(status === 'published' ? '게시했습니다.' : '임시저장했습니다.')
    return { ok: true, id }
  }

  function analysisRequestById(id) {
    return state.value.analysisRequests.find((r) => r.id === id) || null
  }

  function canSeeAnalysisRequest(row) {
    const auth = useAuthStore()
    if (!row || !auth.user) return false
    if (row.requesterId === auth.user.id) return true
    if (row.status === 'draft') return canManageSupport(auth.user)
    return canViewAllAnalysisRequests(auth.user)
  }

  function visibleAnalysisRequests() {
    return state.value.analysisRequests
      .filter((r) => canSeeAnalysisRequest(r))
      .slice()
      .sort((a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''))
  }

  function requestPayload(form, userId) {
    return {
      title: form.title.trim(),
      problem: form.problem.trim(),
      businessContext: form.businessContext?.trim() || '',
      desiredOutcome: form.desiredOutcome.trim(),
      dataDescription: form.dataDescription?.trim() || '',
      dueAt: form.dueAt || null,
      relatedProjectId: form.relatedProjectId || null,
      fulfillmentIntent: form.fulfillmentIntent || 'undecided',
      requesterId: userId,
      updatedAt: nowIso(),
    }
  }

  function saveAnalysisRequest(form, id, { submit = false } = {}) {
    const auth = useAuthStore()
    const ui = useUiStore()
    if (!auth.user) return { ok: false }
    if (!form.title?.trim() || !form.problem?.trim() || !form.desiredOutcome?.trim()) {
      ui.toast('제목, 문제, 기대 결과를 입력하세요.', 'danger')
      return { ok: false }
    }
    const payload = requestPayload(form, auth.user.id)
    const status = submit ? 'submitted' : 'draft'
    if (id) {
      const existing = analysisRequestById(id)
      if (!existing) return { ok: false }
      if (existing.requesterId !== auth.user.id && !canTriageAnalysisRequest(auth.user)) {
        ui.toast('본인 요청만 수정할 수 있습니다.', 'danger')
        return { ok: false }
      }
      if (!['draft', 'submitted', 'reviewing'].includes(existing.status)) {
        ui.toast('이미 처리된 요청은 수정할 수 없습니다.', 'danger')
        return { ok: false }
      }
      Object.assign(existing, payload, { status: submit ? 'submitted' : existing.status === 'draft' ? 'draft' : existing.status })
      if (submit) {
        notifyAdmins({
          type: 'analysis_request_submitted',
          title: '분석요청 접수',
          body: existing.title,
          href: `/requests/${existing.id}`,
        })
        ui.toast('요청을 제출했습니다.')
      } else {
        ui.toast('임시저장했습니다.')
      }
      return { ok: true, id: existing.id }
    }
    const newId = nid('ar')
    state.value.analysisRequests.unshift({
      id: newId,
      ...payload,
      status,
      assigneeId: null,
      linkedProjectId: null,
      rejectReason: null,
      createdAt: nowIso(),
    })
    if (submit) {
      notifyAdmins({
        type: 'analysis_request_submitted',
        title: '분석요청 접수',
        body: payload.title,
        href: `/requests/${newId}`,
      })
      ui.toast('요청을 제출했습니다.')
    } else {
      ui.toast('임시저장했습니다.')
    }
    return { ok: true, id: newId }
  }

  function notifyAdmins(payload) {
    for (const user of state.value.users) {
      if (user.platformRole === 'dsp_admin' && user.enabled !== false) notify(user.id, payload)
    }
  }

  function notifyAllUsers(payload) {
    for (const user of state.value.users) {
      if (user.enabled !== false) notify(user.id, payload)
    }
  }

  function ensureViewer(projectId, userId) {
    if (!userId) return
    if (state.value.members.some((m) => m.projectId === projectId && m.userId === userId)) return
    state.value.members.push({
      projectId,
      userId,
      projectRole: 'viewer',
      addedBy: useAuthStore().user?.id,
      addedAt: nowIso(),
    })
  }

  function linkRequestToProject(id, projectId) {
    const ui = useUiStore()
    if (!canTriageAnalysisRequest(useAuthStore().user)) {
      ui.toast('관리자만 배정할 수 있습니다.', 'danger')
      return { ok: false }
    }
    const row = analysisRequestById(id)
    const project = projectById(projectId)
    if (!row || !project) return { ok: false }
    if (project.status !== 'active') {
      ui.toast('운영중 프로젝트만 배정할 수 있습니다.', 'danger')
      return { ok: false }
    }
    if (!['submitted', 'reviewing'].includes(row.status)) {
      ui.toast('접수·검토중 요청만 배정할 수 있습니다.', 'danger')
      return { ok: false }
    }
    row.status = 'linked_existing'
    row.linkedProjectId = project.id
    row.relatedProjectId = row.relatedProjectId || project.id
    row.assigneeId = useAuthStore().user.id
    row.updatedAt = nowIso()
    ensureViewer(project.id, row.requesterId)
    notify(row.requesterId, {
      type: 'analysis_request_updated',
      title: '분석요청이 기존 프로젝트에 배정되었습니다',
      body: `${row.title} → ${project.name}`,
      href: `/requests/${row.id}`,
    })
    if (project.ownerUserId !== row.requesterId) {
      notify(project.ownerUserId, {
        type: 'analysis_request_updated',
        title: '분석요청이 프로젝트에 배정되었습니다',
        body: row.title,
        href: `/projects/${project.id}`,
      })
    }
    ui.toast('기존 프로젝트에 배정했습니다.')
    return { ok: true }
  }

  function attachRequestToNewProject(requestId, projectId) {
    const row = analysisRequestById(requestId)
    const project = projectById(projectId)
    if (!row || !project) return
    if (!['draft', 'submitted', 'reviewing'].includes(row.status)) return
    row.status = 'new_project'
    row.linkedProjectId = project.id
    row.assigneeId = row.assigneeId || useAuthStore().user?.id || null
    row.updatedAt = nowIso()
    notify(row.requesterId, {
      type: 'analysis_request_updated',
      title: '분석요청이 새 프로젝트 생성으로 이어졌습니다',
      body: `${row.title} → ${project.name}`,
      href: `/requests/${row.id}`,
    })
  }

  function startRequestReview(id) {
    if (!canTriageAnalysisRequest(useAuthStore().user)) return { ok: false }
    const row = analysisRequestById(id)
    if (!row || row.status !== 'submitted') return { ok: false }
    row.status = 'reviewing'
    row.assigneeId = useAuthStore().user.id
    row.updatedAt = nowIso()
    return { ok: true }
  }

  function rejectAnalysisRequest(id, reason) {
    const ui = useUiStore()
    if (!canTriageAnalysisRequest(useAuthStore().user)) {
      ui.toast('관리자만 반려할 수 있습니다.', 'danger')
      return { ok: false }
    }
    const row = analysisRequestById(id)
    if (!row) return { ok: false }
    if (!reason?.trim()) {
      ui.toast('반려 사유를 입력하세요.', 'danger')
      return { ok: false }
    }
    if (!['submitted', 'reviewing'].includes(row.status)) {
      ui.toast('접수·검토중 요청만 반려할 수 있습니다.', 'danger')
      return { ok: false }
    }
    row.status = 'rejected'
    row.rejectReason = reason.trim()
    row.assigneeId = useAuthStore().user.id
    row.updatedAt = nowIso()
    notify(row.requesterId, {
      type: 'analysis_request_updated',
      title: '분석요청이 반려되었습니다',
      body: row.title,
      href: `/requests/${row.id}`,
    })
    ui.toast('요청을 반려했습니다.')
    return { ok: true }
  }

  function completeAnalysisRequest(id) {
    const ui = useUiStore()
    if (!canTriageAnalysisRequest(useAuthStore().user)) {
      ui.toast('관리자만 완료할 수 있습니다.', 'danger')
      return { ok: false }
    }
    const row = analysisRequestById(id)
    if (!row || !['linked_existing', 'new_project'].includes(row.status)) {
      ui.toast('배정된 요청만 완료할 수 있습니다.', 'danger')
      return { ok: false }
    }
    row.status = 'completed'
    row.updatedAt = nowIso()
    notify(row.requesterId, {
      type: 'analysis_request_updated',
      title: '분석요청이 완료되었습니다',
      body: row.title,
      href: `/requests/${row.id}`,
    })
    ui.toast('요청을 완료했습니다.')
    return { ok: true }
  }

  function search(query) {
    const q = query.trim().toLowerCase()
    if (!q) {
      return { project: [], model: [], dataset: [], approval: [], guide: [], notice: [], analysisRequest: [] }
    }
    const vis = new Set(visibleProjects().map((p) => p.id))
    return {
      project: visibleProjects().filter((p) => p.name.toLowerCase().includes(q) || p.goal.includes(query)),
      model: visibleModels().filter((m) => `${m.name} ${m.version}`.toLowerCase().includes(q)),
      dataset: state.value.datasets.filter(
        (d) => d.name.toLowerCase().includes(q) || d.ref.toLowerCase().includes(q),
      ),
      approval: state.value.approvals.filter((a) => {
        const target = approvalTarget(a)
        const inScope = target.projectId
          ? vis.has(target.projectId)
          : isApprover(useAuthStore().user)
        if (!inScope) return false
        const hay = `${a.id} ${a.type} ${target.name} ${a.fromClass || ''} ${a.toClass || ''}`.toLowerCase()
        return hay.includes(q)
      }),
      guide: visibleSupportPosts('guide').filter((p) => `${p.title} ${p.body}`.toLowerCase().includes(q)),
      notice: visibleSupportPosts('notice').filter((p) => `${p.title} ${p.body}`.toLowerCase().includes(q)),
      analysisRequest: visibleAnalysisRequests().filter((r) => `${r.title} ${r.problem}`.toLowerCase().includes(q)),
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

  function savePermission(payload) {
    if (!requireAdmin()) return { ok: false }
    const ui = useUiStore()
    const name = payload.name?.trim()
    if (!name) {
      ui.toast('권한 이름을 입력하세요.', 'danger')
      return { ok: false }
    }
    const pageKeys = Array.from(new Set(payload.pageKeys || []))
    const apiKeys = Array.from(new Set(payload.apiKeys || []))
    if (payload.id) {
      const existing = permissionById(payload.id)
      if (!existing) return { ok: false }
      Object.assign(existing, { name, description: payload.description?.trim() || '', pageKeys, apiKeys })
      ui.toast('권한을 저장했습니다.')
      return { ok: true, id: existing.id }
    }
    if (state.value.permissions.some((p) => p.name === name)) {
      ui.toast('같은 이름의 권한이 이미 있습니다.', 'danger')
      return { ok: false }
    }
    const id = nid('perm')
    state.value.permissions.push({
      id,
      name,
      description: payload.description?.trim() || '',
      pageKeys,
      apiKeys,
      enabled: true,
      createdAt: nowIso(),
    })
    ui.toast('권한을 추가했습니다.')
    return { ok: true, id }
  }

  function setPermissionEnabled(id, enabled) {
    if (!requireAdmin()) return { ok: false }
    const existing = permissionById(id)
    if (!existing) return { ok: false }
    existing.enabled = enabled
    useUiStore().toast(enabled ? '권한을 활성했습니다.' : '권한을 비활성했습니다.')
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
    permissions,
    codes,
    computeClasses,
    supportPosts,
    analysisRequests,
    batchJobs,
    batchRuns,
    usageDaily,
    usageByUser,
    usageByPage,
    usageByApi,
    usageSummary,
    settings: computed(() => state.value.settings),
    userById,
    projectById,
    modelById,
    datasetById,
    approvalById,
    permissionById,
    provisionById,
    visibleProjects,
    visibleModels,
    provisionRollup,
    approvalTarget,
    hasInFlightComputeUpgrade,
    pendingComputeUpgrade,
    workspaceOf,
    submitComputeUpgrade,
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
    batchJobById,
    batchRunsFor,
    setBatchJobEnabled,
    retryBatchJob,
    addMember,
    changeMemberRole,
    removeMember,
    requestRetrain,
    registerChallenger,
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
    savePermission,
    setPermissionEnabled,
    supportPostById,
    visibleSupportPosts,
    pinnedNotices,
    canSeeSupportPost,
    saveSupportPost,
    analysisRequestById,
    visibleAnalysisRequests,
    canSeeAnalysisRequest,
    saveAnalysisRequest,
    linkRequestToProject,
    startRequestReview,
    rejectAnalysisRequest,
    completeAnalysisRequest,
    reset,
  }
})
