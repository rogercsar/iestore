<template>
  <div class="section">
    <h2 class="section-title">{{ title }}</h2>
    <div class="section-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
}

defineProps<Props>()
</script>

<style scoped>
.section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 1rem;
  padding-left: 0.5rem;
  border-left: 4px solid var(--primary);
}

.section-content {
  /* Content styling handled by child components */
}
</style>
