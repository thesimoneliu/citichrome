import { Transform } from "ogl";

import GSAP from "gsap";
import map from "lodash/map";

import Media from "./Media";

export default class Gallery {
  constructor({ element, index, geometry, gl, scene, sizes }) {
    this.index = index;
    this.element = element;
    this.elementWrapper = element.querySelector(".about__gallery__wrapper");
    this.geometry = geometry;
    this.gl = gl;
    this.scene = scene;
    this.sizes = sizes;

    this.group = new Transform();

    this.scroll = {
      current: 0,
      start: 0,
      target: 0,
      ease: 0.1,
      velocity: 1,
    };

    this.createMedias();
    this.group.setParent(this.scene);
  }

  createMedias() {
    this.mediasElements = document.querySelectorAll(".about__gallery__image");

    this.medias = map(this.mediasElements, (element, index) => {
      return new Media({
        element,
        geometry: this.geometry,
        index,
        gl: this.gl,
        scene: this.group,
        sizes: this.sizes,
      });
    });
  }

  /* -------------
   ------------ ANIMATIONS
   -------------- */

  // images fade in and out effect
  show() {
    map(this.medias, (media) => media.show());
  }

  hide() {
    map(this.medias, (media) => media.hide());
  }

  /* -------------
   ------------ EVENTS
   -------------- */

  onResize(event) {
    this.sizes = event.sizes;

    this.bounds = this.elementWrapper.getBoundingClientRect();
    this.width = (this.bounds.width / window.innerWidth) * this.sizes.width;
    this.scroll.current = this.scroll.target = 0;

    map(this.medias, (media) => media.onResize(event, this.scroll.current));
  }

  onTouchDown({ x, y }) {
    this.scroll.start = this.scroll.current;
  }

  onTouchMove({ x, y }) {
    const dist = x.start - x.end;
    this.scroll.target = this.scroll.start - dist;
  }

  onTouchUp({ x, y }) {}

  /* -------------
   ------------ LOOPS & FRAMES
   -------------- */
  update(scroll) {
    if (!this.bounds) return;

    const dist = scroll.current - scroll.target;
    const y = scroll.current / window.innerHeight;

    if (this.scroll.current < this.scroll.target) {
      this.direction = "right";
      this.scroll.velocity = -0.3;
    } else {
      this.direction = "left";
      this.scroll.velocity = 0.3;
    }

    this.scroll.target -= this.scroll.velocity + dist * 0.05; // sync with page scroll

    this.scroll.current = GSAP.utils.interpolate(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease
    );

    map(this.medias, (media, index) => {
      const scaleX = media.mesh.scale.x / 2 + 0.25;

      // horizontal scroll
      if (this.direction === "left") {
        const x = media.mesh.position.x + scaleX; //check the left edge of the image
        if (x < -this.sizes.width / 2) {
          media.extra += this.width; // move to the right side
        }
      } else if (this.direction === "right") {
        const x = media.mesh.position.x - scaleX; //check the right edge of the image
        if (x > this.sizes.width / 2) {
          media.extra -= this.width; // move to the left side
        }
      }

      media.mesh.position.y =
        Math.cos((media.mesh.position.x / this.width) * Math.PI) * 75 - 75;

      // update scroll position
      media.update(this.scroll.current);
    });

    this.group.position.y = y * this.sizes.height;
  }

  /* -------------
   ------------ DESTROY
   -------------- */

  destroy() {
    this.scene.removeChild(this.group);
  }
}
