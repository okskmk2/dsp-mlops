<script setup>
import { computed } from 'vue'
import { avatarColor, avatarInitial } from '../../lib/avatar'

const props = defineProps({
  name: { type: String, default: '' },
  size: { type: Number, default: 28 },
})

const initial = computed(() => avatarInitial(props.name))
const bg = computed(() => avatarColor(props.name))
</script>

<template>
  <span
    class="ds-avatar"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      background: bg,
      fontSize: `${Math.max(12, Math.round(size * 0.45))}px`,
    }"
    aria-hidden="true"
  >
    {{ initial }}
  </span>
</template>

<style scoped>
.ds-avatar {
  align-items: center;
  border-radius: 999px;
  color: #ffffff;
  display: inline-flex;
  flex: none;
  font-weight: 600;
  justify-content: center;
  line-height: 1;
}
</style>
