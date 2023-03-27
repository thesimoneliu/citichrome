import Button from 'classes/Buttons'
import Page from 'classes/Page'
import GSAP from 'gsap'

export default class Detail extends Page {
  constructor() {
    super({
      id: 'detail',
      element: '.detail',
      elements: {
        button: '.detail__button',
      },
    })
  }

  create() {
    super.create()

    this.link = new Button({
      element: this.elements.button,
    })
    console.log(this.link)
  }

  show() {
    // 2 seconds after Webgl image shows
    const timeline = GSAP.timeline({
      delay: 2,
    })

    timeline.fromTo(
      this.element,
      {
        autoAlpha: 0,
      },
      {
        autoAlpha: 1,
      }
    )

    super.show(timeline)
  }

  destroy() {
    // make sure to extend the funtion not override
    super.destroy()
    this.link.removeEventListeners()
  }
}
