export interface IElectronAPI {
  getLocalIP: () => Promise<string>
  demo: {
    ping: () => Promise<string>
  }
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}