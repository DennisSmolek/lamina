import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { LayerMaterial, Color, Depth, Fresnel, Noise } from 'lamina/vanilla'
import { Vector3 } from 'three'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.001, 1000)
camera.position.set(2, 0, 0)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setClearColor('#ebebeb')
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.domElement.style.width = '100%'
renderer.domElement.style.height = '100%'
document.body.appendChild(renderer.domElement)

const flowerGeometry = new THREE.TorusKnotGeometry(0.4, 0.05, 400, 32, 3, 7)
const flowerMaterial = new LayerMaterial({
  lighting: 'none',
  color: '#ff4eb8',
  layers: [
    new Depth({
      far: 3,
      origin: [1, 1, 1],
      colorA: '#ff00e3',
      colorB: '#00ffff',
      alpha: 0.5,
      mode: 'multiply',
    }),
    new Depth({
      name: 'MouseDepth',
      near: 0.25,
      far: 2,
      origin: [-0.9760456268614979, 0.48266696923176067, 0],
      colorA: [1, 0.7607843137254902, 0] as any,
      alpha: 0.5,
      mode: 'lighten',
      mapping: 'vector',
    }),
    new Fresnel({
      mode: 'softlight',
    }),
  ],
})

const flowerMesh = new THREE.Mesh(flowerGeometry, flowerMaterial)
flowerMesh.rotateY(Math.PI / 2)
flowerMesh.scale.setScalar(2)
scene.add(flowerMesh)

const geometry = new THREE.SphereGeometry(1, 64, 64)
const material = new LayerMaterial({
  lighting: 'none',
  side: THREE.BackSide,
  layers: [
    new Color({
      color: '#b02ed2',
    }),
    new Depth({
      near: 0,
      far: 300,
      origin: [100, 100, 100],
      colorA: '#ff0000',
      colorB: '#00aaff',
      alpha: 0.5,
      mode: 'multiply',
    }),
  ],
})

const mesh = new THREE.Mesh(geometry, material)
mesh.scale.setScalar(100)
scene.add(mesh)

{
  const geometry = new THREE.SphereGeometry(0.2, 64, 64)
  const material = new THREE.MeshPhysicalMaterial({
    transmission: 1,
    // @ts-ignore
    thickness: 10,
    roughness: 0.2,
  })

  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)
}

const controls = new OrbitControls(camera, renderer.domElement)

const pLight = new THREE.PointLight()
pLight.position.set(10, 10, 5)
scene.add(pLight)
const pLight2 = new THREE.PointLight('#00ffff')
pLight2.position.set(-10, -10, -5)
scene.add(pLight2)

const clock = new THREE.Clock()

const depthLayer = flowerMaterial.layers.find((e) => e.name === 'MouseDepth')
const vec = new THREE.Vector3()
window.addEventListener('mousemove', (e) => {
  const m = new THREE.Vector2(
    THREE.MathUtils.mapLinear(e.x / window.innerWidth, 0, 1, 1, -1),
    THREE.MathUtils.mapLinear(e.y / window.innerHeight, 0, 1, 1, -1)
  )

  // @ts-ignore
  depthLayer.origin = vec.set(-m.y, m.x, 0)
})

function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
  controls.update()

  const delta = clock.getDelta()
  mesh.rotation.x = mesh.rotation.y = mesh.rotation.z += delta
  flowerMesh.rotation.z += delta / 2
}

animate()
