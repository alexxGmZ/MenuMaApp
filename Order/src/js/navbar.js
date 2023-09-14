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
)
