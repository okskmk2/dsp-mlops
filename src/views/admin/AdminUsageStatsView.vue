<script setup>
import { computed } from "vue";
import DsBars from "../../components/charts/DsBars.vue";
import DsCard from "../../components/ui/DsCard.vue";
import DsChip from "../../components/ui/DsChip.vue";
import DsKpi from "../../components/ui/DsKpi.vue";
import DsPageHeader from "../../components/ui/DsPageHeader.vue";
import DsTable from "../../components/ui/DsTable.vue";
import DsLineChart from "../../components/charts/DsLineChart.vue";
import { chartColor } from "../../lib/chart";
import { useDspStore } from "../../stores/dsp";

const dsp = useDspStore();

const summary = computed(() => dsp.usageSummary());

const dailyChart = computed(() => ({
  labels: dsp.usageDaily.map((d) => d.date.slice(5)),
  series: [
    { label: "페이지뷰", values: dsp.usageDaily.map((d) => d.pageViews) },
    { label: "API 호출", values: dsp.usageDaily.map((d) => d.apiCalls) },
  ],
}));

const topPages = computed(() => {
  const max = Math.max(1, ...dsp.usageByPage.map((p) => p.views));
  return dsp.usageByPage
    .slice()
    .sort((a, b) => b.views - a.views)
    .map((p, idx) => ({
      id: p.path,
      label: p.label,
      valueLabel: `${p.views.toLocaleString()}회`,
      pct: Math.round((p.views / max) * 100),
      color: chartColor(idx),
    }));
});

const apiRows = computed(() =>
  dsp.usageByApi
    .map((a) => ({ ...a, id: `${a.method} ${a.path}` }))
    .sort((a, b) => b.calls - a.calls),
);

function errorTone(rate) {
  if (rate >= 1) return "danger";
  if (rate >= 0.5) return "warning";
  return "neutral";
}

const columns = [
  { key: "method", label: "메서드" },
  { key: "path", label: "API", strong: true },
  { key: "calls", label: "호출수", numeric: true },
  { key: "avgLatencyMs", label: "평균 응답시간", numeric: true },
  { key: "errorRate", label: "오류율" },
];
</script>

<template>
  <DsPageHeader
    title="사용자 사용 통계"
    description="최근 사용자 활동을 페이지뷰와 API 호출 기준으로 집계합니다."
  />

  <section class="kpis">
    <DsKpi
      label="총 페이지뷰"
      :value="summary.totalPageViews.toLocaleString()"
    />
    <DsKpi
      label="총 API 호출"
      :value="summary.totalApiCalls.toLocaleString()"
    />
    <DsKpi label="활성 사용자" :value="summary.activeUserCount" />
  </section>

  <DsCard>
    <template #title>일별 추이</template>
    <DsLineChart
      :labels="dailyChart.labels"
      :series="dailyChart.series"
      :height="220"
    />
  </DsCard>

  <div class="two">
    <DsCard>
      <template #title>상위 조회 페이지</template>
      <DsBars :items="topPages" />
    </DsCard>

    <DsCard>
      <template #title>API 통계</template>
      <DsTable
        :columns="columns"
        :rows="apiRows"
        row-key="id"
        empty-title="API 호출 통계가 없습니다"
      >
        <template #path="{ row }"
          ><span class="mono">{{ row.path }}</span></template
        >
        <template #calls="{ row }">{{ row.calls.toLocaleString() }}</template>
        <template #avgLatencyMs="{ row }">{{ row.avgLatencyMs }}ms</template>
        <template #errorRate="{ row }">
          <DsChip :tone="errorTone(row.errorRate)"
            >{{ row.errorRate.toFixed(1) }}%</DsChip
          >
        </template>
      </DsTable>
    </DsCard>
  </div>
</template>

<style scoped>
.kpis {
  display: grid;
  gap: var(--ds-section-gap);
  grid-template-columns: repeat(3, 1fr);
  margin: 0 0 var(--ds-section-gap);
}

.two {
  display: grid;
  gap: var(--ds-section-gap);
  grid-template-columns: 1fr 1.4fr;
  margin-top: var(--ds-section-gap);
}
</style>
