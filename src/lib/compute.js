export const DEFAULT_COMPUTE_CLASS = {
  azure_ml: 'aml_cpu_s',
  azure_databricks: 'adb_jobs_s',
}

export function computeClassById(classes, id) {
  return classes.find((c) => c.id === id) || null
}

export function computeClassLabel(classes, id) {
  return computeClassById(classes, id)?.label || id || '—'
}

export function classesForPlatform(classes, platform) {
  return classes.filter((c) => c.platform === platform).slice().sort((a, b) => a.tier - b.tier)
}

export function currentClassId(provision) {
  return provision?.resourceSpec?.computeClass || DEFAULT_COMPUTE_CLASS[provision?.platform] || null
}

export function higherClasses(classes, provision) {
  const current = computeClassById(classes, currentClassId(provision))
  const list = classesForPlatform(classes, provision?.platform)
  if (!current) return list
  return list.filter((c) => c.monthlyCost > current.monthlyCost)
}

export function monthlyDelta(fromClass, toClass) {
  return (toClass?.monthlyCost || 0) - (fromClass?.monthlyCost || 0)
}

export function isWorkspaceProvision(item) {
  return (item?.kind || 'workspace') === 'workspace'
}
