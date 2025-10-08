<template>
  <div :class="['card', shadowClass]">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  shadow?: 'sm' | 'md' | 'lg' | 'xl'
  padding?: string
}

const props = withDefaults(defineProps<Props>(), {
  shadow: 'sm',
  padding: '1rem'
})

const shadowClass = computed(() => {
  switch (props.shadow) {
    case 'sm': return 'shadow-sm'
    case 'md': return 'shadow-md'
    case 'lg': return 'shadow-lg'
    case 'xl': return 'shadow-xl'
    default: return 'shadow-sm'
  }
})
</script>

<style scoped>
.card {
  background-color: white;
  border-radius: 0.75rem;
  border: 1px solid var(--gray-200);
  padding: v-bind(padding);
  transition: all 0.2s ease;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.card:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>
