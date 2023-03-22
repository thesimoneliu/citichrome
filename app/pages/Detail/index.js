import Button from "classes/Buttons";
import Page from "classes/Page";

export default class Detail extends Page {
  constructor() {
    super({
      id: "detail",
      element: ".detail",
      elements: {
        button: ".detail__button",
      },
    });
  }

  create() {
    super.create();

    this.link = new Button({
      element: this.elements.button,
    });
    console.log(this.link);
  }

  destroy() {
    // make sure to extend the funtion not override
    super.destroy();
    this.link.removeEventListeners();
  }
}
