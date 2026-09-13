<script setup>
defineProps({
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  required: Boolean,
})
</script>

<template>
  <label class="ds-field">
    <span v-if="label" class="ds-label">
      {{ label }}
      <span v-if="required" class="req" aria-hidden="true">*</span>
    </span>
    <slot />
    <span v-if="error" class="ds-field-error">{{ error }}</span>
    <span v-else-if="hint" class="ds-meta">{{ hint }}</span>
  </label>
</template>

<style scoped>
.ds-field {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-2);
}

.req {
  color: var(--ds-danger);
  margin-left: 0.2em;
}

.ds-field-error {
  color: var(--ds-danger);
  font-size: var(--ds-font-meta);
  line-height: 1.4;
}
</style>
