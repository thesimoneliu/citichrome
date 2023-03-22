import Button from "classes/Buttons";
import Page from "classes/Page";

export default class Home extends Page {
  constructor() {
    super({
      id: "home",
      element: ".home",
      elements: {
        navigation: document.querySelector(".navigation"), //key, entry
        link: ".home__link",
      },
    });
  }

  create() {
    super.create();

    this.link = new Button({
      element: this.elements.link,
    });
    // this.elements.link.addEventListener("click", (_) => console.log("Oh, you clicked me!") );
  }

  destroy() {
    // make sure to extend the funtion not override
    super.destroy();
    this.link.removeEventListeners();
  }
}
