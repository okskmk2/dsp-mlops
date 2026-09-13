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
import DriftView from '../views/DriftView.vue'
import HomeView from '../views/HomeView.vue'
import LineageNodeView from '../views/LineageNodeView.vue'
import LineageView from '../views/LineageView.vue'
import LoginView from '../views/LoginView.vue'
import ModelDetailView from '../views/ModelDetailView.vue'
import ModelPromoteView from '../views/ModelPromoteView.vue'
import ModelPromotionsView from '../views/ModelPromotionsView.vue'
import ModelRegistryView from '../views/ModelRegistryView.vue'
import MonitorStatusView from '../views/MonitorStatusView.vue'
import NotificationsView from '../views/NotificationsView.vue'
import ProjectCostView from '../views/ProjectCostView.vue'
import ProjectCreateView from '../views/ProjectCreateView.vue'
import ProjectListView from '../views/ProjectListView.vue'
import ProjectModelsView from '../views/ProjectModelsView.vue'
import ProjectOverviewView from '../views/ProjectOverviewView.vue'
import ProjectResourcesView from '../views/ProjectResourcesView.vue'
import ProjectTeamView from '../views/ProjectTeamView.vue'
import SearchView from '../views/SearchView.vue'
import SettingsView from '../views/SettingsView.vue'
import ThresholdsView from '../views/ThresholdsView.vue'
import AdminCodeGroupsView from '../views/admin/AdminCodeGroupsView.vue'
import AdminCodesView from '../views/admin/AdminCodesView.vue'
import AdminPermissionsView from '../views/admin/AdminPermissionsView.vue'
import AdminUsersView from '../views/admin/AdminUsersView.vue'
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
        { path: 'projects/:id/team', component: ProjectTeamView },
        { path: 'projects/:id/resources/:provisionId/upgrade', component: ComputeUpgradeView },
        { path: 'projects/:id/resources', component: ProjectResourcesView },
        { path: 'projects/:id/cost', component: ProjectCostView },
        { path: 'projects/:id/models', component: ProjectModelsView },
        { path: 'models', component: ModelRegistryView },
        { path: 'models/promotions', component: ModelPromotionsView },
        { path: 'models/:id', component: ModelDetailView },
        { path: 'models/:id/promote', component: ModelPromoteView },
        { path: 'monitoring', component: MonitorStatusView },
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
        { path: 'admin/codes', component: AdminCodeGroupsView, meta: { admin: true } },
        { path: 'admin/codes/:group', component: AdminCodesView, meta: { admin: true } },
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
  return true
})

router.afterEach(() => {
  const ui = useUiStore()
  ui.closeOverlays()
})

export default router
