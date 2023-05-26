import {defineStore} from 'pinia';
import QueueManager from '@/renderer/index/utils/QueueManager.js';

export const useFileStore = defineStore('fileStore', {
  state: () => {
    const defaultList = localStorage.getItem('fileList');

    return {
      fileList: defaultList ? JSON.parse(defaultList) : [],
      queueManager: new QueueManager(3)
    };
  },
  getters: {},
  actions: {
    setFileList(fileList) {
      this.fileList = fileList;
      localStorage.setItem('fileList', JSON.stringify(fileList));
    }
  }
});
