import {ElMessage} from 'element-plus';

export const handleResultFolder = async (rowData) => {
  try {
    const fullPath = await window.electronAPI.invoke('toMain', {
      type: 'getResultPath',
      filePath: rowData.path
    });

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

export const handleShowRowFolder = async (filePath) => {
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

export default function useElectron() {
  return {
    handleResultFolder,
    handleShowRowFolder
  };
}
