import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { assetPath } from '../lib/assetPath'
import { createCorgi } from './orbitCorgi'
import { createDogEffect } from './orbitDogEffect'

const { clamp, damp } = THREE.MathUtils
const tau = Math.PI * 2
// Six cards spaced 60° apart, alternating above and below the dog so neighbours never share a band.
const slots = [
  [0.17, -1.36, 2.45], [1.22, 1.18, 2.5], [2.26, -1.24, 2.45],
  [3.31, 1.24, 2.5], [4.36, -1.3, 2.45], [5.41, 1.16, 2.5],
]
const placeholders = [
  ['#4e60a3', '#a6cbd9'], ['#795e48', '#f3b077'], ['#294741', '#afc884'], ['#76465b', '#e7a7b6'],
]

function cardSurface() {
  const geometry = new THREE.PlaneGeometry(1, 0.7, 24, 4)
  const positions = geometry.attributes.position
  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i)
    positions.setZ(i, -0.43 * x * x)
  }
  geometry.computeVertexNormals()
  return geometry
}

function cardArtwork(entry, index) {
  const artwork = document.createElement('canvas')
  artwork.width = 640
  artwork.height = 448
  const context = artwork.getContext('2d')
  const texture = new THREE.CanvasTexture(artwork)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  let image

  function draw() {
    const [dark, light] = placeholders[index % placeholders.length]
    const gradient = context.createLinearGradient(30, 0, 600, 360)
    gradient.addColorStop(0, dark)
    gradient.addColorStop(1, light)
    context.fillStyle = gradient
    context.fillRect(0, 0, 640, 448)
    if (image?.naturalWidth) {
      const scale = Math.max(640 / image.width, 388 / image.height)
      const width = image.width * scale
      const height = image.height * scale
      context.drawImage(image, (640 - width) / 2, (388 - height) / 2, width, height)
    } else {
      context.strokeStyle = '#ffffff8c'
      context.lineWidth = 1.5
      for (let i = 0; i < 7; i += 1) {
        context.beginPath()
        context.ellipse(340, 194, 70 + i * 26, 31 + i * 15, (index - 3) * 0.38, 0, tau)
        context.stroke()
      }
    }
    context.fillStyle = '#fbfaf7'
    context.fillRect(0, 388, 640, 60)
    context.fillStyle = '#20201c'
    context.font = '600 24px system-ui, sans-serif'
    context.fillText(entry.title, 22, 426, 590)
    texture.needsUpdate = true
  }

  draw()
  if (entry.image) {
    image = new Image()
    image.onload = draw
    image.src = entry.image
  }
  return { texture, cancel: () => { if (image) image.onload = null } }
}

export function mountOrbit({ host, entries, onHover, onOpen, onContextLost }) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  renderer.setClearColor(0xffffff, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  host.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 45)
  const ambient = new THREE.HemisphereLight(0xfffcf5, 0xb2aca6, 2.05)
  const key = new THREE.DirectionalLight(0xffebd8, 2.35)
  key.position.set(-4, 6, 7)
  const rim = new THREE.DirectionalLight(0xf8faff, 1.45)
  rim.position.set(4, 3, -6)
  scene.add(ambient, key, rim)

  let { dog, animate } = createCorgi()
  const platform = new THREE.Group()
  platform.add(dog)
  scene.add(platform)
  let dogEffect = createDogEffect(dog, [ambient, key, rim])

  const deck = new THREE.Group()
  scene.add(deck)
  const geometry = cardSurface()
  // The back face must lie on the same curved surface. Rotating the front by π would bow it
  // the opposite way, so at side angles both sheets showed and the card looked doubled.
  // Instead reuse the positions, reverse the winding, and mirror U so artwork reads correctly.
  const backGeometry = geometry.clone()
  const backIndex = backGeometry.index.array
  for (let i = 0; i < backIndex.length; i += 3) {
    const swap = backIndex[i + 1]
    backIndex[i + 1] = backIndex[i + 2]
    backIndex[i + 2] = swap
  }
  const backUv = backGeometry.attributes.uv
  for (let i = 0; i < backUv.count; i += 1) backUv.setX(i, 1 - backUv.getX(i))
  backGeometry.computeVertexNormals()
  const cards = entries.map((entry, index) => {
    const artwork = cardArtwork(entry, index)
    const material = new THREE.MeshBasicMaterial({ map: artwork.texture, toneMapped: false })
    const mesh = new THREE.Group()
    for (const faceGeometry of [geometry, backGeometry]) {
      const face = new THREE.Mesh(faceGeometry, material)
      face.userData.card = index
      mesh.add(face)
    }
    deck.add(mesh)
    return { mesh, artwork, scale: 1 }
  })

  let width = 1
  let height = 1
  let rotation = 0
  let goal = 0
  let pitch = 0
  let goalPitch = 0
  let inertialVelocity = 0
  let idleAngle = 0
  let idleSpeed = 0
  let resumeAt = 0
  let down = null
  let frame = 0
  let previous = 0
  let time = 0
  let hovered = null
  let progress = 0
  let visible = false
  let previewOpen = false
  let pointerInside = false
  let hoverPointer = false
  const pointer = new THREE.Vector2()
  const look = new THREE.Vector2()
  const neutral = new THREE.Vector2()
  const ray = new THREE.Raycaster()
  dogEffect.enableRaycast(ray)

  let targets = [...cards.map(({ mesh }) => mesh), dog]

  const modelLoader = new GLTFLoader()
  modelLoader.load(assetPath('/models/dog_single_textured.glb'), (gltf) => {
    const inner = gltf.scene
    // tick() drives dog.scale/position every frame, so normalize inside a wrapper group.
    // Match the built-in corgi: about 2.8 units tall, spanning y ≈ -1.25 to 1.55.
    const box = new THREE.Box3().setFromObject(inner)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const scale = 2.8 / Math.max(size.y, 1e-6)
    inner.scale.setScalar(scale)
    inner.position.set(-center.x * scale, -center.y * scale + 0.15, -center.z * scale)
    const model = new THREE.Group()
    model.add(inner)
    platform.remove(dog)
    dogEffect.dispose()
    dog = model
    animate = () => {}
    platform.add(dog)
    targets = [...cards.map(({ mesh: cardMesh }) => cardMesh), dog]
    dogEffect = createDogEffect(dog, [ambient, key, rim])
    dogEffect.enableRaycast(ray)
    // Upload textures and compile shaders now, while the section is still offscreen,
    // so the first visible frame doesn't stall mid-transition.
    inner.traverse((node) => {
      if (!node.isMesh) return
      for (const material of [node.material].flat()) {
        for (const value of Object.values(material)) {
          if (value?.isTexture) renderer.initTexture(value)
        }
      }
    })
    renderer.compile(scene, camera)
  }, undefined, (error) => {
    console.warn('GLB dog model is unavailable, using the built-in fallback', error)
  })

  function setHover(next) {
    if (hovered === next) return
    hovered = next
    onHover(next)
  }

  function pick() {
    ray.setFromCamera(pointer, camera)
    return ray.intersectObjects(targets, true)[0]
  }

  function resize() {
    width = Math.max(1, host.clientWidth)
    height = Math.max(1, host.clientHeight)
    camera.aspect = width / height
    camera.fov = width < 680 ? 47 : 42
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
  }

  function tick(now) {
    frame = 0
    if (!visible || document.hidden || previewOpen) return
    const dt = previous ? Math.min((now - previous) / 1000, 0.045) : 0.016
    previous = now
    time += dt
    if (!down && Math.abs(inertialVelocity) > 0.005) {
      goal += inertialVelocity * dt
      inertialVelocity *= Math.exp(-dt * 5.5)
    }
    const autopilot = !down && time >= resumeAt && progress < 0.83
    const cruisingSpeed = hovered === null ? 0.29 : hovered === 'dog' ? 0.13 : 0
    idleSpeed = damp(idleSpeed, autopilot ? cruisingSpeed : 0, 7, dt)
    if (!down) idleAngle = (idleAngle + idleSpeed * dt) % tau
    rotation = damp(rotation, goal, down ? 20 : 10, dt)
    pitch = damp(pitch, goalPitch, 10, dt)
    look.lerp(pointerInside && !down ? pointer : neutral, 1 - Math.exp(-dt * 7))
    const narrow = width < 680
    const radius = narrow ? 2.85 : 4.25
    const exit = THREE.MathUtils.smoothstep(progress, 0.58, 1)
    const distance = narrow ? Math.max(8.8, 4.8 / camera.aspect) : Math.max(8.4, 7 / camera.aspect)
    camera.position.set(look.x * 0.38, look.y * 0.28 + 0.1, distance)
    camera.lookAt(0, 0.2, 0)
    camera.updateMatrixWorld()
    deck.rotation.x = pitch
    deck.rotation.y = rotation + idleAngle
    platform.rotation.y = rotation + 0.37
    platform.rotation.x = pitch * 0.75 - 0.06
    dog.position.y = Math.sin(time * 1.65) * 0.11 + exit * 0.65
    dog.rotation.z = -0.16 + Math.sin(time * 1.3) * 0.06
    const dogSize = narrow ? 1 : 1.22
    dog.scale.setScalar(dogSize)
    animate(time, look.x, look.y, hovered === 'dog' ? 0.22 : 0)

    cards.forEach(({ mesh }, index) => {
      const [angle, y, size] = slots[index]
      const card = cards[index]
      const spread = radius + exit * 3.8
      // Give cards a wider vertical arc as they cross the foreground by the dog.
      const crossing = THREE.MathUtils.smoothstep(Math.cos(angle + deck.rotation.y), 0.73, 1)
      const clearance = Math.sign(y) * crossing * (1.2 - Math.abs(y) * 0.25)
      mesh.position.set(
        Math.sin(angle) * spread,
        y + clearance + Math.sin(time * 1.1 + index) * 0.13 + exit * 2.2,
        Math.cos(angle) * spread,
      )
      mesh.rotation.set(Math.cos(angle + time) * 0.05, angle, Math.sin(index * 1.7) * 0.11)
      card.scale = damp(card.scale, hovered === index ? 1.12 : 1, 13, dt)
      mesh.scale.setScalar(size * card.scale * (narrow ? 0.78 : 1))
    })
    scene.updateMatrixWorld()
    const hit = pointerInside && hoverPointer && !down && progress < 0.84 ? pick() : null
    setHover(hit ? hit.object.userData.card ?? 'dog' : null)
    dogEffect.render(renderer, scene, camera, pointer, hovered === 'dog', dt)
    frame = requestAnimationFrame(tick)
  }

  function wake() {
    if (visible && !document.hidden && !previewOpen && !frame) {
      previous = 0
      frame = requestAnimationFrame(tick)
    }
  }

  function updatePointer(event) {
    hoverPointer = event.pointerType !== 'touch'
    const bounds = host.getBoundingClientRect()
    pointer.set((event.clientX - bounds.left) / width * 2 - 1, 1 - (event.clientY - bounds.top) / height * 2)
    pointerInside = Math.abs(pointer.x) <= 1 && Math.abs(pointer.y) <= 1
    host.style.setProperty('--orbit-pointer-x', `${clamp(event.clientX - bounds.left, 12, width - 12)}px`)
    host.style.setProperty('--orbit-pointer-y', `${clamp(event.clientY - bounds.top, 12, height - 12)}px`)
    host.dataset.hintSide = pointer.x > 0.65 ? 'left' : 'right'
  }

  function onPointerDown(event) {
    if (!event.isPrimary || event.button !== 0) return
    updatePointer(event)
    inertialVelocity = 0
    idleSpeed = 0
    down = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      startPitch: goalPitch,
      selection: pick(),
      moved: false,
      velocity: 0,
    }
    host.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event) {
    if (!event.isPrimary) return
    updatePointer(event)
    if (!down || down.id !== event.pointerId) return
    const distance = Math.hypot(event.clientX - down.x, event.clientY - down.y)
    if (distance > 5) down.moved = true
    if (!down.moved) return
    host.dataset.dragging = 'true'
    const delta = (event.clientX - down.lastX) * 0.007
    goal += delta
    if (event.pointerType === 'mouse') {
      goalPitch = clamp(down.startPitch + (event.clientY - down.y) * 0.005, -0.48, 0.48)
    }
    down.velocity = clamp(delta * 1000 / Math.max(10, event.timeStamp - down.lastTime), -5, 5)
    down.lastX = event.clientX
    down.lastTime = event.timeStamp
  }

  function release(event) {
    if (!down || down.id !== event.pointerId) return
    const drag = down
    down = null
    resumeAt = time + (drag.moved ? 1.2 : 0.38)
    delete host.dataset.dragging
    if (event.type !== 'pointerup') return
    updatePointer(event)
    if (drag.moved) {
      inertialVelocity = event.timeStamp - drag.lastTime < 100 ? drag.velocity : 0
      return
    }
    const hit = drag.selection
    if (!hit) return
    const index = hit.object.userData.card
    if (index !== undefined) onOpen(index)
  }

  function leave() {
    pointerInside = false
    setHover(null)
  }

  function wheel(event) {
    if (event.ctrlKey || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return
    event.preventDefault()
    resumeAt = time + 1.2
    goal += clamp(event.deltaX * 0.003, -0.32, 0.32)
  }

  function intersectionChanged(items) {
    visible = items[0].isIntersecting
    if (!visible) leave()
    wake()
  }

  const observer = new IntersectionObserver(intersectionChanged, { threshold: 0.01 })
  const resizeObserver = new ResizeObserver(resize)
  observer.observe(host)
  resizeObserver.observe(host)
  resize()
  host.addEventListener('pointerdown', onPointerDown)
  host.addEventListener('pointermove', onPointerMove)
  host.addEventListener('pointerup', release)
  host.addEventListener('pointercancel', release)
  host.addEventListener('lostpointercapture', release)
  host.addEventListener('pointerleave', leave)
  host.addEventListener('wheel', wheel, { passive: false })
  renderer.domElement.addEventListener('webglcontextlost', onContextLost)
  document.addEventListener('visibilitychange', wake)

  return {
    rotate(direction) {
      inertialVelocity = 0
      resumeAt = time + 1.2
      goal += direction * tau / entries.length
      wake()
    },
    setProgress(value) { progress = value },
    setPreviewOpen(open) {
      previewOpen = open
      if (open) {
        cancelAnimationFrame(frame)
        frame = 0
        leave()
      } else {
        resumeAt = time + 0.25
        wake()
      }
    },
    dispose() {
      visible = false
      cancelAnimationFrame(frame)
      observer.disconnect()
      resizeObserver.disconnect()
      host.removeEventListener('pointerdown', onPointerDown)
      host.removeEventListener('pointermove', onPointerMove)
      host.removeEventListener('pointerup', release)
      host.removeEventListener('pointercancel', release)
      host.removeEventListener('lostpointercapture', release)
      host.removeEventListener('pointerleave', leave)
      host.removeEventListener('wheel', wheel)
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost)
      document.removeEventListener('visibilitychange', wake)
      const disposable = new Set()
      scene.traverse((object) => {
        if (object.isMesh) {
          disposable.add(object.geometry)
          disposable.add(object.material)
        }
      })
      cards.forEach(({ artwork }) => {
        artwork.cancel()
        artwork.texture.dispose()
      })
      disposable.forEach((resource) => resource.dispose())
      dogEffect.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    },
  }
}
