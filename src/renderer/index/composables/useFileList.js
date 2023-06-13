import {ElMessage} from 'element-plus';
import {VIDEO_TO_GIF, VIDEO_STOP_TO_GIF} from '@/renderer/index/utils/constant.js';
import {useFileStore} from '@/renderer/index/store/fileStore.js';
import queueManager from '@/renderer/index/composables/queueManager.js';

export const handleSendToMain = (values) => {
  const fileStore = useFileStore();
  fileStore.fileList.forEach((item, index) => {
    if (values.includes(item)) {
      Object.assign(fileStore.fileList[index], {status: 0});
    }
  });
  for (const current of values) {
    queueManager.enqueue({
      uuid: VIDEO_TO_GIF,
      key: current.id,
      fetch: () => {
        const taskId = current.id;
        const hitIndex = fileStore.fileList.findIndex((task) => {
          return task.id === taskId;
        });
        hitIndex !== -1 && Object.assign(fileStore.fileList[hitIndex], {status: 1, progress: 0});

        return window.electronAPI
          .invoke('toMain', {
            type: VIDEO_TO_GIF,
            input: current.path,
            frameRate: 20,
            taskId: current.id
          })
          .then(() => {
            const taskId = current.id;
            const hitIndex = fileStore.fileList.findIndex((task) => {
              return task.id === taskId;
            });

            hitIndex !== -1 && Object.assign(fileStore.fileList[hitIndex], {status: 2, progress: 100});

            ElMessage({type: 'success', message: '转换成功', grouping: true});
          })
          .catch((error) => {
            console.error('error', error, current.id);
            if (error?.message?.includes('such file or directory')) {
              ElMessage({type: 'error', message: current.path + ' 文件不存在', grouping: true});
            }
            const taskId = current.id;
            const hitIndex = fileStore.fileList.findIndex((task) => {
              return task.id === taskId;
            });
            hitIndex !== -1 && Object.assign(fileStore.fileList[hitIndex], {status: 3});
          });
      }
    });
  }
};

export const handleStop = (selection) => {
  const fileStore = useFileStore();
  const current = selection.length > 0 ? selection : fileStore.fileList;

  const {inProgress, notStarted} = current.reduce(
    (acc, item) => {
      if (item.status === 1) {
        acc.inProgress.push(item);
      }
      if (item.status === 0) {
        acc.notStarted.push(item);
      }
      return acc;
    },
    {inProgress: [], notStarted: []}
  );

  // 停止正在执行的任务（进行中）
  for (const item of inProgress) {
    const stopTask = window.electronAPI.invoke('toMain', {
      type: VIDEO_STOP_TO_GIF,
      taskId: item.id
    });
    stopTask
      .then(() => {
        const taskId = item.id;
        console.log(taskId, '停止成功');

        const hitIndex = fileStore.fileList.findIndex((task) => {
          return task.id === taskId;
        });

        hitIndex !== -1 && Object.assign(fileStore.fileList[hitIndex], {status: 3});
      })
      .catch((error) => {
        console.error(item.id, '停止失败', error);
        const cancelCode = queueManager.cancelTask(VIDEO_TO_GIF, item.id);
        console.log('inProgress cancelTask taskId, cancelCode', item.id, cancelCode);
        const taskId = item.id;

        ElMessage({type: 'error', message: '停止失败', grouping: true});

        if (cancelCode === -1) {
          // fileStore.setFileList(
          //   fileStore.fileList.map((task) => {
          //     return task.id === taskId ? {...task, status: 3} : task;
          //   })
          // );

          const hitIndex = fileStore.fileList.findIndex((task) => {
            return task.id === taskId;
          });

          hitIndex !== -1 && Object.assign(fileStore.fileList[hitIndex], {status: 3});
        }
      });
  }

  const notStartedIds = [];
  // 停止等待执行的任务（排队中）
  for (const item of notStarted) {
    const cancelCode = queueManager.cancelTask(VIDEO_TO_GIF, item.id);
    const taskId = item.id;
    // 更新状态
    // console.log('notStarted cancelTask taskId, cancelCode', taskId, cancelCode);
    notStartedIds.push(taskId);
  }

  // 把“排队中”的状态修改为“已停止”
  fileStore.fileList.forEach((task) => {
    if (notStartedIds.includes(task.id)) {
      Object.assign(task, {status: 3});
    }
  });
};
