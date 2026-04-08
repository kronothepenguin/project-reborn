import { setCanvas, setExternalParams } from "./director";

class XParam extends HTMLElement {
  constructor() {
    super();
  }
}

customElements.define("x-param", XParam);

class XObject extends HTMLElement {
  constructor() {
    super();

    this.canvas = document.createElement("canvas");
    setCanvas(this.canvas);
  }

  connectedCallback() {
    const width = this.getAttribute("width") ?? "";
    const height = this.getAttribute("height") ?? "";

    this.canvas.setAttribute("width", width);
    this.canvas.setAttribute("height", height);

    this.appendChild(this.canvas);

    const params = {};
    const children = this.querySelectorAll("x-param");
    children.forEach((p) => {
      const name = p.getAttribute("name");
      if (!name) {
        return;
      }

      const value = p.getAttribute("value");

      params[name] = value;
    });

    setExternalParams(params);
  }
}

customElements.define("x-object", XObject);
