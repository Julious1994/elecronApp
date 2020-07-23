// Modules to control application life and create native browser window
const { app, BrowserWindow, Notification, screen } = require("electron");
const path = require("path");
const ipcRenderer = require("electron").ipcMain;

const { setup: setupPushReceiver } = require("electron-push-receiver");
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let token;
let _screen;
let ubbluWindowSize;

function createWindow() {
  // Create the browser window.
  const initialPosition = {
    x: Math.round(_screen.width * 0.80),
    y: Math.round(_screen.height * 0.80),
  };
  mainWindow = new BrowserWindow({
    width: 75,
    height: 75,
    ...initialPosition,
    maximizable: false,
    fullscreenable: false,
    resizable: false,
    frame: false,
    movable: true,
    transparent: true,
    titleBarStyle: "hidden",
    title: "Ubblu",
    globals: { platform: "electron" },
    webPreferences: {
      nodeIntegration: true,
      preload: __dirname + '/preload.js'
    },
  });
  mainWindow.removeMenu();
  mainWindow.setAlwaysOnTop(true);
  // and load the index.html of the app.
  mainWindow.loadURL(`file://${path.join(__dirname, "./index.html")}`);
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on("closed", function () {
    mainWindow = null;
  });
  mainWindow.on("resize", function () {});
  mainWindow.on("maximize", function () {
    mainWindow.reload();
  });
  mainWindow.on("unmaximize", function () {
    mainWindow.reload();
  });
  setupPushReceiver(mainWindow.webContents);
}

let ubbluWindow;

function createUbbluWindow() {
  // Create the browser window.
  ubbluWindowSize = {
    width: Math.round(_screen.width * 0.25),
    height: Math.round(_screen.height * 0.70),
  };
  ubbluWindow = new BrowserWindow({
    ...ubbluWindowSize,
    maximizable: true,
    fullscreenable: true,
    // resizable: false,
    // frame: false,
    // movable: true,
    transparent: false,
    titleBarStyle: "hiddenInset",
    title: "Ubblu",
    globals: { platform: "electron" },
    show: false,
    webPreferences: {
      nodeIntegration: true,
      preload: __dirname + '/preload.js'
    },
  });
  ubbluWindow.removeMenu();
  ubbluWindow.setAlwaysOnTop(true);
  // and load the index.html of the app.
  ubbluWindow.loadURL(`http://ubblu.ga/69/login`);
  // Open the DevTools.
  // ubbluWindow.webContents.openDevTools()

  ubbluWindow.on("closed", function () {
    ubbluWindow = null;
  });
  ubbluWindow.on("maximize", function () {
    ubbluWindow.reload();
  });
  ubbluWindow.on("unmaximize", function () {
    ubbluWindow.reload();
  });
}

let notificationWindow;

function createNotificationWindow() {
  const position = {
    x: _screen.width - 350,
    y: 10,
  }
  console.log(position)
  notificationWindow = new BrowserWindow({
    width: 350,
    height: 150,
    ...position,
    maximizable: false,
    fullscreenable: false,
    // resizable: false,
    frame: false,
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
    notificationWindow = null;
  });
  notificationWindow.on("maximize", function () {
    notificationWindow.reload();
  });
  notificationWindow.on("unmaximize", function () {
    notificationWindow.reload();
  });
}

function getUbbluAppPosition({x, y}) {
  const {width, height} = _screen;
  let _x = 0;
  let _y = 0;
  if(ubbluWindow && ubbluWindowSize) {
    const _height = ubbluWindowSize.height + 10;
    const _width = ubbluWindowSize.width;
    const halfWidth = _width/2;
    if(_height < y) {
      _y = y - _height;
    } else {
      _y = y + 85;
    }
    if(x + 75 >= width) {
      _x = width - _width;
    } else if(x <= halfWidth) {
      _x = 10;
    } else {
      _x = x - (halfWidth - 25);
    }
  }
  return {x: Math.round(_x), y: Math.round(_y)};
}

function getPosition({x, y}) {
  const {width, height} = _screen;
  let image = 'full';
  let size = {width: 75, height: 75};
  const _x = x < 0 ? 0 : x + 10 < width ? x : width - 25;
  const _y = y < 0 ? 0 : y + 10 < height ? y : height - 25;
  
  if(_x >= width - size.width) {
    image = 'right';
    mainWindow.setBounds({ width: Math.floor(size.width / 2), height: size.height})
  } else if (_x <= 0) {
    image = 'left';
    mainWindow.setBounds({ width: Math.floor(size.width / 2), height: size.height})
  } else if(_y <= 0) {
    image = 'top';
    mainWindow.setBounds({ height: Math.floor(size.height / 2), width: size.width})
    
  } else if(_y >= height - size.height) {
    image = 'bottom';
    mainWindow.setBounds({ height: Math.floor(size.height / 2), width: size.width})
  } else {
    mainWindow.setBounds({...size});
  }
  mainWindow.webContents.send('ubblu-icon', image);
  const mainPostion = {x: Math.round(_x), y: Math.round(_y)}
  const ubbluPosition = getUbbluAppPosition(mainPostion)
  return {mainPostion, ubbluPosition};
}

app.on("ready", function () {
  _screen = screen.getPrimaryDisplay().workAreaSize;
  createWindow();
  createUbbluWindow();
  createNotificationWindow();
  ipcRenderer.on("show-ubblu", function () {
    if (!ubbluWindow) {
      createUbbluWindow();
    } else {
      const bounds = mainWindow.getBounds();
      const ubbluPosition = getUbbluAppPosition({ x: bounds.x, y: bounds.y });
      ubbluWindow.show();
      ubbluWindow.setBounds({ ...ubbluPosition });
    }
  });
  ipcRenderer.on("position-ubblu", function (e, position) {
    const {mainPostion, ubbluPosition} = getPosition(position);
    mainWindow.setBounds({ ...mainPostion });
    if(ubbluWindow) {
      ubbluWindow.setBounds({ x: ubbluPosition.x, y: ubbluPosition.y });
    }
    
  });
  ipcRenderer.on("show-notification", function (e, data) {
    // const bounds = mainWindow.getBounds();
    // notificationWindow.setBounds({ x: bounds.x - 500, y: bounds.y - 550 });
    notificationWindow.show();
    notificationWindow.webContents.send('handle-notification', data);
  });
  ipcRenderer.on("hide-notification", function () {
    if(notificationWindow) {
      notificationWindow.hide();
    }
  });
  
  ipcRenderer.on("get-notification-token", function() {
    // const token = localStorage.getItem('token');
    // alert('notification register');
    console.log('token', token);
    ubbluWindow.webContents.send('register-notification', token);
  });

  ipcRenderer.on("set-token", (e, _token) => {
    token = _token;
  })
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
