import { Mesh, Program, Plane } from 'ogl'

import GSAP from 'gsap'

import vertex from '../../../shaders/plane-vertex.glsl'
import fragment from '../../../shaders/plane-fragment.glsl'

export default class Detail {
  constructor({ gl, scene, sizes, transition }) {
    this.gl = gl
    this.scene = scene
    this.sizes = sizes
    this.transition = transition

    this.geometry = new Plane(this.gl)
    this.element = document.querySelector('.detail__media__image')

    this.createTexture()
    this.createProgram()
    this.createMesh()

    this.show()
  }

  createTexture() {
    const image = this.element.getAttribute('data-src')
    this.texture = window.TEXTURES[image]
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

  show() {
    if (this.transition) {
      this.transition.animate((_) => {
        this.program.uniforms.uAlpha.value = 1
      })
    }
  }

  hide() {}

  /* -------------
   ------------ EVENTS
   -------------- */

  onResize(sizes) {
    this.createBound(sizes)
    this.updateX()
    this.updateY()
  }

  onTouchDown() {}

  onTouchMove() {}

  onTouchUp() {}

  /* -------------
   ------------ LOOPS & FRAMES
   -------------- */

  updateScale() {
    this.height = this.bounds.height / window.innerHeight // height in rem percentage
    this.width = this.bounds.width / window.innerWidth // width in rem percentage

    this.mesh.scale.x = this.sizes.width * this.width
    this.mesh.scale.y = this.sizes.height * this.height
  }

  updateX() {
    this.x = this.bounds.left / window.innerWidth // x position in rem percentage
    this.mesh.position.x = -this.sizes.width / 2 + this.mesh.scale.x / 2 + this.x * this.sizes.width
  }

  updateY() {
    this.y = this.bounds.top / window.innerHeight // y position in rem percentage
    this.mesh.position.y = this.sizes.height / 2 - this.mesh.scale.y / 2 - this.y * this.sizes.height
  }

  update() {
    if (!this.bounds) return
    this.updateX()
    this.updateY()
  }
}
