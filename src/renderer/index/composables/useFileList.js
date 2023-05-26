import {ref} from 'vue';

export default function useFileList() {
  const defaultList = localStorage.getItem('fileList');
  const fileList = ref(defaultList ? JSON.parse(defaultList) : []);
  const setFileList = (value) => {
    fileList.value = value;

    localStorage.setItem('fileList', JSON.stringify(fileList.value));
  };
  return {
    fileList,
    setFileList
  };
}
