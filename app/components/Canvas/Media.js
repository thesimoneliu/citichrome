import { Mesh, Program, Texture } from "ogl";

import vertex from "shaders/plane-vertex.glsl";
import fragment from "shaders/plane-fragment.glsl";

export default class Media {
  constructor({ element, geometry, gl, index, scene, sizes }) {
    // reusable elements
    this.element = element;
    this.geometry = geometry;
    this.gl = gl;
    this.index = index;
    this.scene = scene;
    this.sizes = sizes;

    this.createTexture();
    this.createProgram();
    this.createMesh();
    this.createBound({
      sizes: this.sizes,
    });
  }

  createTexture() {
    // Upload empty texture while source loading
    this.texture = new Texture(this.gl);

    // console.log(this.element);
    // update image value with source once loaded
    this.image = new window.Image();
    this.image.crossOrigin = "anonymous";
    this.image.src = this.element.getAttribute("data-src");
    this.image.onload = () => (this.texture.image = this.image);
  }

  createProgram() {
    this.program = new Program(this.gl, {
      vertex,
      fragment,
      uniforms: {
        tMap: {
          value: this.texture,
        },
      },
    });
  }

  createMesh() {
    this.mesh = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    });
    this.mesh.setParent(this.scene);
  }

  createBound({ sizes }) {
    this.sizes = sizes;
    this.bounds = this.element.getBoundingClientRect();

    this.updateScale(sizes);
    this.updateX();
    this.updateY();
  }

  /* -------------
   ------------ EVENTS
   -------------- */

  onResize(sizes) {
    this.createBound(sizes);
  }

  /* -------------
   ------------ LOOPS & FRAMES
   -------------- */

  updateScale() {
    this.height = this.bounds.height / window.innerHeight; // height in rem percentage
    this.width = this.bounds.width / window.innerWidth; // width in rem percentage
    // console.log(this.height, this.width);

    this.mesh.scale.x = this.sizes.width * this.width;
    this.mesh.scale.y = this.sizes.height * this.height;
  }

  updateX(x = 0) {
    this.x = (x + this.bounds.left) / window.innerWidth; // x position in rem percentage
    this.mesh.position.x =
      -this.sizes.width / 2 + this.mesh.scale.x / 2 + this.x * this.sizes.width;
  }

  updateY(y = 0) {
    this.y = (y + this.bounds.top) / window.innerHeight; // y position in rem percentage
    this.mesh.position.y =
      this.sizes.height / 2 -
      this.mesh.scale.y / 2 -
      this.y * this.sizes.height;
  }

  update(scroll) {
    // position change based on scroll event
    if (!this.bounds) return;
    this.updateX(scroll.x);
    this.updateY(scroll.y);
  }
}
