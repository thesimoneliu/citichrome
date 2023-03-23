import { Renderer, Camera, Transform, Box, Program, Mesh } from "ogl";

import Home from "./Home/index";
import About from "./About/index";

export default class Canvas {
  constructor({ template }) {
    this.template = template;

    this.x = {
      start: 0,
      end: 0,
      distance: 0,
    };
    this.y = {
      start: 0,
      end: 0,
      distance: 0,
    };
    this.createRenderer();
    this.createCamera();
    this.createScene();

    this.onResize();
    this.onChange(this.template);
  }

  createRenderer() {
    this.renderer = new Renderer({
      // alpha: true,
      antialias: true,
    });

    this.gl = this.renderer.gl;
    // this.gl.clearColor(0.78, 0.44, 0.39, 1);

    document.body.appendChild(this.gl.canvas);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.position.z = 5;
  }

  createScene() {
    this.scene = new Transform();
  }

  /* -------------
   ------------ INITIALIZE
   -------------- */

  createHome() {
    this.home = new Home({
      gl: this.gl,
      scene: this.scene,
      sizes: this.sizes,
    });
    // console.log(this.home);
  }

  destroyHome() {
    if (!this.home) return;
    this.home.destroy();
    this.home = null;
  }

  createAbout() {
    this.about = new About({
      gl: this.gl,
      scene: this.scene,
      sizes: this.sizes,
    });
    // console.log(this.about);
  }

  destroyAbout() {
    if (!this.about) return;
    this.about.destroy();
    this.about = null;
  }

  /* -------------
   ------------ EVENTS
   -------------- */

  onChangeInit() {
    if (this.about) {
      this.about.hide();
    }
    if (this.home) {
      this.home.hide();
    }
  }

  onChange(template) {
    if (template === "about") {
      this.createAbout();
    } else {
      this.destroyAbout();
    }

    if (template === "home") {
      this.createHome();
    } else {
      this.destroyHome();
    }
  }

  onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.perspective({
      aspect: this.gl.canvas.width / this.gl.canvas.height,
    });

    // camera fov adjustment
    const fov = this.camera.fov * (Math.PI / 180);
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;

    this.sizes = {
      // viewport width and height
      width,
      height,
    };

    const values = {
      sizes: this.sizes,
    };

    if (this.home) {
      this.home.onResize(values);
    }
    if (this.about) {
      this.about.onResize(values);
    }
  }

  onTouchDown(event) {
    this.isDown = true;
    const x = event.touches ? event.touches[0].clientX : event.clientX;
    const y = event.touches ? event.touches[0].clientY : event.clientY;

    this.x.start = x;
    this.y.start = y;

    const values = {
      x: this.x,
      y: this.y,
    };

    if (this.home) {
      this.home.onTouchDown(values);
    }
    if (this.about) {
      this.about.onTouchDown(values);
    }
  }

  onTouchMove(event) {
    if (!this.isDown) return;
    const x = event.touches ? event.touches[0].clientX : event.clientX;
    const y = event.touches ? event.touches[0].clientY : event.clientY;

    this.x.end = x;
    this.y.end = y;
    this.x.duration = this.x.start - this.x.end;
    this.y.duration = this.y.start - this.y.end;

    const values = {
      x: this.x,
      y: this.y,
    };

    if (this.home) {
      this.home.onTouchMove(values);
    }
    if (this.about) {
      this.about.onTouchMove(values);
    }
  }

  onTouchUp(event) {
    this.isDown = false;
    const x = event.changedTouches
      ? event.changedTouches[0].clientX
      : event.clientX;
    const y = event.changedTouches
      ? event.changedTouches[0].clientY
      : event.clientY;

    this.x.end = x;
    this.y.end = y;
    this.x.duration = this.x.start - this.x.end;
    this.y.duration = this.y.start - this.y.end;

    const values = {
      x: this.x,
      y: this.y,
    };

    if (this.home) {
      this.home.onTouchUp(values);
    }
    if (this.about) {
      this.about.onTouchUp(values);
    }
  }

  onWheel(event) {
    if (this.home) {
      this.home.onWheel(event);
    }
  }

  /* -------------
   ------------ LOOP & FRAMES
   -------------- */

  update(scroll) {
    if (this.home) {
      this.home.update();
    }
    if (this.about) {
      this.about.update(scroll);
    }
    this.renderer.render({
      scene: this.scene,
      camera: this.camera,
    });
  }
}
