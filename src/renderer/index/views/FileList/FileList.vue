<template>
  <Navbar />
  <div class="content-container" @dragover.prevent @dragenter.prevent @drop="handleDrop">
    <FileOperations
      :multipleSelection="multipleSelection"
      :canAllStart="canAllStart"
      :canAllStop="canAllStop"
      :handleClick="handleClick"
      :handleClear="handleClear"
      :handleStart="handleStart"
      :handleStop="handleStop"></FileOperations>
    <FileTable ref="multipleTableRef" :data="fileList" @selection-change="handleSelectionChange"></FileTable>
    <input type="file" ref="fileElem" multiple accept="video/*" @change="handleFiles" style="display: none" />
  </div>
</template>

<script setup>
import {onMounted, ref, nextTick} from 'vue';
import {ElMessage} from 'element-plus';
import Navbar from '@/renderer/index/components/Navbar/index.vue';
import QueueManager from '@/renderer/index/utils/QueueManager.js';
import getNextId from '@/renderer/index/utils/getNextId.js';
import {VIDEO_TO_GIF, VIDEO_STOP_TO_GIF} from '@/renderer/index/utils/constant.js';
import useComputed from '@/renderer/index/composables/useComputed.js';
import useFileList from '@/renderer/index/composables/useFileList.js';
import FileTable from './FileTable.vue';
import FileOperations from './FileOperations.vue';

const queueManager = ref(new QueueManager(3));

const fileElem = ref();

const {fileList, setFileList} = useFileList();

const multipleSelection = ref([]);
const multipleTableRef = ref();

const {canAllStart, canAllStop} = useComputed({multipleSelection, fileList});

const handleClick = () => {
  fileElem.value.click();
};

const handleFiles = (event) => {
  const files = Array.from(event.target.files);
  handleVideoFiles(files);
};

const handleDrop = (event) => {
  const files = Array.from(event.dataTransfer.files);
  handleVideoFiles(files);
};

const handleSelectionChange = (selection) => {
  multipleSelection.value = selection;
};

const handleSendToMain = (values) => {
  setFileList(
    fileList.value.map((item) => {
      return values.includes(item) ? {...item, status: 0} : item;
    })
  );
  for (const current of values) {
    queueManager.value.enqueue({
      uuid: VIDEO_TO_GIF,
      key: current.id,
      fetch: () => {
        setFileList(
          fileList.value.map((item) => {
            return item.id === current.id ? {...item, status: 1, progress: 0} : item;
          })
        );

        return window.electronAPI
          .invoke('toMain', {
            type: VIDEO_TO_GIF,
            input: current.path,
            frameRate: 20,
            taskId: current.id
          })
          .then(() => {
            setFileList(
              fileList.value.map((item) => {
                return item.id === current.id ? {...item, progress: 100, status: 2} : item;
              })
            );

            ElMessage({type: 'success', message: '转换成功', grouping: true});
          })
          .catch((error) => {
            console.error('error', error, current.id);
            setFileList(
              fileList.value.map((item) => {
                return item.id === current.id ? {...item, status: 3} : item;
              })
            );
          });
      }
    });
  }
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

    console.log(files);

    handleSendToMain(values);
    multipleTableRef.value?.getTableRef()?.clearSelection();
  }
};

const handleStop = (selection) => {
  const current = selection.length > 0 ? selection : fileList.value;

  const inProgress = current.filter((item) => item.status === 1);
  const notStarted = current.filter((item) => item.status === 0);

  for (const item of inProgress) {
    const stopTask = window.electronAPI.invoke('toMain', {
      type: VIDEO_STOP_TO_GIF,
      taskId: item.id
    });
    stopTask
      .then(() => {
        const taskId = item.id;
        console.log(taskId, '停止成功');
        setFileList(
          fileList.value.map((task) => {
            return task.id === taskId ? {...task, status: 3} : task;
          })
        );
      })
      .catch((error) => {
        console.error(item.id, '停止失败', error);
        const cancelCode = queueManager.value.cancelTask(VIDEO_TO_GIF, item.id);
        console.log('inProgress cancelTask taskId, cancelCode', item.id, cancelCode);
        const taskId = item.id;

        ElMessage({type: 'error', message: '停止失败', grouping: true});

        if (cancelCode === -1) {
          setFileList(
            fileList.value.map((task) => {
              return task.id === taskId ? {...task, status: 3} : task;
            })
          );
        }
      });
  }

  for (const item of notStarted) {
    const cancelCode = queueManager.value.cancelTask(VIDEO_TO_GIF, item.id);
    const taskId = item.id;
    console.log('notStarted cancelTask taskId, cancelCode', taskId, cancelCode);
    setFileList(
      fileList.value.map((task) => {
        return task.id === taskId ? {...task, status: 3} : task;
      })
    );
  }

  multipleTableRef.value?.getTableRef()?.clearSelection();
};

const handleStart = (selection) => {
  const current = selection.length > 0 ? selection : fileList.value;
  const stopped = current.filter((item) => item.status === 3);
  console.log('current', current);

  handleSendToMain(stopped);
  multipleTableRef.value?.getTableRef()?.clearSelection();
};

const handleClear = (selection) => {
  // 1. 停止
  handleStop(selection);
  // 2. 删除
  setFileList(
    fileList.value.filter((item) => {
      return !selection.includes(item);
    })
  );
};

onMounted(() => {
  nextTick(() => {
    console.log('multipleTableRef.value', multipleTableRef);
  });
  setFileList(
    fileList.value.map((item) => {
      return item.status === 1 || item.status === 0 ? {...item, status: 3} : item;
    })
  );
});

onMounted(() => {
  window.electronAPI.receive('fromMain', (event, data = {}) => {
    if (!(data && typeof data === 'object' && data.type === VIDEO_TO_GIF)) {
      return;
    }
    const taskId = data.taskId;

    const hasTask = queueManager.value.getTask(VIDEO_TO_GIF, taskId);

    if (data.name === 'progress' && hasTask) {
      setFileList(
        fileList.value.map((item) => {
          return item.id === taskId ? {...item, progress: data.value, status: 1} : item;
        })
      );
    }
  });
});
</script>

<style lang="scss" scoped>
.content-container {
  flex: 1;
  height: 100vh;
  margin: 0 auto;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px;
  box-sizing: border-box;
}
</style>
