var pull_to_refresh = "";
const pullToRefresh = document.querySelector(".pull-to-refresh");
let touchstartY = 0;
document.addEventListener("touchstart", (e) => {
  touchstartY = e.touches[0].clientY;
});
document.addEventListener("touchmove", (e) => {
  const touchY = e.touches[0].clientY;
  const touchDiff = touchY - touchstartY;
  if (touchDiff > 0 && window.scrollY === 0) {
    pullToRefresh.classList.add("visible");
    e.preventDefault();
  }
});
document.addEventListener("touchend", (e) => {
  if (pullToRefresh.classList.contains("visible")) {
    pullToRefresh.classList.remove("visible");
    location.reload();
  }
});
