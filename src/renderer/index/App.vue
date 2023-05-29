<template>
  <TitleBar class="titlebar-container"></TitleBar>
  <div class="content-wrap">
    <router-view></router-view>
  </div>
</template>

<script setup>
import TitleBar from '@/renderer/index/components/TitleBar/index.vue';
</script>

<style>
html,
body {
  padding: 0;
  margin: 0;
}

img {
  -moz-user-select: none;
  -webkit-user-drag: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* 禁止选中 */
img {
  pointer-events: none;
}

.region-drag {
  -webkit-app-region: drag;
}

.not-drag {
  -webkit-app-region: no-drag;
}

#app {
  display: flex;
  flex-flow: column nowrap;
  height: 100vh;
  width: 100vw;
  overflow-y: auto;
  overflow-x: hidden;
}

.titlebar-container {
  display: flex;
  flex-flow: row nowrap;
  height: 40px;
}

.content-wrap {
  display: flex;
  flex-flow: row nowrap;
}
</style>
