import each from "lodash/each";
import NormalizeWheel from "normalize-wheel";

import Detection from "classes/Detection";
// import WebGL Canvas
import Canvas from "components/Canvas";
// import components
import Navigation from "components/Navigation";
import Preloader from "components/Preloader";
// import pages
import About from "pages/About";
import Collections from "pages/Collections";
import Detail from "pages/Detail";
import Home from "pages/Home";

class App {
  constructor() {
    this.createContent();

    this.createCanvas();
    this.createNavigation();
    this.createPreloader();
    this.createPages();

    this.onResize();

    this.update();

    this.addEventListeners();
    this.addLinkListeners();
  }

  createNavigation() {
    this.navigation = new Navigation({
      template: this.template,
    });
  }

  createPreloader() {
    this.preloader = new Preloader();
    this.preloader.once("completed", this.onPreloaded.bind(this));
  }

  createCanvas() {
    this.canvas = new Canvas({ template: this.template });
  }

  createContent() {
    this.content = document.querySelector(".content");
    this.template = this.content.getAttribute("data-template");
  }

  createPages() {
    this.pages = {
      about: new About(),
      collections: new Collections(),
      detail: new Detail(),
      home: new Home(),
    };

    this.page = this.pages[this.template];
    this.page.create();
    //console.log(this.page);
    // this.page.show();
    // this.page.hide();
  }

  /* -------------
   ------------ EVENTS
   -------------- */

  async onChange({ url, push = true }) {
    this.canvas.onChangeInit();

    await this.page.hide();

    const request = await window.fetch(url);

    if (request.status === 200) {
      const html = await request.text();
      const div = document.createElement("div"); //a fake div to hold the current page content

      if (push) {
        window.history.pushState({}, "", url);
      }

      div.innerHTML = html;

      const divContent = div.querySelector(".content");

      this.template = divContent.getAttribute("data-template");

      // page transition settings
      this.navigation.onChange(this.template);
      this.content.setAttribute("data-template", this.template);
      this.content.innerHTML = divContent.innerHTML;
      this.canvas.onChange(this.template);

      this.page = this.pages[this.template];
      this.page.create();

      this.onResize();
      this.page.show();

      this.addLinkListeners();
    } else {
      console.log("Error");
    }
  }

  onResize() {
    if (this.page && this.page.onResize) {
      this.page.onResize();
    }

    window.requestAnimationFrame((_) => {
      if (this.canvas && this.canvas.onResize) {
        this.canvas.onResize();
      }
    });
  }

  onWheel(event) {
    // entry point
    const normalizeWheel = NormalizeWheel(event); // smooth scroll

    if (this.canvas && this.canvas.onWheel) {
      this.canvas.onWheel(normalizeWheel);
    }
    if (this.page && this.page.onWheel) {
      this.page.onWheel(normalizeWheel);
    }
  }

  onTouchDown(event) {
    if (this.canvas && this.canvas.onTouchDown) {
      this.canvas.onTouchDown(event);
    }
  }
  onTouchMove(event) {
    if (this.canvas && this.canvas.onTouchMove) {
      this.canvas.onTouchMove(event);
    }
  }
  onTouchUp(event) {
    if (this.canvas && this.canvas.onTouchUp) {
      this.canvas.onTouchUp(event);
    }
  }

  onPreloaded() {
    this.onResize();
    this.preloader.destroy();
    this.page.show();
  }

  onPopState() {
    url: this.onChange(window.location.pathname);
    push: false;
  }

  /* -------------
   ------------ LISTENERS
   -------------- */

  addEventListeners() {
    window.addEventListener("popstate", this.onPopState.bind(this));

    window.addEventListener("mousewheel", this.onWheel.bind(this));

    window.addEventListener("mousedown", this.onTouchDown.bind(this));
    window.addEventListener("mousemove", this.onTouchMove.bind(this));
    window.addEventListener("mouseup", this.onTouchUp.bind(this));

    window.addEventListener("touchstart", this.onTouchDown.bind(this));
    window.addEventListener("touchmove", this.onTouchMove.bind(this));
    window.addEventListener("touchend", this.onTouchUp.bind(this));

    window.addEventListener("resize", this.onResize.bind(this));
  }

  addLinkListeners() {
    const links = document.querySelectorAll("a");

    each(links, (link) => {
      link.onclick = (event) => {
        event.preventDefault();

        const { href } = link;

        this.onChange({ url: href });
        //console.log(event, link, href);
      };
    });
  }

  /* -------------
   ------------ LOOP & FRAMES
   -------------- */

  update() {
    if (this.page && this.page.update) {
      this.page.update();
    }

    if (this.canvas && this.canvas.update) {
      this.canvas.update(this.page.scroll);
    }

    this.frame = window.requestAnimationFrame(this.update.bind(this));
  }
}

new App();
