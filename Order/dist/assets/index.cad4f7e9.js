import "./network_status.8a4c6ee1.js";
window.addEventListener("DOMContentLoaded", () => {
  const connect_button = document.getElementById("connect_button");
  if (connect_button) {
    connect_button.addEventListener("click", () => {
      set_server_IP();
    });
  }
});
function set_server_IP() {
  const input_element = document.getElementById("server_ip");
  if (input_element.value == 0)
    return alert("Enter Server's local IP Address");
  sessionStorage.setItem("server_IP", input_element.value);
  console.log(sessionStorage.getItem("server_IP"));
  if (navigator.onLine) {
    const url = `http://${sessionStorage.getItem("server_IP")}:8080/`;
    fetch(url).then((response) => {
      if (response.status == 200) {
        console.log(`Server at ${url} is reachable`);
        window.location.href = "menu_items.html";
      } else {
        console.log(`Server at ${url} is unreachable`);
        alert(`Connection Failed: ${sessionStorage.getItem("server_IP")} is unreachable`);
      }
    }).catch((error) => {
      console.error(`Error while reaching the server at ${url}: ${error}`);
      alert(`Connection Failed: ${sessionStorage.getItem("server_IP")} is unreachable`);
    });
  } else {
    console.error("You are currently offline. Check your network connection.");
    alert(`Connection Failed: You are currently offline. Check your network connection`);
  }
}
