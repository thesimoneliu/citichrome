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

    this.extra = {
      x: 0,
      y: 0,
    }
  }

  createProgram(texture) {
    this.program = new Program(this.gl, {
      vertex,
      fragment,
      uniforms: {
        uAlpha: { value: 1 },
        tMap: { value: texture },
      },
    })
  }

  createMesh(mesh) {
    this.mesh = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    })

    this.mesh.scale.x = mesh.scale.x
    this.mesh.scale.y = mesh.scale.y
    this.mesh.scale.z = mesh.scale.z

    this.mesh.position.x = mesh.position.x
    this.mesh.position.y = mesh.position.y
    this.mesh.position.z = mesh.position.z + 0.01

    this.mesh.setParent(this.scene)
  }

  setElement(element) {
    if (element.id === 'collections') {
      const { index, medias } = this.collections
      const media = medias[index]

      // create mesh and texture
      this.createProgram(media.texture)
      this.createMesh(media.mesh)

      // call transition
      this.transition = 'detail'
    } else {
      this.createProgram(element.texture)
      this.createMesh(element.mesh)
      this.transition = 'collections'
    }
  }
  /* -------------
   ------------ ANIMATIONS
   -------------- */

  // images fade in and out effect
  animate(element, onComplete) {
    const timeline = GSAP.timeline({
      onComplete,
    })

    timeline.to(
      this.mesh.scale,
      {
        duration: 1.5,
        ease: 'expo.inOut',
        x: element.scale.x,
        y: element.scale.y,
        z: element.scale.z,
      },
      0
    )
    timeline.to(
      this.mesh.position,
      {
        duration: 1.5,
        ease: 'expo.inOut',
        onComplete,
        x: element.position.x,
        y: element.position.y,
        z: element.position.z,
      },
      0
    )

    timeline.call((_) => {
      this.scene.removeChild(this.mesh)
    })
  }
}
