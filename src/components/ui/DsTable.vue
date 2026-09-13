<script setup>
import DsEmpty from './DsEmpty.vue'

defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  rowKey: { type: String, default: 'id' },
  emptyTitle: { type: String, default: '표시할 항목이 없습니다' },
})

defineEmits(['row-click'])
</script>

<template>
  <div class="ds-table-wrap">
    <table class="ds-table">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :class="{ 'is-num': col.numeric }"
            :style="col.width ? { width: col.width } : undefined"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!rows.length">
          <td :colspan="columns.length">
            <DsEmpty :title="emptyTitle" />
          </td>
        </tr>
        <template v-else>
          <tr
            v-for="row in rows"
            :key="row[rowKey]"
            class="is-click"
            @click="$emit('row-click', row)"
          >
          <td
            v-for="col in columns"
            :key="col.key"
            :class="{ 'is-num tabular': col.numeric, 'is-strong': col.strong }"
          >
            <slot :name="col.key" :row="row" :value="row[col.key]">
              {{ row[col.key] ?? '—' }}
            </slot>
          </td>
        </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.ds-table-wrap {
  background: var(--ds-surface);
  border: 1px solid var(--ds-border);
  overflow: auto;
}

.ds-table {
  min-width: 100%;
}

.ds-table th {
  background: var(--ds-surface-sunken);
  color: var(--ds-text-secondary);
  font-size: var(--ds-font-label);
  font-weight: 600;
  height: 36px;
  line-height: 1.35;
  padding: 0 var(--ds-space-4);
  position: sticky;
  text-align: left;
  top: 0;
  white-space: nowrap;
}

.ds-table td {
  border-bottom: 1px solid var(--ds-border-subtle);
  font-size: var(--ds-font-label);
  font-weight: 400;
  line-height: 1.35;
  height: 40px;
  padding: 8px var(--ds-space-4);
  vertical-align: middle;
}

.ds-table tbody tr:hover td {
  background: var(--ds-canvas-subtle);
}

.ds-table .is-num {
  text-align: right;
}

.ds-table .is-strong {
  font-weight: 600;
}

.ds-table tbody tr.is-click {
  cursor: pointer;
}
</style>
