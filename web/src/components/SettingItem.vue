<template>
  <div class="setting-item" @click="handleClick">
    <div class="setting-icon">
      {{ icon }}
    </div>
    <div class="setting-content">
      <div class="setting-title">{{ title }}</div>
      <div class="setting-subtitle">{{ subtitle }}</div>
    </div>
    <div class="setting-action">
      <div v-if="hasToggle" class="toggle-container">
        <input
          type="checkbox"
          :checked="toggleValue"
          @change="handleToggleChange"
          class="toggle-input"
        />
        <div class="toggle-slider" :class="{ active: toggleValue }"></div>
      </div>
      <div v-else class="arrow-icon">›</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle: string
  icon: string
  hasToggle?: boolean
  toggleValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hasToggle: false,
  toggleValue: false
})

const emit = defineEmits<{
  toggleChange: [value: boolean]
  itemPress: []
}>()

const handleClick = () => {
  if (!props.hasToggle) {
    emit('itemPress')
  }
}

const handleToggleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('toggleChange', target.checked)
}
</script>

<style scoped>
.setting-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.setting-item:hover {
  background-color: var(--gray-50);
}

.setting-icon {
  font-size: 1.5rem;
  margin-right: 1rem;
  width: 2rem;
  text-align: center;
}

.setting-content {
  flex: 1;
}

.setting-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 0.25rem;
}

.setting-subtitle {
  font-size: 0.875rem;
  color: var(--gray-500);
}

.setting-action {
  display: flex;
  align-items: center;
}

.toggle-container {
  position: relative;
  width: 3rem;
  height: 1.5rem;
}

.toggle-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: pointer;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--gray-300);
  border-radius: 1rem;
  transition: background-color 0.2s ease;
}

.toggle-slider.active {
  background-color: var(--primary);
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 1.25rem;
  width: 1.25rem;
  left: 0.125rem;
  bottom: 0.125rem;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s ease;
}

.toggle-slider.active::before {
  transform: translateX(1.5rem);
}

.arrow-icon {
  font-size: 1.5rem;
  color: var(--gray-400);
  font-weight: 300;
}
</style>
