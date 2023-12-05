import { W as WebPlugin } from "./statusbar.05370d47.js";
class KeepAwakeWeb extends WebPlugin {
  constructor() {
    super(...arguments);
    this.wakeLock = null;
    this._isSupported = "wakeLock" in navigator;
  }
  async keepAwake() {
    if (!this._isSupported) {
      this.throwUnsupportedError();
    }
    if (this.wakeLock) {
      await this.allowSleep();
    }
    this.wakeLock = await navigator.wakeLock.request("screen");
  }
  async allowSleep() {
    var _a;
    if (!this._isSupported) {
      this.throwUnsupportedError();
    }
    (_a = this.wakeLock) === null || _a === void 0 ? void 0 : _a.release();
    this.wakeLock = null;
  }
  async isSupported() {
    const result = {
      isSupported: this._isSupported
    };
    return result;
  }
  async isKeptAwake() {
    if (!this._isSupported) {
      this.throwUnsupportedError();
    }
    const result = {
      isKeptAwake: !!this.wakeLock
    };
    return result;
  }
  throwUnsupportedError() {
    throw this.unavailable("Screen Wake Lock API not available in this browser.");
  }
}
export { KeepAwakeWeb };
