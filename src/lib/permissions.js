export function canListAllProjects(user) {
  return user?.platformRole === 'dsp_admin' || user?.platformRole === 'officer'
}

export function canManageDspSettings(user) {
  return user?.platformRole === 'dsp_admin'
}

export function canRetryProvisioning(user) {
  return user?.platformRole === 'dsp_admin'
}

export function canSeeOrgCostFull(user) {
  return user?.platformRole === 'dsp_admin' || user?.platformRole === 'officer'
}

export function isApprover(user) {
  return Boolean(user?.isApprover)
}

export function membership(members, projectId, userId) {
  return members.find((m) => m.projectId === projectId && m.userId === userId) ?? null
}

export function projectRoleOf(user, projectId, members) {
  if (!user) return null
  const m = membership(members, projectId, user.id)
  return m?.projectRole ?? null
}

export function canViewProject(user, projectId, members) {
  if (!user) return false
  if (user.platformRole === 'dsp_admin' || user.platformRole === 'officer') return true
  return Boolean(membership(members, projectId, user.id))
}

export function hasProjectRole(user, projectId, members, roles) {
  const role = projectRoleOf(user, projectId, members)
  return Boolean(role && roles.includes(role))
}

export function canOpenCloud(user, project, provisions, members) {
  if (!user || !project || project.status !== 'active') return false
  if (!hasProjectRole(user, project.id, members, ['owner', 'coordinator', 'member'])) return false
  return provisions.some((p) => p.projectId === project.id && p.status === 'succeeded')
}

export function canWriteProject(user, project, members, action) {
  if (!user || !project) return false
  if (project.status === 'closed') return false
  const role = projectRoleOf(user, project.id, members)
  const map = {
    editMetaSubmit: ['owner'],
    budgetDeadlineSubmit: ['owner'],
    closeProjectSubmit: ['owner'],
    manageMembersLimited: ['owner', 'coordinator'],
    assignOwnerOrCoordinator: ['owner'],
    setMonitorThresholds: ['owner', 'coordinator'],
    requestRetrain: ['owner', 'coordinator', 'member'],
    registerChallenger: ['owner', 'coordinator', 'member'],
    submitPromotion: ['owner', 'coordinator'],
    submitDemotion: ['owner', 'coordinator'],
    declareContamination: ['owner', 'coordinator', 'member'],
  }
  return Boolean(role && (map[action] ?? []).includes(role))
}
