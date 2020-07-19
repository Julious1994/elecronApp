const { ipcRenderer } = require("electron");
const {
  START_NOTIFICATION_SERVICE,
  NOTIFICATION_SERVICE_STARTED,
  NOTIFICATION_SERVICE_ERROR,
  NOTIFICATION_RECEIVED,
  TOKEN_UPDATED,
} = require("electron-push-receiver/src/constants");

function initNotification() {
  // Listen for service successfully started
  ipcRenderer.on(NOTIFICATION_SERVICE_STARTED, (_, token) => {
    console.log("service successfully started", token);
    ipcRenderer.send('set-token', token);
  });
  // Handle notification errors
  ipcRenderer.on(NOTIFICATION_SERVICE_ERROR, (_, error) => {
    console.log("notification error", error);
  });
  // Send FCM token to backend
  ipcRenderer.on(TOKEN_UPDATED, (_, token) => {
    console.log("token updated", token);
  });
  ipcRenderer.on(NOTIFICATION_RECEIVED, (_, serverNotificationPayload) => {
    // check to see if payload contains a body string, if it doesn't consider it a silent push
    console.log(serverNotificationPayload);
    if (
      serverNotificationPayload &&
      serverNotificationPayload.notification.body
    ) {
      // payload has a body, so show it to the user
      const data = {
        ...serverNotificationPayload.notification,
        ...serverNotificationPayload.data,
      };
      ipcRenderer.send("show-notification", data);
    } else {
      // payload has no body, so consider it silent (and just consider the data portion)
      console.log(
        "do something with the key/value pairs in the data",
        serverNotificationPayload
      );
    }
  });
  // Start service
  const senderId = "432182666518"; // <-- replace with FCM sender ID from FCM web admin under Settings->Cloud Messaging
  console.log("starting service and registering a client");
  ipcRenderer.send(START_NOTIFICATION_SERVICE, senderId);
}

module.exports = {
  initNotification,
};
