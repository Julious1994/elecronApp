// Modules to control application life and create native browser window
const { app, BrowserWindow, Notification, screen } = require("electron");
const path = require("path");
const ipcRenderer = require("electron").ipcMain;
const contextMenu = require('electron-context-menu');

const { setup: setupPushReceiver } = require("electron-push-receiver");
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let token;
let _screen;
let ubbluWindowSize;
let notificationHideTimer = true;
let ubbluWindowMinimize = false;

const appFolder = path.dirname(process.execPath)
const exeName = path.basename(process.execPath)

app.setLoginItemSettings({
  openAtLogin: true,
  path: process.execPath,
  args: [
    '--processStart', `"${exeName}"`,
    '--process-start-args', `"--hidden"`
  ]
});

 
contextMenu({
  showInspectElement: false,
  prepend: (defaultActions, params, browserWindow) => [
    {
      label: 'Search Google for “{selection}”',
      // Only show it when right-clicking text
      visible: params.selectionText.trim().length > 0,
      click: () => {
        shell.openExternal(`https://google.com/search?q=${encodeURIComponent(params.selectionText)}`);
      }
    }
  ]
});

function createWindow() {
  // Create the browser window.
  const initialPosition = {
    x: Math.round(_screen.width * 0.80),
    y: Math.round(_screen.height * 0.80),
    // width: Math.round(_screen.width * 0.04),
    // height: Math.round(_screen.height * 0.07),
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
    titleBarStyle: "hidden-inset",
    title: "Ubblu",
    globals: { platform: "electron" },
    webPreferences: {
      nodeIntegration: true,
      preload: __dirname + '/preload.js'
    },
  });
  app.dock && app.dock.hide();
  mainWindow.setAlwaysOnTop(true, "screen-saver");
  mainWindow.setVisibleOnAllWorkspaces(true);
  mainWindow.setFullScreenable(true);

  mainWindow.removeMenu();
  // and load the index.html of the app.
  mainWindow.setThumbarButtons([
    {
      icon: null,
      click: () => {
        mainWindow.setBounds({...initialPosition});
      },
      tooltip: 'RePosition',
    }
  ])
  mainWindow.loadURL(`file://${path.join(__dirname, "./index.html")}`);
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on("closed", function () {
    mainWindow = null;
    ubbluWindow && ubbluWindow.close();
    notificationWindow && notificationWindow.close();
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
function setUbbluSize() {
  const MIN_WIDTH = 350;
  const MAX_WIDTH = 400;

  const DEFAULT_WIDTH = 315;
  const DEFAULT_HEIGHT = 600;
  let height = Math.round(_screen.height * 0.70);
  let width = Math.round(_screen.width * 0.18);
  if(width < MIN_WIDTH) {
    width = MIN_WIDTH;
  } else if(width > MAX_WIDTH) {
    width = MAX_WIDTH;
  }
  
  if(height > DEFAULT_HEIGHT) {
    height = DEFAULT_HEIGHT;
  }
  ubbluWindowSize = {
    width,
    height,
  };
}

function createUbbluWindow() {
  // Create the browser window.
  // ubbluWindowSize = {
  //   width: 415,
  //   height: Math.round(_screen.height * 0.70),
  // };
  ubbluWindow = new BrowserWindow({
    ...ubbluWindowSize,
    maximizable: false,
    fullscreen: false,
    resizable: false,
    skipTaskbar: true,
    transparent: false,
    title: "Ubblu",
    globals: { platform: "electron" },
    show: false,
    webPreferences: {
      nodeIntegration: true,
      preload: __dirname + '/preload.js'
    },
  });
  ubbluWindow.removeMenu();
  ubbluWindow.setAlwaysOnTop(true, "floating");
  ubbluWindow.setVisibleOnAllWorkspaces(true);
  ubbluWindow.setFullScreenable(true);
  // and load the index.html of the app.
  ubbluWindow.loadURL(`http://ubblu.ga/signin`);
  // Open the DevTools.

  // ubbluWindow.webContents.openDevTools()
  ubbluWindow.on('close', (event) => {
      event.preventDefault()
      event.returnValue = false
      ubbluWindow.hide();
  })
  ubbluWindow.on("closed", function () {
    // ubbluWindow = null;
  });
  ubbluWindow.on("maximize", function () {
    ubbluWindow.reload();
  });
  ubbluWindow.on("unmaximize", function () {
    ubbluWindow.reload();
  });
  ubbluWindow.on("minimize", function () {
    ubbluWindow.hide();
    ubbluWindowMinimize =  true;
  });
  ubbluWindow.on("will-resize", function (e) {
    e.preventDefault();
  });
}

let notificationWindow;

function createNotificationWindow() {
  const position = {
    x: _screen.width - 325,
    y: _screen.height - 150,
  }
  console.log(position)
  notificationWindow = new BrowserWindow({
    width: 365,
    height: 155,
    ...position,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
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
  notificationWindow.setAlwaysOnTop(true, "floating");
  notificationWindow.setVisibleOnAllWorkspaces(true);
  notificationWindow.setFullScreenable(true);
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
  const  mainWindowBounds = mainWindow.getBounds();
  if(ubbluWindow && ubbluWindowSize) {
    const _height = ubbluWindowSize.height + 10;
    const _width = ubbluWindowSize.width;
    const halfWidth = _width/2;
    let widthFlag = true;
    if(_height < y) {  // check for up space
      _y = y - (_height + 10);
    } else if(_height < (height - (y + 85))) {   // check for down space
      _y = y ===0 ? y + 70 : y <= 30 ? y + 60 : y + 85;
    } else if(_width < (width - (x + 75))) {  // check for right side
      _x = x + (mainWindowBounds.width < 75 ? 40 : 85);
      _y = y / 2;
      widthFlag = false;
    } else {
      // set for left side
      _x = x - (_width + 10);
      _y = y / 2;
      widthFlag = false;
    }
    if(widthFlag) {
      if(x + 75 >= width) {
        _x = width - _width;
      } else if(x <= halfWidth) {
        _x = 10;
      } else {
        _x = x - (halfWidth - 25);
      }
    }
  }
  return {x: Math.round(_x), y: Math.round(_y)};
}

function getPosition({x, y}) {
  const {width, height} = _screen;
  let image = 'full';
  let size = {width: 75, height: 75};
  const _x = x < 0 ? 0 : x + 10 < width ? x : width - 25;
  const _y = y < 0 ? 0 : y + 10 < height ? y : height - 40;
  if(_x >= width - size.width) {
    image = 'right';
    mainWindow.setBounds({ width: 50, height: size.height})
  } else if (_x <= 0) {
    image = 'left';
    mainWindow.setBounds({ width: Math.floor(size.width / 2), height: size.height})
  } else if(_y <= 0) {
    image = 'top';
    mainWindow.setBounds({ height: Math.floor(size.height / 2), width: size.width})
    
  } else if(_y >= height - size.height) {
    image = 'bottom';
    mainWindow.setBounds({ height: size.height, width: size.width})
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
  setUbbluSize();
  createWindow();
  createUbbluWindow();
  createNotificationWindow();
  ipcRenderer.on("show-ubblu", function () {
    if (!ubbluWindow) {
      createUbbluWindow();
    } else {
      if(ubbluWindow.isVisible()) {
        ubbluWindow.hide();  
      } else {
        const bounds = mainWindow.getBounds();
        const ubbluPosition = getUbbluAppPosition({ x: bounds.x, y: bounds.y });
        ubbluWindow.show();
        if(ubbluWindowMinimize) {
          ubbluWindow.reload();
          ubbluWindowMinimize = false;
        }
        console.log(ubbluWindow.getBounds());
        ubbluWindow.setBounds({ ...ubbluPosition });
      }
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
    notificationWindow.webContents.send('handle-notification', {...data, firebaseToken: token});
    notificationHideTimer = true;
    setTimeout(() => {
      if(notificationWindow && notificationHideTimer) {
        notificationWindow.hide();
      }  
    }, 5000);
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
  });
  ipcRenderer.on("stop-hide-notification-timer", () => {
    notificationHideTimer = false;
  });
  ipcRenderer.on("goto-ubblu", (e, data) => {
    ubbluWindow.loadURL(`https://ubblu.ga/${data.workspaceId}/messages/${data.senderId}/`);
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
