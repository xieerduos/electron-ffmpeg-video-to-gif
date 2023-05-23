<template>
  <div class="menu-container">
    <div class="logo-wrap">
      <img width="40" src="@/renderer/index/assets/logo.png" alt="logo.png" />
    </div>
  </div>
  <div class="content-container" @dragover.prevent @dragenter.prevent @drop="handleDrop">
    <div class="header">
      <el-button type="primary" @click="handleClick"
        ><el-icon><DocumentAdd /></el-icon>选择文件</el-button
      >
      <template v-if="multipleSelection.length > 0">
        <el-button
          style="width: 90px"
          v-show="canAllStart > 0"
          type="primary"
          plain
          @click="handleStart(multipleSelection)"
          >开始({{ canAllStart }})</el-button
        >
        <el-button
          style="width: 90px"
          v-show="canAllStop > 0"
          type="danger"
          plain
          @click="handleStop(multipleSelection)"
          >停止({{ canAllStop }})</el-button
        >
        <el-button style="width: 90px" type="danger" plain @click="handleClear(multipleSelection)"
          >清除({{ multipleSelection.length }})</el-button
        >
      </template>
      <el-button
        style="margin-left: auto"
        :disabled="multipleSelection.length > 0 || canAllStart === 0"
        type="primary"
        plain
        @click="handleStart(multipleSelection)"
        >全部开始</el-button
      >
      <el-button
        :disabled="multipleSelection.length > 0 || canAllStop === 0"
        type="danger"
        plain
        @click="handleStop(multipleSelection)"
        >全部停止</el-button
      >
    </div>
    <el-table
      ref="multipleTableRef"
      :data="fileList"
      :row-key="(row) => row.path"
      height="calc(100vh - 140px)"
      @selection-change="handleSelectionChange"
      style="width: 100%">
      <el-table-column type="selection" reserve-selection width="55" />
      <el-table-column prop="id" label="#" width="50" />
      <el-table-column prop="startTime" label="日期" width="115px">
        <template #default="scope">
          {{ scope.row.startTime ? dayjs(scope.row.startTime).format('YYYY/MM/DD HH:mm:ss') : '' }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="文件名称">
        <template #default="scope">
          <span class="file-name" @click="handleShowRowFolder(scope.row.path)" :title="scope.row.path">{{
            scope.row.name
          }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="size" label="大小" width="100px">
        <template #default="scope">
          {{ bytes(scope.row.size) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" align="center" width="100px">
        <template #default="scope">
          <el-tag class="ml-2" :type="map.get(scope.row.status).tag">{{ map.get(scope.row.status).text }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="progress" label="完成进度" align="left">
        <template #default="scope">
          <div class="progress-wrap">
            <el-progress :percentage="scope.row.progress" :format="(percentage) => percentage.toFixed(2) + '%'" />
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="" label="操作" align="center" width="100px">
        <template #default="scope">
          <el-button
            @click="handleResultFolder(scope.row)"
            :disabled="scope.row.status !== 2"
            text
            :title="scope.row.path"
            ><el-icon><Folder /></el-icon
          ></el-button>
        </template>
      </el-table-column>
    </el-table>
    <input type="file" ref="fileElem" multiple accept="video/*" @change="handleFiles" style="display: none" />
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue';
import bytes from 'bytes';
// import dayjs from 'dayjs';
import QueueManager from '@/renderer/index/utils/QueueManager.js';
import {ElMessage} from 'element-plus';
import dayjs from 'dayjs';
const map = new Map([
  [0, {text: '排队中', tag: 'info'}],
  [1, {text: '进行中', tag: 'warning'}],
  [2, {text: '已成功', tag: 'success'}],
  [3, {text: '已停止', tag: 'danger'}]
]);

const getNextId = () => {
  let nextId = localStorage.getItem('nextId') || 0;
  nextId++;
  localStorage.setItem('nextId', nextId);
  return nextId;
};

const VIDEO_TO_GIF = 'video-to-gif';
const VIDEO_STOP_TO_GIF = 'video-stop-to-gif';

const queueManager = ref(new QueueManager(3));

const dropArea = ref(null);
const fileElem = ref(null);

const defaultList = localStorage.getItem('fileList');
// console.log(defaultList);
const fileList = ref(defaultList ? JSON.parse(defaultList) : []);
const multipleSelection = ref([]);
const multipleTableRef = ref();

const canAllStart = computed(() => {
  const arr = multipleSelection.value.length > 0 ? multipleSelection.value : fileList.value;
  return arr.filter((item) => item.status === 3).length;
});
const canAllStop = computed(() => {
  const arr = multipleSelection.value.length > 0 ? multipleSelection.value : fileList.value;
  return arr.filter((item) => item.status === 1 || item.status === 0).length;
});

const setFileList = (value) => {
  fileList.value = value;

  localStorage.setItem('fileList', JSON.stringify(fileList.value));
};

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

  multipleTableRef.value.clearSelection();
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

  console.log('notStarted', notStarted.length);

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

  multipleTableRef.value.clearSelection();
};

const handleStart = (selection) => {
  console.log('selection.length > 0', selection.length > 0);

  const current = selection.length > 0 ? selection : fileList.value;
  const stopped = current.filter((item) => item.status === 3);
  console.log('current', current);

  handleSendToMain(stopped);
};

const handleResultFolder = async (rowData) => {
  try {
    const fullPath = await window.electronAPI.invoke('toMain', {
      type: 'getResultPath',
      filePath: rowData.path
    });

    console.log('fullPath', fullPath);

    const result = await window.electronAPI.invoke('toMain', {
      type: 'showItemInFolder',
      fullPath
    });

    console.log('showItemInFolder result', result);
  } catch (error) {
    console.error('[handleResultFolder error]', error);
    // ElMessage({type: 'error', message: '打开目录失败'});
    ElMessage({type: 'error', message: '文件已经被移除'});
  }
};

const handleShowRowFolder = async (filePath) => {
  window.electronAPI
    .invoke('toMain', {
      type: 'showItemInFolder',
      fullPath: filePath
    })
    .catch((error) => {
      ElMessage({type: 'error', message: '文件已经被移除'});
      console.error('handleShowRowFolder error', error);
    });
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
    // console.log('fromMain', data);

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

<style>
html,
body {
  padding: 0;
  margin: 0;
}
.header {
  display: flex;
  padding: 20px 0px;
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

.menu-container {
  flex: 0 0 70px;
  background-color: #0c193d;
}

.logo-wrap {
  margin-top: 24px;
  width: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
}

.content-container {
  flex: 1;
  height: 100vh;
  margin: 0 auto;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px;
  box-sizing: border-box;
}

.file-name {
  cursor: pointer;
}
.progress-wrap .el-progress__text {
  width: 60px;
  font-size: 12px;
}
</style>
