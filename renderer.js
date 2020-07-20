var {ipcRenderer, ipcMain} = require("electron");
const {initNotification} = require("./notification");

const img = document.getElementById('ubblu');

initNotification();

img.addEventListener('mouseup', function() {
ipcRenderer.send("show-ubblu");
// ipcRenderer.send("show-notification");
});
img.addEventListener('drag', function(e) {
// console.log('drag', e);
// img.style.display = 'none';
// ipcRenderer.send("position-ubblu", {x: e.screenX, y: e.screenY});
});

img.addEventListener('dragend', function(e) {
// console.log('drag end', {...e});
// img.style.display = 'block';
ipcRenderer.send("position-ubblu", {x: e.screenX, y: e.screenY});

});