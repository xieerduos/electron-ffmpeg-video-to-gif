const {contextBridge, ipcRenderer} = require('electron');
// 从 Electron 20 版本开始，preload 脚本默认被沙箱化，不再具有访问完整 Node.js 环境的权限
// https://www.electronjs.org/docs/latest/tutorial/tutorial-preload

contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => {
    // whitelist channels
    const validChannels = ['toMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  invoke: (channel, ...reset) => {
    const validChannels = ['toMain', 'titlebar'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...reset);
    }
  },
  receive: (channel, func) => {
    const validChannels = ['fromMain', 'titlebar'];
    if (validChannels.includes(channel)) {
      // 解决无法removeListener问题
      // https://github.com/reZach/secure-electron-template/issues/43#issuecomment-772303787
      const subscription = (event, ...args) => func(event, ...args);
      ipcRenderer.on(channel, subscription);
      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    }
  },
  once: (channel, callback) => {
    const validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
      const newCallback = (_, data) => callback(data);
      ipcRenderer.once(channel, newCallback);
    }
  },
  removeAllListeners: (channel) => {
    const validChannels = ['fromMain', 'update-counter'];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
    }
  }
});
