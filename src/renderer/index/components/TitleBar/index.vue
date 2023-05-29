<template>
  <div class="titlebar-wrap region-drag">
    <ul v-if="isWindows" class="titlebar-list">
      <li class="titlebar-item not-drag auto-left" @click="minimizeWindow"><IconMinimize /></li>
      <li class="titlebar-item not-drag" @click="toggleMaximize">
        <IconMaximize v-if="!isMaximized && !isFullScreen" /> <IconRestore v-else />
      </li>
      <li class="titlebar-item is-close not-drag" @click="closeWindow"><IconClose /></li>
    </ul>
  </div>
</template>

<script setup>
import IconClose from '@/renderer/index/components/SvgIcon/IconClose.vue';
import IconMaximize from '@/renderer/index/components/SvgIcon/IconMaximize.vue';
import IconMinimize from '@/renderer/index/components/SvgIcon/IconMinimize.vue';
import IconRestore from '@/renderer/index/components/SvgIcon/IconRestore.vue';
import {onBeforeUnmount, onMounted, ref} from 'vue';

const isFullScreen = ref(false);
const isMaximized = ref(false);
const isWindows = ref(false);

const minimizeWindow = () => {
  window.electronAPI.invoke('titlebar', {type: 'minimizeWindow'});
};

const toggleMaximize = () => {
  if (isFullScreen.value) {
    window.electronAPI.invoke('titlebar', {type: 'setFullScreen', isFullScreen: false});
    return;
  }
  window.electronAPI.invoke('titlebar', {type: 'toggleMaximize'});
};

const closeWindow = () => {
  window.electronAPI.invoke('titlebar', {type: 'closeWindow'});
};

let removeListener = null;

onMounted(() => {
  window.electronAPI.invoke('titlebar', {type: 'getIsWindwos'}).then((value) => {
    isWindows.value = value;
  });

  removeListener = window.electronAPI.receive('titlebar', (event, data = {}) => {
    if (data.type === 'maximize') {
      isMaximized.value = data.isMaximized;
    }

    if (data.type === 'fullscreen') {
      isFullScreen.value = data.isFullScreen;
    }
  });
});

onBeforeUnmount(() => {
  removeListener && removeListener();
});
</script>

<style lang="scss" scoped>
.titlebar-wrap {
  height: 40px;
  background-color: #e7eaed;
  color: #141414;
  box-sizing: border-box;
}

.titlebar-list {
  width: 100vw;
  height: inherit;
  display: flex;
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.auto-left {
  margin-left: auto;
}

.titlebar-item {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  cursor: pointer;
  &:hover {
    background: rgba(217, 217, 217, 0.7);
  }
  &.is-close:hover {
    color: #fff;
    background: rgba(232, 17, 35, 0.7);
  }
}

.titlebar-item:hover {
  text-decoration: underline;
}
</style>
