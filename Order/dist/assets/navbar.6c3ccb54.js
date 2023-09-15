const p = function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(script) {
    const fetchOpts = {};
    if (script.integrity)
      fetchOpts.integrity = script.integrity;
    if (script.referrerpolicy)
      fetchOpts.referrerPolicy = script.referrerpolicy;
    if (script.crossorigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (script.crossorigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
};
p();
var style = "";
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
window.customElements.define(
  "custom-navbar",
  class extends HTMLElement {
    constructor() {
      super();
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `
				<style>
					:host {
						display: block;
						background-color: #333;
						color: white;
						padding: 15px;
					}
				</style>
				<div class="nav">
					<div><slot name="start"></slot></div>
					<div><slot name="title"></slot></div>
					<div><slot name="end"></slot></div>
				</div>
			`;
    }
  }
);
