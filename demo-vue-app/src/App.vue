<script setup>
import AppHeader from './components/AppHeader.vue';
import Sidebar from './components/Sidebar.vue';
import BoardView from './components/BoardView.vue';
</script>

<template>
  <div class="app">
    <AppHeader />
    <div class="app-body">
      <Sidebar />
      <BoardView />
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f0f2f5;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}
</style>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  background: #f0f2f5;
}

.app-body {
  display: flex;
  flex: 1;
  min-height: 0;
}
</style>
