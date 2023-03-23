import { Plane, Transform } from "ogl";

import GSAP from "gsap";
import map from "lodash/map";

import Gallery from "./Gallery";

export default class About {
  constructor({ gl, scene, sizes }) {
    this.gl = gl;
    this.sizes = sizes;
    this.group = new Transform();

    this.createGeometry();
    this.createGalleries();

    this.group.setParent(scene);

    this.show();
  }

  createGeometry() {
    this.geometry = new Plane(this.gl);
  }

  createGalleries() {
    this.galleriesElement = document.querySelectorAll(".about__gallery");

    this.galleries = map(this.galleriesElement, (element, index) => {
      return new Gallery({
        element,
        geometry: this.geometry,
        index,
        gl: this.gl,
        scene: this.group, // display the geometry in the scene
        sizes: this.sizes,
      });
    });
  }

  /* -------------
   ------------ ANIMATIONS
   -------------- */

  // images fade in and out effect
  show() {
    map(this.galleries, (gallery) => gallery.show());
  }

  hide() {
    map(this.galleries, (gallery) => gallery.hide());
  }

  /* -------------
   ------------ EVENTS
   -------------- */

  onResize(event) {
    map(this.galleries, (gallery) => gallery.onResize(event));
  }

  onTouchDown(event) {
    map(this.galleries, (gallery) => gallery.onTouchDown(event));
  }

  onTouchMove(event) {
    map(this.galleries, (gallery) => gallery.onTouchMove(event));
  }

  onTouchUp(event) {
    map(this.galleries, (gallery) => gallery.onTouchUp(event));
  }

  onWheel() {}

  /* -------------
   ------------ LOOPS & FRAMES
   -------------- */
  update(scroll) {
    map(this.galleries, (gallery) => gallery.update(scroll));
  }

  /* -------------
   ------------ DESTROY
   -------------- */
  destroy() {
    // clear all medias from the scene
    map(this.galleries, (gallery) => gallery.destroy());
  }
}
