// Modules to control application life and create native browser window
const { app, BrowserWindow, Notification, screen } = require("electron");
const path = require("path");
const ipcRenderer = require("electron").ipcMain;

const { setup: setupPushReceiver } = require("electron-push-receiver");
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    // maxWidth: 380,
    // minWidth: 380,
    // minHeight: 550,
    maxWidth: 75,
    // minWidth: 380,
    maxHeight: 75,
    maximizable: false,
    fullscreenable: false,
    // resizable: false,
    frame: false,
    movable: true,
    // transparent: true,
    titleBarStyle: "hiddenInset",
    title: "Ubblu",
    transparent: true,
    globals: { platform: "electron" },
    webPreferences: {
      nodeIntegration: true,
    },
  });
  mainWindow.removeMenu();
  mainWindow.setAlwaysOnTop(true);
  // and load the index.html of the app.
  // mainWindow.loadURL(`http://ubblu.ga/`);
  mainWindow.loadURL(`file://${path.join(__dirname, "./index.html")}`);
  let myNotification = new Notification("Title", {
    body: "Lorem Ipsum Dolor Sit Amet",
  });
  myNotification.title = "Title";
  myNotification.body =
    "<div style='display:flex;'><span>Amit Patel</span><b>Hello world</b></div>";
  myNotification.onclick = () => {
    console.log("Notification clicked");
  };

  myNotification.show();

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
  mainWindow.on("resize", function () {});
  mainWindow.on("maximize", function () {
    mainWindow.reload();
  });
  mainWindow.on("unmaximize", function () {
    // Dereference the window object, usually you would store windows
    mainWindow.reload();
  });
  setupPushReceiver(mainWindow.webContents);
}

let ubbluWindow;

function createUbbluWindow() {
  // Create the browser window.
  ubbluWindow = new BrowserWindow({
    maxWidth: 380,
    minWidth: 380,
    minHeight: 550,
    minWidth: 380,
    maximizable: true,
    fullscreenable: true,
    // resizable: false,
    // frame: false,
    // movable: true,
    transparent: true,
    titleBarStyle: "hiddenInset",
    title: "Ubblu",
    globals: { platform: "electron" },
    show: false,
  });
  ubbluWindow.removeMenu();
  ubbluWindow.setAlwaysOnTop(true);
  // and load the index.html of the app.
  ubbluWindow.loadURL(`http://ubblu.ga/`);
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  ubbluWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    ubbluWindow = null;
  });
  ubbluWindow.on("maximize", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    ubbluWindow.reload();
  });
  ubbluWindow.on("unmaximize", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    ubbluWindow.reload();
  });
}

let notificationWindow;

function createNotificationWindow() {
  notificationWindow = new BrowserWindow({
    maxWidth: 350,
    minWidth: 350,
    height: 110,
    maximizable: false,
    fullscreenable: false,
    // resizable: false,
    frame: false,
    // movable: true,
    titleBarStyle: "hiddenInset",
    title: "Ubblu",
    globals: { platform: "electron" },
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  notificationWindow.removeMenu();
  notificationWindow.setAlwaysOnTop(true);
  // and load the index.html of the app.
  notificationWindow.loadURL(`file://${path.join(__dirname, "./notificationWindow.html")}`);

  // Open the DevTools.
  // notificationWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  notificationWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    notificationWindow = null;
  });
  notificationWindow.on("maximize", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    notificationWindow.reload();
  });
  notificationWindow.on("unmaximize", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    notificationWindow.reload();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", function () {
  createWindow();
  createUbbluWindow();
  ipcRenderer.on("show-ubblu", function () {
    if (!ubbluWindow) {
      createUbbluWindow();
    }
    const bounds = mainWindow.getBounds();
    ubbluWindow.setBounds({ x: bounds.x - 150, y: bounds.y - 650 });
    ubbluWindow.show();
  });
  ipcRenderer.on("position-ubblu", function (e, position) {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const xpos = position.x < 1910 ? position.x : width + 10;
    mainWindow.setBounds({ x: xpos, y: position.y });
    console.log("position", position, width, height, xpos);
  });
  ipcRenderer.on("show-notification", function (e, position) {
    createNotificationWindow();
    const bounds = mainWindow.getBounds();
    notificationWindow.setBounds({ x: bounds.x - 500, y: bounds.y - 650 });
    notificationWindow.show();
  });
  ipcRenderer.on("hide-notification", function () {
    if(notificationWindow) {
      notificationWindow.close();
    }
  });
});

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
