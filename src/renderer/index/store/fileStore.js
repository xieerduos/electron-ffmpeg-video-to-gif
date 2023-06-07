import {defineStore} from 'pinia';

export const useFileStore = defineStore('fileStore', {
  state: () => {
    const defaultList = localStorage.getItem('fileList');

    return {
      fileList: defaultList ? JSON.parse(defaultList) : []
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
