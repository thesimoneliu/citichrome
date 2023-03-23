import Component from "classes/Component";

export default class Animation extends Component {
  constructor({ element, elements }) {
    super({
      element,
      elements,
    });

    this.createObserver();
    this.animateOut();
  }

  createObserver() {
    this.observer = new window.IntersectionObserver((entries) => {
      // Each entry describes an intersection change for one observed target element:
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // console.log("animating");
          this.animateIn();
        } else {
          // console.log("animating out");
          this.animateOut();
        }
      });
    });

    this.observer.observe(this.element);
  }

  animateIn() {}

  animateOut() {}

  onResize() {}
}
