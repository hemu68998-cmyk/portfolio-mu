import * as THREE from 'three'

export function createCorgi() {
  const dog = new THREE.Group()
  const materials = {
    fur: new THREE.MeshStandardMaterial({ color: 0xd89a70, roughness: 0.8 }),
    cream: new THREE.MeshStandardMaterial({ color: 0xffe6c9, roughness: 0.86 }),
    brown: new THREE.MeshStandardMaterial({ color: 0x713b26, roughness: 0.62 }),
    leather: new THREE.MeshStandardMaterial({ color: 0x8f4d30, roughness: 0.5 }),
    red: new THREE.MeshStandardMaterial({ color: 0xd7284b, roughness: 0.46 }),
    redDark: new THREE.MeshStandardMaterial({ color: 0x9f1638, roughness: 0.52 }),
    black: new THREE.MeshStandardMaterial({ color: 0x171319, roughness: 0.3 }),
    metal: new THREE.MeshStandardMaterial({ color: 0xc9c3c2, metalness: 0.8, roughness: 0.22 }),
    green: new THREE.MeshStandardMaterial({ color: 0x9fb936, roughness: 0.3 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x102b20, metalness: 0.05, roughness: 0.12 }),
    white: new THREE.MeshStandardMaterial({ color: 0xf6f2e9, roughness: 0.72 }),
  }

  function mesh(parent, geometry, material, position, scale = [1, 1, 1], rotation = [0, 0, 0]) {
    const object = new THREE.Mesh(geometry, material)
    object.position.set(...position)
    object.scale.set(...scale)
    object.rotation.set(...rotation)
    parent.add(object)
    return object
  }

  const sphere = new THREE.SphereGeometry(1, 32, 24)
  const box = new THREE.BoxGeometry(1, 1, 1)
  const cylinder = new THREE.CylinderGeometry(1, 1, 1, 24)
  const torus = new THREE.TorusGeometry(1, 0.12, 12, 32)

  mesh(dog, sphere, materials.fur, [0, -0.18, -0.1], [0.9, 1.02, 0.72])
  mesh(dog, sphere, materials.cream, [0, -0.35, 0.56], [0.58, 0.55, 0.31])
  mesh(dog, box, materials.leather, [0, -0.48, -0.08], [0.98, 0.77, 0.62])
  mesh(dog, box, materials.brown, [0, -0.1, 0.55], [0.98, 0.08, 0.13])

  const shorts = new THREE.Group()
  shorts.position.y = -0.91
  dog.add(shorts)
  mesh(shorts, box, materials.white, [0, 0, 0], [0.78, 0.34, 0.56])
  for (const x of [-0.52, -0.18, 0.18, 0.52]) {
    mesh(shorts, box, materials.black, [x * 0.62, 0.01, 0.286], [0.11, 0.34, 0.025], [0, 0, -0.08])
  }
  mesh(shorts, box, materials.black, [0, 0.01, -0.286], [0.11, 0.34, 0.025], [0, 0, 0.08])

  const legs = []
  for (const side of [-1, 1]) {
    const leg = new THREE.Group()
    leg.position.set(side * 0.37, -1.04, 0.05)
    dog.add(leg)
    legs.push({ leg, angle: 0 })
    mesh(leg, sphere, materials.fur, [0, -0.26, 0], [0.24, 0.35, 0.25])
    mesh(leg, sphere, materials.cream, [0, -0.54, 0.04], [0.28, 0.18, 0.3])
  }

  const head = new THREE.Group()
  head.position.set(0, 0.67, 0.31)
  dog.add(head)
  mesh(head, sphere, materials.fur, [0, 0, 0], [0.83, 0.76, 0.74])
  mesh(head, sphere, materials.cream, [0, -0.18, 0.62], [0.58, 0.4, 0.34])
  mesh(head, sphere, materials.brown, [0, -0.23, 0.9], [0.16, 0.11, 0.1])
  mesh(head, sphere, materials.black, [0, -0.23, 0.98], [0.12, 0.08, 0.07])

  const ears = []
  for (const side of [-1, 1]) {
    const ear = new THREE.Group()
    ear.position.set(side * 0.57, 0.16, 0.04)
    ear.rotation.z = side * -0.26
    head.add(ear)
    ears.push({ ear, side })
    mesh(ear, sphere, materials.fur, [0, 0.2, 0], [0.27, 0.48, 0.24])
    mesh(ear, sphere, materials.brown, [0, 0.2, 0.19], [0.14, 0.31, 0.08])
  }

  const eyes = []
  for (const side of [-1, 1]) {
    const eye = mesh(head, sphere, materials.black, [side * 0.32, 0.12, 0.68], [0.12, 0.15, 0.07])
    eyes.push(eye)
  }

  const cap = new THREE.Group()
  cap.position.set(0, 0.42, 0.18)
  head.add(cap)
  mesh(cap, sphere, materials.red, [0, 0, 0], [0.86, 0.4, 0.78])
  mesh(cap, box, materials.redDark, [0, -0.08, 0.56], [0.54, 0.07, 0.28], [-0.12, 0, 0])
  mesh(cap, sphere, materials.red, [0, 0.1, -0.58], [0.22, 0.08, 0.22])

  const glasses = new THREE.Group()
  glasses.position.set(0, 0.1, 0.73)
  head.add(glasses)
  for (const side of [-1, 1]) {
    const lens = new THREE.Group()
    lens.position.x = side * 0.3
    glasses.add(lens)
    mesh(lens, torus, materials.green, [0, 0, 0], [0.27, 0.22, 0.08], [Math.PI / 2, 0, 0])
    mesh(lens, sphere, materials.glass, [0, 0, 0.01], [0.23, 0.18, 0.04])
  }
  mesh(glasses, box, materials.green, [0, 0, 0.01], [0.18, 0.075, 0.06])

  const headphones = new THREE.Group()
  headphones.position.set(0, 0.19, 0.03)
  head.add(headphones)
  mesh(headphones, torus, materials.black, [0, 0, 0], [0.94, 0.98, 0.18], [Math.PI / 2, 0, 0])
  for (const side of [-1, 1]) {
    const cup = new THREE.Group()
    cup.position.set(side * 0.76, 0, 0)
    headphones.add(cup)
    mesh(cup, cylinder, materials.black, [0, 0, 0], [0.25, 0.3, 0.16], [0, 0, Math.PI / 2])
    mesh(cup, cylinder, materials.metal, [side * 0.02, 0, 0.01], [0.14, 0.18, 0.17], [0, 0, Math.PI / 2])
  }

  function animate(time, x, y, excitement) {
    head.rotation.y = x * 0.25
    head.rotation.x = -y * 0.12
    cap.rotation.z = Math.sin(time * 1.5) * 0.018
    glasses.rotation.y = x * 0.08
    ears.forEach(({ ear, side }) => {
      ear.rotation.z = side * (-0.26 + excitement * Math.sin(time * 8) * 0.12)
    })
    legs.forEach(({ leg }, index) => {
      leg.rotation.z = Math.sin(time * 2.4 + index) * (0.035 + excitement * 0.08)
    })
    eyes.forEach((eye) => {
      eye.scale.y = 1 - excitement * 0.06
    })
  }

  return { dog, animate }
}
