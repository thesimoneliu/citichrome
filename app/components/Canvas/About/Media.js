import { Mesh, Program } from 'ogl'

import GSAP from 'gsap'

import vertex from '../../../shaders/plane-vertex.glsl'
import fragment from '../../../shaders/plane-fragment.glsl'

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

    this.extra = 0
  }

  createTexture() {
    const image = this.element.querySelector('img')
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

    this.updateScale()
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
        value: 1,
      }
    )
    console.log('show animation about page')
  }

  hide() {
    GSAP.to(this.program.uniforms.uAlpha, {
      value: 0,
    })
    console.log('hide animation about page')
  }

  /* -------------
   ------------ EVENTS
   -------------- */

  onResize(sizes, scroll) {
    this.extra = 0
    this.createBound(sizes)
    this.updateX(scroll)
    this.updateY(0)
  }

  /* -------------
   ------------ LOOPS & FRAMES
   -------------- */

  updateRotation() {
    this.mesh.rotation.z = GSAP.utils.mapRange(
      -this.sizes.width / 2,
      this.sizes.width / 2,
      Math.PI * 0.12,
      -Math.PI * 0.12,
      this.mesh.position.x
    )
  }
  updateScale() {
    this.height = this.bounds.height / window.innerHeight // height in rem percentage
    this.width = this.bounds.width / window.innerWidth // width in rem percentage
    // console.log(this.height, this.width);

    this.mesh.scale.x = this.sizes.width * this.width
    this.mesh.scale.y = this.sizes.height * this.height

    const scale = GSAP.utils.mapRange(0, this.sizes.width / 2, 0.11, 0, Math.abs(this.mesh.position.x))
    this.mesh.scale.x += scale
    this.mesh.scale.y += scale
  }

  updateX(x = 0) {
    this.x = (x + this.bounds.left) / window.innerWidth // x position in rem percentage
    this.mesh.position.x = -this.sizes.width / 2 + this.mesh.scale.x / 2 + this.x * this.sizes.width + this.extra
  }

  updateY(y = 0) {
    this.y = (y + this.bounds.top) / window.innerHeight // y position in rem percentage
    this.mesh.position.y = this.sizes.height / 2 - this.mesh.scale.y / 2 - this.y * this.sizes.height
    this.mesh.position.y += Math.cos((this.mesh.position.x / this.sizes.width) * Math.PI * 0.1) * 50 - 50
  }

  update(scrollCurrent) {
    // position change based on scroll event
    if (!this.bounds) return

    this.updateRotation()
    this.updateX(scrollCurrent)
    this.updateY(0)
    this.updateScale()
  }
}
