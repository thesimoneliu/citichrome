import { Plane, Transform } from 'ogl'

import GSAP from 'gsap'
import map from 'lodash/map'
import Prefix from 'prefix'

import Media from './Media'

export default class Collections {
  constructor({ gl, scene, sizes }) {
    this.gl = gl
    this.scene = scene
    this.sizes = sizes

    this.group = new Transform()

    this.titleElements = document.querySelector('.collections__titles')
    this.galleryElement = document.querySelector('.collections__gallery')
    this.transformPrefix = Prefix('transform')

    this.collectionElements = document.querySelectorAll('.collections__article')
    this.collectionElementsActive = 'collections__article--active'

    this.scroll = {
      current: 0,
      start: 0,
      target: 0,
      ease: 0.1,
      velocity: 1,
    }

    this.createGeometry()
    this.createGallery()
    this.group.setParent(scene)

    this.show()
  }

  createGeometry() {
    this.geometry = new Plane(this.gl)
  }

  createGallery() {
    this.mediaElements = document.querySelectorAll('.collections__gallery__media')

    this.medias = map(this.mediaElements, (element, index) => {
      return new Media({
        element,
        geometry: this.geometry,
        index,
        gl: this.gl,
        scene: this.group, // display the geometry in the scene
        sizes: this.sizes,
      })
    })
  }

  /* -------------
   ------------ ANIMATIONS
   -------------- */

  // images fade in and out effect
  show() {
    map(this.medias, (media) => media.show())
  }

  hide() {
    map(this.medias, (media) => media.hide())
  }

  /* -------------
   ------------ EVENTS
   -------------- */

  onChange(index) {
    this.index = index

    // get each image's collection index
    const selectedCollectionIndex = parseInt(this.mediaElements[this.index].getAttribute('data-index'))
    console.log(selectedCollectionIndex)

    // turn the indexed collection to active
    map(this.collectionElements, (element, elementIndex) => {
      if (elementIndex === selectedCollectionIndex) {
        element.classList.add(this.collectionElementsActive)
      } else {
        element.classList.remove(this.collectionElementsActive)
      }
    })

    // translate Y value of the collection title based on each image's collection index
    this.titleElements.style[this.transformPrefix] = `translateY(${
      150 * selectedCollectionIndex
    }%) translate(-50%,-270%) rotate(-90deg)`
  }

  onResize(event) {
    this.sizes = event.sizes

    this.elementWrapper = document.querySelector('.collections__gallery__wrapper')
    this.bounds = this.elementWrapper.getBoundingClientRect()

    this.scroll.current = this.scroll.target = 0
    this.scroll.limit = this.bounds.width - this.medias[0].element.clientWidth

    map(this.medias, (media) => media.onResize(event, this.scroll))
  }

  onTouchDown({ x, y }) {
    this.scroll.start = this.scroll.current
  }

  onTouchMove({ x, y }) {
    const dist = x.start - x.end
    this.scroll.target = this.scroll.start - dist
  }

  onTouchUp({ x, y }) {}

  onWheel() {}

  /* -------------
   ------------ LOOPS & FRAMES
   -------------- */
  update() {
    if (!this.bounds) return

    // console.log("update:", this.scroll);
    this.scroll.target = GSAP.utils.clamp(-this.scroll.limit, 0, this.scroll.target)
    // smooth scrolling
    this.scroll.current = GSAP.utils.interpolate(this.scroll.current, this.scroll.target, this.scroll.ease)

    // match gallery to the scroll value
    this.galleryElement.style[this.transformPrefix] = `translateX(${this.scroll.current}px)`

    if (this.scroll.current < this.scroll.target) {
      this.direction = 'right'
    } else {
      this.direction = 'left'
    }

    map(this.medias, (media, index) => {
      media.update(this.scroll.current)
    })

    // calculate image's index
    const index = Math.floor(Math.abs(this.scroll.current / this.scroll.limit) * this.medias.length)
    // give an index to each image
    if (this.index !== index) {
      this.onChange(index)
    }
  }

  /* -------------
   ------------ DESTROY
   -------------- */
  destroy() {
    this.scene.removeChild(this.group)
  }
}
