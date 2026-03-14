"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  demo: {
    ping: () => electron.ipcRenderer.invoke("demo:ping")
  },
  getLocalIP: () => electron.ipcRenderer.invoke("get-local-ip")
});
