import { Mesh, Plane, Program } from 'ogl'

import GSAP from 'gsap'

import vertex from '../../shaders/plane-vertex.glsl'
import fragment from '../../shaders/plane-fragment.glsl'

export default class Transition {
  constructor({ collections, gl, scene, sizes, url }) {
    this.collections = collections
    this.gl = gl
    this.scene = scene
    this.sizes = sizes
    this.url = url

    this.geometry = new Plane(this.gl)

    this.createTexture()
    this.createProgram()
    this.createMesh()

    this.extra = {
      x: 0,
      y: 0,
    }
  }

  createTexture() {
    const { index, medias } = this.collections
    this.media = medias[index]
    //const image = this.element.querySelector('.collections__gallery__media__image')
    //this.texture = window.TEXTURES[image.getAttribute('data-src')]
  }

  createProgram() {
    this.program = new Program(this.gl, {
      vertex,
      fragment,
      uniforms: {
        uAlpha: { value: 1 },
        tMap: {
          value: this.media.texture,
        },
      },
    })
  }

  createMesh() {
    this.mesh = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    })

    this.mesh.scale.x = this.media.mesh.scale.x
    this.mesh.scale.y = this.media.mesh.scale.y
    this.mesh.scale.z = this.media.mesh.scale.z

    this.mesh.position.z = this.media.mesh.scale.z + 0.01

    this.mesh.setParent(this.scene)
  }

  /* -------------
   ------------ ANIMATIONS
   -------------- */

  // images fade in and out effect
  animate(element, flag) {
    if (flag === 'detail') {
      console.log(element)

      GSAP.to(this.mesh.scale, {
        duration: 1.5,
        ease: 'expo.inOut',
        x: element.mesh.scale.x,
        y: element.mesh.scale.y,
        z: element.mesh.scale.z,
      })
      GSAP.to(this.mesh.position, {
        duration: 1.5,
        ease: 'expo.inOut',
        x: element.mesh.position.x,
        y: element.mesh.position.y,
        z: element.mesh.position.z,
      })
    }
  }

  animateCollections() {}
}
