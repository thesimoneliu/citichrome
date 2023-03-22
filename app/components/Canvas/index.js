import { Renderer, Camera, Transform, Box, Program, Mesh } from "ogl";

import Home from "./Home";

export default class Canvas {
  constructor() {
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
    this.createHome();
  }

  createRenderer() {
    this.renderer = new Renderer({
      // alpha: true,
    });

    this.gl = this.renderer.gl;
    this.gl.clearColor(0.78, 0.44, 0.39, 1);

    document.body.appendChild(this.gl.canvas);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.position.z = 5;
  }

  createScene() {
    this.scene = new Transform();
  }

  createHome() {
    this.home = new Home({
      gl: this.gl,
      scene: this.scene,
      sizes: this.sizes,
    });
  }

  /* -------------
   ------------ EVENTS
   -------------- */

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

    if (this.home) {
      this.home.onResize({
        sizes: this.sizes,
      });
    }
  }

  onTouchDown(event) {
    this.isDown = true;
    const x = event.touches ? event.touches[0].clientX : event.clientX;
    const y = event.touches ? event.touches[0].clientY : event.clientY;

    this.x.start = x;
    this.y.start = y;

    if (this.home) {
      this.home.onTouchDown({
        x: this.x,
        y: this.y,
      });
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

    if (this.home) {
      this.home.onTouchMove({
        x: this.x,
        y: this.y,
      });
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

    if (this.home) {
      this.home.onTouchUp({
        x: this.x,
        y: this.y,
      });
    }
  }

  /* -------------
   ------------ LOOP & FRAMES
   -------------- */

  update() {
    if (this.home) {
      this.home.update();
    }
    this.renderer.render({
      scene: this.scene,
      camera: this.camera,
    });
  }
}
