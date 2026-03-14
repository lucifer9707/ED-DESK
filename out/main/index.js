"use strict";
const electron = require("electron");
const path = require("path");
const url = require("url");
const __dirname$1 = url.fileURLToPath(new URL(".", require("url").pathToFileURL(__filename).href));
let mainWindow = null;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: "#0a0a0a",
    show: false,
    frame: true,
    titleBarStyle: "default",
    webPreferences: {
      preload: path.join(__dirname$1, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      enableBluetoothFeatures: true
    },
    icon: path.join(__dirname$1, "../../resources/icon.png")
  });
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname$1, "../renderer/index.html"));
  }
  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
    mainWindow?.maximize();
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.webContents.setWindowOpenHandler(({ url: url2 }) => {
    if (url2.startsWith("https:")) {
      electron.shell.openExternal(url2);
    }
    return { action: "deny" };
  });
}
electron.app.whenReady().then(() => {
  createWindow();
  electron.ipcMain.handle("demo:ping", () => "pong");
  electron.ipcMain.handle("get-local-ip", () => {
    const os = require("os");
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === "IPv4" && !net.internal) return net.address;
      }
    }
    return "127.0.0.1";
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
