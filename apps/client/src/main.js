import { _player, setExternalParam } from "./director";
import { addFinishedListener } from "./director/loader";

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
    _player._canvas = this.canvas;
  }

  connectedCallback() {
    const width = this.getAttribute("width") ?? "";
    const height = this.getAttribute("height") ?? "";

    this.canvas.setAttribute("width", width);
    this.canvas.setAttribute("height", height);

    this.appendChild(this.canvas);

    let src = "";

    const params = this.querySelectorAll("x-param");
    params.forEach((p) => {
      const name = p.getAttribute("name");
      if (!name) {
        return;
      }

      const value = p.getAttribute("value");

      if (name === "src") {
        src = value ?? "";
      }

      setExternalParam(name, value);
    });

    if (src) {
      import(/* @vite-ignore */ src);
    }

    addFinishedListener(() => {
      _player._play();
    });
  }
}

customElements.define("x-object", XObject);
