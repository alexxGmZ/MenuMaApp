import { C as CapacitorHttp } from "./statusbar.f6df8738.js";
var pull_to_refresh = "";
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
  return new Promise((resolve, reject) => {
    if (navigator.onLine) {
      const url = `http://${input_server_ip}:8080/status?api_token=${input_api_token}`;
      console.log("URL: " + url);
      CapacitorHttp.get({
        url
      }).then((response) => {
        if (response.status == 200) {
          console.log(`Server at ${url} is reachable`);
          sessionStorage.setItem("server_IP", input_server_ip);
          sessionStorage.setItem("server_api_token", input_api_token);
          window.location.href = "order.html";
          resolve();
        } else {
          console.log(`Server at ${url} is unreachable`);
          alert(`Connection Failed ${response.status}: ${input_server_ip} is unreachable`);
          reject(`Connection Failed ${response.status}: ${input_server_ip} is unreachable`);
        }
      }).catch((error) => {
        console.error(`Error while reaching the server at ${url}: ${error}`);
        alert(`Connection Failed: ${input_server_ip} is unreachable
${error}`);
        reject(`Error while reaching the server at ${url}: ${error}`);
      });
    } else {
      console.error("You are currently offline. Check your network connection.");
      alert(`Connection Failed: You are currently offline. Check your network connection`);
      reject("You are currently offline. Check your network connection.");
    }
  });
}
function is_valid_ipv4(ip) {
  console.log("called is_valid_ipv4()");
  const ipv4_pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  return ipv4_pattern.test(ip);
}
window.addEventListener("DOMContentLoaded", function() {
  toggle_info();
  screen_resolution();
});
function screen_resolution() {
  var screenWidth = window.screen.width;
  var screenHeight = window.screen.height;
  var devicePixelRatio = window.devicePixelRatio || 1;
  var actualScreenWidth = screenWidth * devicePixelRatio;
  var actualScreenHeight = screenHeight * devicePixelRatio;
  console.log("Screen Width: " + actualScreenWidth);
  console.log("Screen Height: " + actualScreenHeight);
  document.getElementById("screen_width").textContent = actualScreenWidth;
  document.getElementById("screen_height").textContent = actualScreenHeight;
}
function toggle_info() {
  const info_hidden_div = document.getElementById("info_hidden");
  const info_show_div = document.getElementById("info_show");
  const info_show_button = document.getElementById("info_show_button");
  if (info_show_button) {
    info_show_button.addEventListener("click", function() {
      info_hidden_div.classList.add("hidden");
      info_hidden_div.classList.remove("flex");
      info_show_div.classList.remove("hidden");
      info_show_div.classList.add("flex");
    });
  }
  const info_hide_button = document.getElementById("info_hide_button");
  if (info_hide_button) {
    info_hide_button.addEventListener("click", function() {
      info_hidden_div.classList.remove("hidden");
      info_hidden_div.classList.add("flex");
      info_show_div.classList.add("hidden");
      info_show_div.classList.remove("flex");
    });
  }
}
