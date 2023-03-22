// import libraries
import NormalizeWheel from "normalize-wheel";
import GSAP from "gsap";
import Prefix from "prefix";
import each from "lodash/each";
import map from "lodash/map";

// import components
import Title from "animations/Title";
import Paragraph from "animations/Paragraph";
import Label from "animations/Label";
import Highlight from "animations/Highlight";

// import classes
import AsyncLoad from "classes/AsyncLoad";

// import components
import { ColorManager } from "classes/Colors";

export default class Page {
  constructor({ id, element, elements }) {
    this.id = id;
    this.selector = element;
    this.selectorChildren = {
      ...elements,
      animationsTitles: '[data-animation="title"]',
      animationsParagraphs: '[data-animation="paragraph"]',
      animationsLabels: '[data-animation="label"]',
      animationsHighlights: '[data-animation="highlight"]',

      preloaders: "[data-src]",
    };

    this.scroll = {
      ease: 0.1,
      position: 0,
      current: 0,
      target: 0,
      limit: 0,
    };

    this.transformPrefix = Prefix("transform");
  }

  create() {
    this.element = document.querySelector(this.selector);
    this.elements = {};

    this.scroll = {
      ease: 0.07,
      position: 0,
      current: 0,
      target: 0,
      limit: 0,
    };

    each(this.selectorChildren, (entry, key) => {
      if (
        entry instanceof window.HTMLElement ||
        entry instanceof window.NodeList ||
        Array.isArray(entry)
      ) {
        this.elements[key] = entry; // what's the key and entry here?
      } else {
        this.elements[key] = document.querySelectorAll(entry);

        if (this.elements[key].length === 0) {
          this.elements[key] = null;
        } else if (this.elements[key].length === 1) {
          this.elements[key] = document.querySelector(entry);
        }
      }
      // console.log(this.elements);
    });

    this.createAnimations();
    this.createPreloader();
  }

  createAnimations() {
    this.animations = [];

    // Titles
    this.animationsTitles = map(this.elements.animationsTitles, (element) => {
      return new Title({
        element,
      });
    });
    this.animations.push(...this.animationsTitles);

    // Paragraphs
    this.animationsParagraphs = map(
      this.elements.animationsParagraphs,
      (element) => {
        return new Paragraph({
          element,
        });
      }
    );
    this.animations.push(...this.animationsParagraphs);

    // Labels
    this.animationsLabels = map(this.elements.animationsLabels, (element) => {
      return new Label({
        element,
      });
    });
    this.animations.push(...this.animationsLabels);

    // Highlights
    this.animationsHighlights = map(
      this.elements.animationsHighlights,
      (element) => {
        return new Highlight({
          element,
        });
      }
    );
    this.animations.push(...this.animationsHighlights);
  }

  createPreloader() {
    this.preloaders = map(this.elements.preloaders, (element) => {
      return new AsyncLoad({ element });
    });

    // console.log(this.elements, this.elements.preloaders, this.preloaders);
  }

  /* -------------
   ------------ ANIMATION
   -------------- */

  show() {
    return new Promise((resolve) => {
      ColorManager.change({
        backgroundColor: this.element.getAttribute("data-background"),
        color: this.element.getAttribute("data-color"),
      });
      //console.log(this.element);

      this.animationIn = GSAP.timeline();

      this.animationIn.fromTo(
        this.element,
        {
          autoAlpha: 0,
        },
        {
          autoAlpha: 1,
        }
      );

      this.animationIn.call((_) => {
        this.addEventListeners();

        resolve();
      });
    });
  }

  hide() {
    return new Promise((resolve) => {
      this.removeEventListeners();

      this.animationOut = GSAP.timeline();

      this.animationOut.to(this.element, {
        autoAlpha: 0,
        onComplete: resolve,
      });
    });
  }

  /* -------------
   ------------ DESTROY
   -------------- */

  destroy() {
    this.removeEventListeners();
  }

  /* -------------
   ------------ EVENTS
   -------------- */

  onResize() {
    if (!this.elements.wrapper) return;

    window.requestAnimationFrame((_) => {
      this.scroll.limit =
        this.elements.wrapper.clientHeight - window.innerHeight;
    });

    each(this.animations, (animation) => animation.onResize());
  }

  onMouseWheel(event) {
    const { pixelY } = NormalizeWheel(event);
    this.scroll.target += pixelY;
  }

  /* -------------
  ------------ LISTENERS
  -------------- */

  addEventListeners() {
    window.addEventListener("mousewheel", this.onMouseWheel);
  }

  removeEventListeners() {
    window.removeEventListener("mousewheel", this.onMouseWheel);
  }

  /* -------------
  ------------ LOOPS AND FRAMES
  -------------- */

  update() {
    //console.log(this.scroll.target);
    this.scroll.target = GSAP.utils.clamp(
      0,
      this.scroll.limit,
      this.scroll.target
    );

    this.scroll.current = GSAP.utils.interpolate(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease
    );
    this.scroll.current = Math.floor(this.scroll.current);

    if (this.scroll.current < 0.1) {
      this.scroll.current = 0;
    }

    if (this.elements.wrapper) {
      this.elements.wrapper.style[
        this.transformPrefix
      ] = `translateY(-${this.scroll.current}px)`;
    }
  }
}
