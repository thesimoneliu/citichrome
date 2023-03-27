import { Mesh, Program } from 'ogl'

import GSAP from 'gsap'

import vertex from '../../../shaders/home-vertex.glsl'
import fragment from '../../../shaders/home-fragment.glsl'

export default class Media {
  constructor({ element, geometry, gl, index, scene, sizes }) {
    // reusable elements
    this.element = element
    this.geometry = geometry
    this.gl = gl
    this.index = index
    this.scene = scene
    this.sizes = sizes

    this.extra = {
      x: 0,
      y: 0,
    }

    this.createTexture()
    this.createProgram()
    this.createMesh()
    this.createBound({ sizes: this.sizes })
  }

  createTexture() {
    const image = this.element
    this.texture = window.TEXTURES[image.getAttribute('data-src')]
  }

  createProgram() {
    this.program = new Program(this.gl, {
      vertex,
      fragment,
      uniforms: {
        uAlpha: { value: 0.3 }, // faded image effect
        uSpeed: { value: 0 },
        uViewportSizes: { value: [this.sizes.width, this.sizes.height] },
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

    this.mesh.rotation.z = GSAP.utils.random(-Math.PI * 0.02, Math.PI * 0.02)
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
      this.program.uniforms.uAlpha,
      {
        value: 0,
      },
      {
        duration: 2,
        ease: 'expo.inOut',
        value: 0.4,
      }
    )
  }

  hide() {
    GSAP.to(this.program.uniforms.uAlpha, {
      value: 0,
    })
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

  update(scroll, speed) {
    // position change based on scroll event
    this.updateX(scroll.x)
    this.updateY(scroll.y)

    this.program.uniforms.uSpeed.value = speed
  }
}
