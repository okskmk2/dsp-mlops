import { createRouter, createWebHistory } from 'vue-router'
import AppShell from '../components/layout/AppShell.vue'
import { useAuthStore } from '../stores/auth'
import { useDspStore } from '../stores/dsp'
import { useUiStore } from '../stores/ui'
import ApprovalDetailView from '../views/ApprovalDetailView.vue'
import ApprovalsView from '../views/ApprovalsView.vue'
import ComputeUpgradeView from '../views/ComputeUpgradeView.vue'
import ContaminationView from '../views/ContaminationView.vue'
import CostResourcesView from '../views/CostResourcesView.vue'
import CostView from '../views/CostView.vue'
import DatasetDetailView from '../views/DatasetDetailView.vue'
import DatasetDemoteView from '../views/DatasetDemoteView.vue'
import DatasetPromoteView from '../views/DatasetPromoteView.vue'
import DatasetRegistryView from '../views/DatasetRegistryView.vue'
import DriftView from '../views/DriftView.vue'
import HomeView from '../views/HomeView.vue'
import LineageNodeView from '../views/LineageNodeView.vue'
import LineageView from '../views/LineageView.vue'
import LoginView from '../views/LoginView.vue'
import ModelDetailView from '../views/ModelDetailView.vue'
import ModelDemoteView from '../views/ModelDemoteView.vue'
import ModelLineageView from '../views/ModelLineageView.vue'
import ModelHistoryView from '../views/ModelHistoryView.vue'
import ModelPromoteView from '../views/ModelPromoteView.vue'
import ModelRegistryView from '../views/ModelRegistryView.vue'
import ModelPromoteRequestView from '../views/ModelPromoteRequestView.vue'
import ModelStakeholdersView from '../views/ModelStakeholdersView.vue'
import MLOpsView from '../views/MLOpsView.vue'
import MonitorStatusView from '../views/MonitorStatusView.vue'
import NotificationsView from '../views/NotificationsView.vue'
import ProjectCostView from '../views/ProjectCostView.vue'
import ProjectCreateView from '../views/ProjectCreateView.vue'
import ProjectListView from '../views/ProjectListView.vue'
import ProjectModelsView from '../views/ProjectModelsView.vue'
import ProjectOverviewView from '../views/ProjectOverviewView.vue'
import ProjectInfoView from '../views/ProjectInfoView.vue'
import ProjectResourcesView from '../views/ProjectResourcesView.vue'
import ProjectTeamView from '../views/ProjectTeamView.vue'
import ResourceUpgradeRequestView from '../views/ResourceUpgradeRequestView.vue'
import ProjectMonitoringView from '../views/ProjectMonitoringView.vue'
import SearchView from '../views/SearchView.vue'
import SettingsView from '../views/SettingsView.vue'
import ThresholdsView from '../views/ThresholdsView.vue'
import AdminCodeGroupsView from '../views/admin/AdminCodeGroupsView.vue'
import AdminCodesView from '../views/admin/AdminCodesView.vue'
import AdminPermissionsView from '../views/admin/AdminPermissionsView.vue'
import AdminPermissionEditView from '../views/admin/AdminPermissionEditView.vue'
import AdminUsersView from '../views/admin/AdminUsersView.vue'
import AdminBatchJobsView from '../views/admin/AdminBatchJobsView.vue'
import AdminUsageStatsView from '../views/admin/AdminUsageStatsView.vue'
import AnalysisRequestDetailView from '../views/AnalysisRequestDetailView.vue'
import AnalysisRequestFormView from '../views/AnalysisRequestFormView.vue'
import AnalysisRequestListView from '../views/AnalysisRequestListView.vue'
import SupportEditView from '../views/SupportEditView.vue'
import SupportListView from '../views/SupportListView.vue'
import SupportPostView from '../views/SupportPostView.vue'
import { canManageDspSettings } from '../lib/permissions'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { left: 0, top: 0 }
  },
  routes: [
    { path: '/login', component: LoginView, meta: { public: true } },
    {
      path: '/',
      component: AppShell,
      children: [
        { path: '', redirect: '/home' },
        { path: 'home', component: HomeView },
        { path: 'projects', component: ProjectListView },
        { path: 'projects/new', component: ProjectCreateView },
        { path: 'projects/:id', component: ProjectOverviewView },
        { path: 'projects/:id/info', component: ProjectInfoView },
        { path: 'projects/:id/team', component: ProjectTeamView },
        { path: 'projects/:id/resources/:provisionId/upgrade', component: ComputeUpgradeView },
        { path: 'projects/:id/resources', component: ProjectResourcesView },
        { path: 'projects/:id/cost', redirect: (to) => `/projects/${to.params.id}/resources` },
        { path: 'resources/upgrade-request', component: ResourceUpgradeRequestView },
        { path: 'projects/:id/models', component: ProjectModelsView },
        { path: 'projects/:id/monitoring', component: ProjectMonitoringView },
        { path: 'models', component: ModelRegistryView },
        { path: 'models/promote-request', component: ModelPromoteRequestView },
        { path: 'models/:id', component: ModelDetailView },
        { path: 'models/:id/lineage', component: ModelLineageView },
        { path: 'models/:id/stakeholders', component: ModelStakeholdersView },
        { path: 'models/:id/history', component: ModelHistoryView },
        { path: 'models/:id/promote', component: ModelPromoteView },
        { path: 'models/:id/demote', component: ModelDemoteView },
        { path: 'datasets', component: DatasetRegistryView },
        { path: 'datasets/:id', component: DatasetDetailView },
        { path: 'datasets/:id/promote', component: DatasetPromoteView },
        { path: 'datasets/:id/demote', component: DatasetDemoteView },
        { path: 'monitoring', component: MonitorStatusView },
        { path: 'ml-ops', component: MLOpsView },
        { path: 'monitoring/thresholds', component: ThresholdsView },
        { path: 'monitoring/drift', component: DriftView },
        { path: 'cost', component: CostView },
        { path: 'cost/resources', component: CostResourcesView },
        { path: 'lineage', component: LineageView },
        { path: 'lineage/nodes/:nodeId', component: LineageNodeView },
        { path: 'lineage/contamination', component: ContaminationView },
        { path: 'approvals', component: ApprovalsView },
        { path: 'approvals/:id', component: ApprovalDetailView },
        { path: 'notifications', component: NotificationsView },
        { path: 'support/guides', component: SupportListView, meta: { board: 'guide' } },
        { path: 'support/guides/new', component: SupportEditView, meta: { board: 'guide', admin: true } },
        { path: 'support/guides/:id/edit', component: SupportEditView, meta: { board: 'guide', admin: true } },
        { path: 'support/guides/:id', component: SupportPostView, meta: { board: 'guide' } },
        { path: 'support/notices', component: SupportListView, meta: { board: 'notice' } },
        { path: 'support/notices/new', component: SupportEditView, meta: { board: 'notice', admin: true } },
        { path: 'support/notices/:id/edit', component: SupportEditView, meta: { board: 'notice', admin: true } },
        { path: 'support/notices/:id', component: SupportPostView, meta: { board: 'notice' } },
        { path: 'requests', component: AnalysisRequestListView },
        { path: 'requests/new', component: AnalysisRequestFormView },
        { path: 'requests/:id', component: AnalysisRequestDetailView },
        { path: 'search', component: SearchView },
        { path: 'settings', component: SettingsView },
        { path: 'admin/users', component: AdminUsersView, meta: { admin: true } },
        { path: 'admin/permissions', component: AdminPermissionsView, meta: { admin: true } },
        { path: 'admin/permissions/new', component: AdminPermissionEditView, meta: { admin: true } },
        { path: 'admin/permissions/:id', component: AdminPermissionEditView, meta: { admin: true } },
        { path: 'admin/codes', component: AdminCodeGroupsView, meta: { admin: true } },
        { path: 'admin/codes/:group', component: AdminCodesView, meta: { admin: true } },
        { path: 'admin/batch', component: AdminBatchJobsView, meta: { admin: true } },
        { path: 'admin/usage', component: AdminUsageStatsView, meta: { admin: true } },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/home' },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.path === '/login' && auth.isLoggedIn) return '/home'
  if (to.meta.admin && !canManageDspSettings(auth.user)) return '/home'

  const dsp = useDspStore()
  if (to.params.id && String(to.path).startsWith('/projects/')) {
    if (!dsp.canSeeProject(to.params.id)) return '/projects'
  }
  if (to.params.id && String(to.path).startsWith('/models/')) {
    const model = dsp.modelById(to.params.id)
    if (!model || !dsp.canSeeProject(model.projectId)) return '/models'
  }
  if (to.params.id && String(to.path).startsWith('/datasets/')) {
    const dataset = dsp.datasetById(to.params.id)
    if (!dataset) return '/lineage'
  }
  return true
})

router.afterEach(() => {
  const ui = useUiStore()
  ui.closeOverlays()
})

export default router
