<script setup>
defineProps({
  is: { type: [Object, Function], required: true },
  size: { type: Number, default: 24 },
})
</script>

<template>
  <component
    :is="is"
    class="ds-icon"
    :size="size"
    :stroke-width="1.75"
    aria-hidden="true"
  />
</template>

<style scoped>
.ds-icon {
  display: block;
  flex: none;
}
</style>
