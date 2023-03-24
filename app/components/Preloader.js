import { Texture } from 'ogl'
import GSAP from 'gsap'
import { split } from 'utils/text'

import Component from 'classes/Component'

export default class Preloader extends Component {
  constructor({ canvas }) {
    super({
      element: '.preloader',
      elements: {
        title: '.preloader__text',
        number: '.preloader__number',
        numberText: '.preloader__number__text',
      },
    })

    this.canvas = canvas
    window.TEXTURES = {}

    split({
      element: this.elements.title,
      expression: '<br>',
    })

    split({
      element: this.elements.title,
      expression: '<br>',
    })

    this.elements.titleSpans = this.elements.title.querySelectorAll('span span')

    //console.log(this.element, this.elements);

    this.length = 0
    this.createLoader()
  }

  createLoader() {
    // preload all images from asset
    window.ASSETS.forEach((image) => {
      // create texture in the canvas
      const texture = new Texture(this.canvas.gl, {
        generateMipmaps: false,
      })
      // update image value with source once loaded
      const media = new window.Image()
      media.crossOrigin = 'anonymous'
      media.src = image
      media.onload = (_) => {
        texture.image = media
        this.onAssetLoaded()
      }
      // preload all textures
      window.TEXTURES[image] = texture
    })
  }

  onAssetLoaded(image) {
    // calculate loading percentage
    this.length += 1

    const percent = this.length / window.ASSETS.length

    this.elements.numberText.innerHTML = `${Math.round(percent * 100)}%`

    if (percent === 1) {
      this.onLoaded()
    }
  }

  onLoaded() {
    return new Promise((resolve) => {
      this.emit('completed')

      this.animationOut = GSAP.timeline({
        delay: 2,
      })

      this.animationOut.to(this.elements.titleSpans, {
        duration: 1.5,
        ease: 'expo.out',
        stagger: 0.1,
        y: '100%',
      })

      this.animationOut.to(this.elements.numberText, {
        duration: 1.5,
        ease: 'expo.out',
        stagger: 0.1,
        y: '100%',
      })

      this.animationOut.to(this.element, {
        autoAlpha: 0,
        duration: 1,
      })

      this.animationOut.call((_) => {
        this.destroy()
      })
    })
  }

  destroy() {
    console.log(this.element, this.element.parentNode)
    this.element.parentNode.removeChild(this.element)
  }
}
