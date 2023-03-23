import { Plane, Transform } from "ogl";
import GSAP from "gsap";
import map from "lodash/map";

import Media from "./Media";

export default class Home {
  constructor({ gl, scene, sizes }) {
    this.gl = gl;
    this.scene = scene;
    this.sizes = sizes;

    this.group = new Transform();

    this.galleryElement = document.querySelector(".home__gallery");
    this.mediaElements = document.querySelectorAll(
      ".home__gallery__media__image"
    );

    this.x = {
      current: 0,
      target: 0,
      ease: 0.1,
    };

    this.y = {
      current: 0,
      target: 0,
      ease: 0.1,
    };

    this.scrollCurrent = {
      x: 0,
      y: 0,
    };
    this.scroll = {
      x: 0,
      y: 0,
    };

    // create WebGL elements
    this.createGeometry();
    this.createGallery();
    this.group.setParent(scene);

    this.show();
  }

  createGeometry() {
    this.geometry = new Plane(this.gl);
  }

  createGallery() {
    this.medias = map(this.mediaElements, (element, index) => {
      return new Media({
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

    this.galleryBounds = this.galleryElement.getBoundingClientRect(); // create gallery bounds
    this.gallerySizes = {
      width: (this.galleryBounds.width / window.innerWidth) * this.sizes.width, // get gallery net width in webgl environment
      height:
        (this.galleryBounds.height / window.innerHeight) * this.sizes.height,
    };

    this.scroll.x = this.x.target = 0;
    this.scroll.y = this.y.target = 0;

    map(this.medias, (media) => media.onResize(event, this.scroll));
  }

  onTouchDown({ x, y }) {
    this.scrollCurrent.x = this.scroll.x;
    this.scrollCurrent.y = this.scroll.y;
  }

  onTouchMove({ x, y }) {
    const xDistance = x.start - x.end;
    const yDistance = y.start - y.end;

    this.x.target = this.scrollCurrent.x - xDistance;
    this.y.target = this.scrollCurrent.y - yDistance;
  }

  onTouchUp({ x, y }) {}

  onWheel({ pixelX, pixelY }) {
    this.x.target += pixelX;
    this.y.target += pixelY;
  }

  /* -------------
   ------------ LOOPS & FRAMES
   -------------- */
  update() {
    if (!this.galleryBounds) return;

    this.x.current = GSAP.utils.interpolate(
      this.x.current,
      this.x.target,
      this.x.ease
    );
    this.y.current = GSAP.utils.interpolate(
      this.y.current,
      this.y.target,
      this.y.ease
    );

    if (this.scroll.x < this.x.current) {
      this.x.direction = "right";
    } else {
      this.x.direction = "left";
    }
    if (this.scroll.y < this.y.current) {
      this.y.direction = "up";
    } else {
      this.y.direction = "down";
    }
    //console.log(this.x.direction);

    this.scroll.x = this.x.current;
    this.scroll.y = this.y.current;

    map(this.medias, (media, index) => {
      const scaleX = media.mesh.scale.x / 2;
      const scaleY = media.mesh.scale.y / 2;

      // horizontal scroll
      if (this.x.direction === "left") {
        const x = media.mesh.position.x + scaleX; //check the right edge of the image
        if (x < -this.sizes.width / 2) {
          media.extra.x += this.gallerySizes.width; // move to the right side
          media.mesh.rotation.z = GSAP.utils.random(
            -Math.PI * 0.02,
            Math.PI * 0.02
          );
        }
      } else if (this.x.direction === "right") {
        const x = media.mesh.position.x - scaleX; //check the left edge of the image
        if (x > this.sizes.width / 2) {
          media.extra.x -= this.gallerySizes.width; // move to the left side
          media.mesh.rotation.z = GSAP.utils.random(
            -Math.PI * 0.02,
            Math.PI * 0.02
          );
        }
      }

      // vertical scroll
      if (this.y.direction === "up") {
        const y = media.mesh.position.y + scaleY / 2; //check the bottom edge of the image
        if (y < -this.sizes.height / 2) {
          media.extra.y += this.gallerySizes.height;
          media.mesh.rotation.z = GSAP.utils.random(
            -Math.PI * 0.02,
            Math.PI * 0.02
          );
        }
      } else if (this.y.direction === "down") {
        const y = media.mesh.position.y - scaleY / 2; //check the top edge of the image
        if (y > this.sizes.height / 2) {
          media.extra.y -= this.gallerySizes.height;
          media.mesh.rotation.z = GSAP.utils.random(
            -Math.PI * 0.02,
            Math.PI * 0.02
          );
        }
      }

      // update scroll position
      media.update(this.scroll);
    });
  }

  /* -------------
   ------------ DESTROY
   -------------- */

  destroy() {
    this.scene.removeChild(this.group);
  }
}
