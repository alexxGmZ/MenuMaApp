import { r as registerPlugin } from "./index.7d80667e.js";
import "./pull_to_refresh.be92edd2.js";
window.addEventListener("DOMContentLoaded", () => {
  const connect_button = document.getElementById("connect_button");
  if (connect_button) {
    connect_button.addEventListener("click", () => {
      set_server_connection();
    });
  }
});
function set_server_connection() {
  console.log("called set_server_connection()");
  const input_server_ip = document.getElementById("server_ip").value.trim();
  const input_api_token = document.getElementById("api_token").value.trim();
  if (!is_valid_ipv4(input_server_ip))
    return alert("Invalid Local IP Address");
  if (input_api_token == 0)
    return alert("Enter Server Connection Token");
  if (navigator.onLine) {
    const url = `http://${input_server_ip}:8080/?api_token=${input_api_token}`;
    console.log("URL: " + url);
    fetch(url).then((response) => {
      if (response.status == 200) {
        console.log(`Server at ${url} is reachable`);
        sessionStorage.setItem("server_IP", input_server_ip);
        sessionStorage.setItem("server_api_token", input_api_token);
        window.location.href = "menu_items.html";
      } else {
        console.log(`Server at ${url} is unreachable`);
        alert(`Connection Failed: ${input_server_ip} is unreachable`);
      }
    }).catch((error) => {
      console.error(`Error while reaching the server at ${url}: ${error}`);
      alert(`Connection Failed: ${input_server_ip} is unreachable`);
    });
  } else {
    console.error("You are currently offline. Check your network connection.");
    alert(`Connection Failed: You are currently offline. Check your network connection`);
  }
}
function is_valid_ipv4(ip) {
  console.log("called is_valid_ipv4()");
  const ipv4_pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  return ipv4_pattern.test(ip);
}
const scriptRel = "modulepreload";
const seen = {};
const base = "/";
const __vitePreload = function preload(baseModule, deps) {
  if (!deps || deps.length === 0) {
    return baseModule();
  }
  return Promise.all(deps.map((dep) => {
    dep = `${base}${dep}`;
    if (dep in seen)
      return;
    seen[dep] = true;
    const isCss = dep.endsWith(".css");
    const cssSelector = isCss ? '[rel="stylesheet"]' : "";
    if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
      return;
    }
    const link = document.createElement("link");
    link.rel = isCss ? "stylesheet" : scriptRel;
    if (!isCss) {
      link.as = "script";
      link.crossOrigin = "";
    }
    link.href = dep;
    document.head.appendChild(link);
    if (isCss) {
      return new Promise((res, rej) => {
        link.addEventListener("load", res);
        link.addEventListener("error", () => rej(new Error(`Unable to preload CSS for ${dep}`)));
      });
    }
  })).then(() => baseModule());
};
const Network = registerPlugin("Network", {
  web: () => __vitePreload(() => import("./web.e2719596.js"), true ? ["assets/web.e2719596.js","assets/index.7d80667e.js","assets/index.7771d47d.css"] : void 0).then((m) => new m.NetworkWeb())
});
Network.addListener("networkStatusChange", (status) => {
  console.log("Network status changed", status);
});
const logCurrentNetworkStatus = async () => {
  const json_container = document.getElementById("connection_type");
  const status = await Network.getStatus();
  console.log("Network connection status:", status.connected);
  console.log("Network connection type:", status.connectionType);
  json_container.textContent = `Status: ${status.connected}
Type: ${status.connectionType}`;
};
logCurrentNetworkStatus();
var screenWidth = window.screen.width;
var screenHeight = window.screen.height;
var devicePixelRatio = window.devicePixelRatio || 1;
var actualScreenWidth = screenWidth * devicePixelRatio;
var actualScreenHeight = screenHeight * devicePixelRatio;
console.log("Screen Width: " + actualScreenWidth);
console.log("Screen Height: " + actualScreenHeight);
document.getElementById("screen_width").textContent = actualScreenWidth;
document.getElementById("screen_height").textContent = actualScreenHeight;
