import { Mesh, Program } from 'ogl'

import GSAP from 'gsap'

import vertex from '../../../shaders/collections-vertex.glsl'
import fragment from '../../../shaders/collections-fragment.glsl'

export default class Media {
  constructor({ element, geometry, gl, index, scene, sizes }) {
    // reusable elements
    this.element = element
    this.geometry = geometry
    this.gl = gl
    this.index = index
    this.scene = scene
    this.sizes = sizes

    this.createTexture()
    this.createProgram()
    this.createMesh()

    this.extra = {
      x: 0,
      y: 0,
    }

    this.opacity = {
      current: 0,
      target: 0,
      ease: 0.1,
      multiplier: 0, // value for animation
    }
  }

  createTexture() {
    const image = this.element.querySelector('.collections__gallery__media__image')
    this.texture = window.TEXTURES[image.getAttribute('data-src')]
  }

  createProgram() {
    this.program = new Program(this.gl, {
      vertex,
      fragment,
      uniforms: {
        uAlpha: { value: 0 },
        tMap: {
          value: this.texture,
        },
      },
    })
  }

  createMesh() {
    this.mesh = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    })
    this.mesh.setParent(this.scene)
  }

  createBound({ sizes }) {
    this.sizes = sizes
    this.bounds = this.element.getBoundingClientRect()

    this.updateScale(sizes)
    this.updateX()
    this.updateY()
  }

  /* -------------
   ------------ ANIMATIONS
   -------------- */

  // images fade in and out effect
  show() {
    GSAP.fromTo(
      this.opacity,
      {
        multiplier: 0,
      },
      {
        // duration: 2,
        // ease: 'expo.inOut',
        multiplier: 1,
      }
    )
    console.log('show animation home page')
  }

  hide() {
    GSAP.to(this.opacity, {
      multiplier: 0,
    })
    console.log('hide animation home page')
  }

  /* -------------
   ------------ EVENTS
   -------------- */

  onResize(sizes, scroll) {
    this.extra = {
      x: 0,
      y: 0,
    }
    this.createBound(sizes)
    this.updateX(scroll ? scroll.x : 0)
    this.updateY(scroll ? scroll.y : 0)
  }

  /* -------------
   ------------ LOOPS & FRAMES
   -------------- */

  updateScale() {
    this.height = this.bounds.height / window.innerHeight // height in rem percentage
    this.width = this.bounds.width / window.innerWidth // width in rem percentage
    // console.log(this.height, this.width);

    this.mesh.scale.x = this.sizes.width * this.width
    this.mesh.scale.y = this.sizes.height * this.height
  }

  updateX(x = 0) {
    this.x = (x + this.bounds.left) / window.innerWidth // x position in rem percentage
    this.mesh.position.x = -this.sizes.width / 2 + this.mesh.scale.x / 2 + this.x * this.sizes.width + this.extra.x
  }

  updateY(y = 0) {
    this.y = (y + this.bounds.top) / window.innerHeight // y position in rem percentage
    this.mesh.position.y = this.sizes.height / 2 - this.mesh.scale.y / 2 - this.y * this.sizes.height + this.extra.y
  }

  update(scroll, index) {
    // position change based on scroll event
    if (!this.bounds) return
    this.updateX(scroll)
    this.updateY(0)

    // this.opacity.target = this.index === index ? 1 : 0.4
    // this.opacity.current = GSAP.utils.interpolate(this.opacity.current, this.opacity.target, this.opacity.ease)
    // this.program.uniforms.uAlpha.value = this.opacity.current * this.opacity.multiplier
    this.program.uniforms.uAlpha.value = this.opacity.multiplier
  }
}
