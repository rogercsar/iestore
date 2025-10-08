<template>
  <div id="public-app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// Layout público sem sidebar/navbar
</script>

<style>
#public-app {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
