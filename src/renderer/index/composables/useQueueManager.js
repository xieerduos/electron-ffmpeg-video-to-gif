import {ref, watch} from 'vue';

export default function useQueueManager() {
  // 创建一个响应式引用来存储队列
  const queue = ref([]);

  // 添加一个新任务到队列
  const enqueue = (task) => {
    queue.value.push(task);
  };

  // 从队列中移除一个任务
  const dequeue = () => {
    if (queue.value.length > 0) {
      return queue.value.shift();
    }
    return null;
  };

  // 查看队列是否为空
  const isEmpty = () => {
    return queue.value.length === 0;
  };

  // 监控队列的变化
  watch(queue, (newQueue, oldQueue) => {
    console.log('Queue updated:', newQueue);
  });

  return {
    queue,
    enqueue,
    dequeue,
    isEmpty
  };
}
