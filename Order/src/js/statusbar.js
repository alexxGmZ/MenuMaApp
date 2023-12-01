import { StatusBar } from "@capacitor/status-bar";

// Display content under transparent status bar (Android only)
StatusBar.setOverlaysWebView({ overlay: true });

export const hideStatusBar = async () => {
  await StatusBar.hide();
};

hideStatusBar();
