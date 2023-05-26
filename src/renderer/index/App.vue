<template>
  <router-view></router-view>
</template>

<script setup></script>

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

#app {
  display: flex;
  flex-flow: row nowrap;
}
</style>
