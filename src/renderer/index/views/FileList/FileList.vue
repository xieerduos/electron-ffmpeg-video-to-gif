<template>
  <Navbar />
  <div class="content-container" @dragover.prevent @dragenter.prevent @drop="handleDrop">
    <FileOperations
      :multipleSelection="multipleSelection"
      :handleCancel="handleCancel"
      :handleClick="handleClick"
      :handleClear="(selection) => handleClear(selection, true)"
      :handleStart="handleStart"
      :handleStop="(selection) => handleClear(selection, false)"></FileOperations>
    <FileTable
      ref="multipleTableRef"
      :data="fileList"
      :total="fileList.length"
      @selection-change="handleSelectionChange"></FileTable>
    <input type="file" ref="fileElem" multiple accept="video/*" @change="handleFiles" style="display: none" />
  </div>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref} from 'vue';
import Navbar from '@/renderer/index/components/Navbar/index.vue';
import getNextId from '@/renderer/index/utils/getNextId.js';
import {VIDEO_TO_GIF} from '@/renderer/index/utils/constant.js';
import FileTable from './FileTable.vue';
import FileOperations from './FileOperations.vue';
import {storeToRefs} from 'pinia';
import {useFileStore} from '@/renderer/index/store/fileStore.js';
import {handleSendToMain, handleStop} from '@/renderer/index/composables/useFileList.js';
import queueManager from '@/renderer/index/composables/queueManager.js';

const fileElem = ref();

const fileStore = useFileStore();
const {fileList} = storeToRefs(fileStore);

const multipleSelection = ref([]);
const multipleTableRef = ref();

const handleClick = () => {
  fileElem.value.click();
};

const handleFiles = (event) => {
  const files = Array.from(event.target.files);
  handleVideoFiles(files);
  console.log('hanldeFiles', fileElem.value.value);
  // fileElem.value.value = [];
};

const handleDrop = (event) => {
  const files = Array.from(event.dataTransfer.files);
  handleVideoFiles(files);
};

const handleSelectionChange = (selection) => {
  multipleSelection.value = selection;
};

const handleVideoFiles = (files) => {
  const isAllVideos = files.every((file) => file.type.startsWith('video/'));

  if (!isAllVideos) {
    alert('Only video files are allowed.');
  } else {
    const values = files.map((item) => ({
      id: getNextId(),
      name: item.name,
      path: item.path,
      size: item.size,
      startTime: Date.now(),
      status: 0
    }));
    fileList.value.push(...values);

    // console.log(files);

    handleSendToMain(values);
    multipleTableRef.value?.getTableRef()?.clearSelection();
  }
};

const handleStart = (selection) => {
  const current = selection.length > 0 ? selection : fileList.value;
  const stopped = current.filter((item) => item.status === 3);

  handleSendToMain(stopped);
  multipleTableRef.value?.getTableRef()?.clearSelection();
};

const handleClear = (selection, isDelete = true) => {
  // 1. 停止
  handleStop(selection);

  if (isDelete) {
    // 2. 删除
    fileStore.setFileList(
      fileList.value.filter((item) => {
        return !selection.includes(item);
      })
    );
  }

  multipleTableRef.value?.getTableRef()?.clearSelection();
};

const handleCancel = () => {
  multipleTableRef.value?.getTableRef()?.clearSelection();
};

onMounted(() => {
  fileStore.setFileList(
    fileList.value.map((item) => {
      return item.status === 1 || item.status === 0 ? {...item, status: 3} : item;
    })
  );
});

let removeListener = null;

onMounted(() => {
  removeListener = window.electronAPI.receive('fromMain', (event, data = {}) => {
    if (!(data && typeof data === 'object' && data.type === VIDEO_TO_GIF)) {
      return;
    }
    const taskId = data.taskId;

    const hasTask = queueManager.getTask(VIDEO_TO_GIF, taskId);

    if (data.name === 'progress' && hasTask) {
      fileStore.setFileList(
        fileList.value.map((item) => {
          return item.id === taskId ? {...item, progress: data.value, status: 1} : item;
        })
      );
    }
  });
});
onBeforeUnmount(() => {
  removeListener && removeListener();
});
</script>

<style lang="scss" scoped>
.content-container {
  flex: 1;
  height: calc(100vh - 40px);
  margin: 0 auto;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px 24px 0px 24px;
  box-sizing: border-box;
}
</style>
