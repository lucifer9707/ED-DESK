export interface IElectronAPI {
  demo: {
    ping: () => Promise<string>
  }
  getLocalIP: () => Promise<string>
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}