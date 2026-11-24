import * as THREE from 'three'

const dogLayer = 1

export function createDogEffect(dog, lights) {
  dog.traverse((object) => object.layers.set(dogLayer))
  lights.forEach((light) => light.layers.enable(dogLayer))

  const target = new THREE.WebGLRenderTarget(1, 1, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    depthTexture: new THREE.DepthTexture(1, 1),
  })
  const uniforms = {
    dogColor: { value: target.texture },
    dogDepth: { value: target.depthTexture },
    resolution: { value: new THREE.Vector2() },
    center: { value: new THREE.Vector2() },
    strength: { value: 0 },
    pixelRatio: { value: 1 },
  }
  const geometry = new THREE.PlaneGeometry(2, 2)
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      void main() {
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D dogColor;
      uniform sampler2D dogDepth;
      uniform vec2 resolution;
      uniform vec2 center;
      uniform float strength;
      uniform float pixelRatio;

      void main() {
        vec2 pixel = gl_FragCoord.xy / pixelRatio;
        float tileSize = 12.0;
        vec2 cell = floor(pixel / tileSize);
        vec2 tile = (cell + 0.5) * tileSize;
        float distanceToPointer = length(tile - center);
        float local = (1.0 - smoothstep(36.0, 83.0, distanceToPointer)) * strength;
        float seed = fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.54);
        vec2 offset = vec2(step(0.5, seed) * 2.0 - 1.0, step(0.75, seed) * 2.0 - 1.0);
        tile += offset * tileSize * step(0.65, seed) * 0.75;
        vec2 uv = mix(pixel, tile, local) * pixelRatio / resolution;
        vec4 color = texture2D(dogColor, uv);
        if (color.a < 0.5) discard;
        gl_FragDepth = texture2D(dogDepth, uv).r;
        gl_FragColor = vec4(color.rgb * (1.0 + (seed - 0.4) * local * 0.17), 1.0);
        #include <colorspace_fragment>
      }
    `,
  })
  const overlay = new THREE.Mesh(geometry, material)
  overlay.frustumCulled = false
  const overlayScene = new THREE.Scene()
  overlayScene.add(overlay)
  const overlayCamera = new THREE.Camera()

  return {
    enableRaycast(raycaster) {
      raycaster.layers.enable(dogLayer)
    },
    render(renderer, scene, camera, pointer, active, seconds) {
      const strength = uniforms.strength
      strength.value = THREE.MathUtils.damp(strength.value, active ? 1 : 0, active ? 24 : 13, seconds)
      if (strength.value < 0.01) {
        camera.layers.enable(dogLayer)
        renderer.render(scene, camera)
        return
      }

      const resolution = renderer.getDrawingBufferSize(uniforms.resolution.value)
      const pixelRatio = renderer.getPixelRatio()
      uniforms.pixelRatio.value = pixelRatio
      if (active) {
        uniforms.center.value.set(
          (pointer.x + 1) * resolution.x / (2 * pixelRatio),
          (pointer.y + 1) * resolution.y / (2 * pixelRatio),
        )
      }
      target.setSize(resolution.x, resolution.y)

      // Capture just the dog and composite its tiles against the cards' original depth.
      camera.layers.set(dogLayer)
      renderer.setRenderTarget(target)
      renderer.render(scene, camera)
      renderer.setRenderTarget(null)
      camera.layers.disable(dogLayer)
      camera.layers.enable(0)
      renderer.render(scene, camera)
      renderer.autoClear = false
      renderer.render(overlayScene, overlayCamera)
      renderer.autoClear = true
    },
    dispose() {
      target.dispose()
      geometry.dispose()
      material.dispose()
    },
  }
}
