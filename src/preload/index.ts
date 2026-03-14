import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  demo: {
    ping: () => ipcRenderer.invoke('demo:ping')
  },
  getLocalIP: () => ipcRenderer.invoke('get-local-ip')
})