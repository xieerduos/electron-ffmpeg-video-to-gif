class QueueManager {
  constructor(number) {
    if (typeof number !== 'number' || Number.isNaN(number)) {
      console.error('[error]: ', `QueueManager params typeof number === '${typeof number}', value: ${number}`);
    }

    this.number = number;
    this.data = {};

    this.handleQueue = this.handleQueue.bind(this);
    this.removeTaskFromQueue = this.removeTaskFromQueue.bind(this);
    this.processCachedTasks = this.processCachedTasks.bind(this);
    this.cleanupEmptyData = this.cleanupEmptyData.bind(this);
    this.trigger = this.trigger.bind(this);
    this.enqueue = this.enqueue.bind(this);
    this.dequeue = this.dequeue.bind(this);
    this.getTask = this.getTask.bind(this);
    this.cancelTask = this.cancelTask.bind(this);
    this.clear = this.clear.bind(this);
  }

  handleQueue(current) {
    const unprocessedTasks = current.queues.filter((task) => !task.isFetch);

    unprocessedTasks.forEach((task) => {
      task.isFetch = true;

      task
        .execute()
        .then(task.resolve)
        .catch(task.reject)
        .finally(() => {
          this.removeTaskFromQueue(current, task);
          this.processCachedTasks(current);
          this.cleanupEmptyData();
        });
    });
  }

  removeTaskFromQueue(current, task) {
    const taskIndex = current.queues.findIndex((t) => t.key === task.key);

    if (taskIndex !== -1) {
      current.queues.splice(taskIndex, 1);
    }
  }

  processCachedTasks(current) {
    if (current.caches.length > 0) {
      current.queues.push(current.caches.shift());
      this.trigger();
    }
  }

  cleanupEmptyData() {
    Object.keys(this.data).forEach((key) => {
      if (this.data[key].queues.length === 0 && this.data[key].caches.length === 0) {
        delete this.data[key];
      }
    });
  }

  trigger() {
    Object.values(this.data).forEach(this.handleQueue);
  }

  enqueue({uuid = 'abcdef', key, fetch = () => Promise.resolve(), ...reset}) {
    return new Promise((resolve, reject) => {
      if (key !== 0 && !key) {
        reject(new Error({message: 'key 参数为空', key}));
        return;
      }

      const task = {
        key,
        isFetch: false,
        execute: fetch,
        resolve,
        reject,
        data: {...reset}
      };

      const dataEntry = this.data[uuid] || (this.data[uuid] = {queues: [], caches: []});

      if (dataEntry.queues.length >= this.number) {
        dataEntry.caches.push(task);
      } else {
        dataEntry.queues.push(task);
        this.trigger();
      }
    });
  }

  dequeue(uuid = 'abcdef', key) {
    const dataEntry = this.data[uuid];

    if (dataEntry) {
      const taskIndex = dataEntry.queues.findIndex((t) => t.key === key);

      if (taskIndex !== -1) {
        dataEntry.queues.splice(taskIndex, 1);
      } else {
        const cacheIndex = dataEntry.caches.findIndex((t) => t.key === key);

        if (cacheIndex !== -1) {
          dataEntry.caches.splice(cacheIndex, 1);
        }
      }
    }
  }

  getTask(uuid = 'abcdef', key) {
    const dataEntry = this.data[uuid];

    if (dataEntry) {
      const task = dataEntry.queues.find((t) => t.key === key);

      if (task) {
        return task;
      } else {
        const cachedTask = dataEntry.caches.find((t) => t.key === key);

        if (cachedTask) {
          return cachedTask;
        }
      }
    }

    return null;
  }

  cancelTask(uuid = 'abcdef', key) {
    const dataEntry = this.data[uuid];

    if (dataEntry) {
      const taskIndex = dataEntry.queues.findIndex((t) => t.key === key);

      if (taskIndex !== -1) {
        const task = dataEntry.queues[taskIndex];
        task.reject(new Error(`Task with key '${key}' has been canceled.`));
        this.dequeue(uuid, key);
        return 1;
      } else {
        const cacheIndex = dataEntry.caches.findIndex((t) => t.key === key);

        if (cacheIndex !== -1) {
          dataEntry.caches.splice(cacheIndex, 1);
          return 2;
        }
        return -1;
      }
    } else {
      return -1;
    }
  }

  clear(uuid = 'abcdef') {
    const dataEntry = this.data[uuid];

    if (dataEntry && dataEntry.caches.length > 0) {
      dataEntry.caches = [];
    }
  }
}

export default QueueManager;
