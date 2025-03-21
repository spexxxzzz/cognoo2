import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export function MiniNetworkButton({ disabled = false, onClick }: { disabled?: boolean; onClick?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    scene.background = null
    scene.fog = new THREE.FogExp2(0x000000, 0.002)

    const ambientLight = new THREE.AmbientLight(0x404040, 0.5)
    scene.add(ambientLight)

    const pointLight1 = new THREE.PointLight(0x4ade80, 1, 100)
    pointLight1.position.set(5, 5, 5)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0x60a5fa, 1, 100)
    pointLight2.position.set(-5, -5, -5)
    scene.add(pointLight2)

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    camera.position.z = 25

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    })
    renderer.setSize(24, 24)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enabled = false

    const nodes: THREE.Mesh[] = []
    const links: { line: THREE.Line; from: THREE.Mesh; to: THREE.Mesh }[] = []
    const dataParticles: {
      particle: THREE.Mesh
      from: THREE.Vector3
      to: THREE.Vector3
      progress: number
      speed: number
    }[] = []
    const numNodes = 20

    const radius = 20
    const goldenRatio = (1 + Math.sqrt(5)) / 2

    for (let i = 0; i < numNodes; i++) {
      const theta = (2 * Math.PI * i) / goldenRatio
      const phi = Math.acos(1 - (2 * (i + 0.5)) / numNodes)

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      const geometry = new THREE.OctahedronGeometry(0.25, 0)
      const material = new THREE.MeshPhongMaterial({
        color: Math.random() < 0.33 ? 0x4ade80 : Math.random() < 0.5 ? 0x60a5fa : 0xc8ffc8,
        emissive: Math.random() < 0.33 ? 0x4ade80 : Math.random() < 0.5 ? 0x60a5fa : 0xc8ffc8,
        emissiveIntensity: 0.7,
        shininess: 150,
        transparent: true,
        opacity: 0.9,
        wireframe: true,
        wireframeLinewidth: 1
      })
      const node = new THREE.Mesh(geometry, material)
      node.position.set(x, y, z)
      node.scale.set(1, 1, 1)
      scene.add(node)
      nodes.push(node)
    }

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.3
    })

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() < 0.075) {
          const points = [nodes[i].position, nodes[j].position]
          const geometry = new THREE.BufferGeometry().setFromPoints(points)
          const line = new THREE.Line(geometry, lineMaterial)
          scene.add(line)
          links.push({ line, from: nodes[i], to: nodes[j] })
        }
      }
    }

    const particleMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffa0,
      emissive: 0xffffa0,
      emissiveIntensity: 0.8,
      shininess: 150,
      transparent: true,
      opacity: 0.9
    })
    const particleGeometry = new THREE.SphereGeometry(0.075, 16, 16)

    links.forEach(link => {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial)
      particle.position.copy(link.from.position)
      scene.add(particle)
      dataParticles.push({
        particle,
        from: link.from.position,
        to: link.to.position,
        progress: Math.random(),
        speed: (0.002 + Math.random() * 0.003) / 3
      })
    })

    function animate() {
      requestAnimationFrame(animate)

      scene.rotation.y += 0.001

      dataParticles.forEach(dp => {
        dp.progress += dp.speed
        if (dp.progress > 1) dp.progress = 0
        dp.particle.position.lerpVectors(dp.from, dp.to, dp.progress)
        const smoothProgress = (1 - Math.cos(dp.progress * Math.PI * 2)) / 2
        dp.particle.material.opacity = 0.4 + smoothProgress * 0.6
      })

      const time = Date.now() * 0.001
      pointLight1.position.x = Math.sin(time * 0.7) * 7.5
      pointLight1.position.z = Math.cos(time * 0.7) * 7.5
      pointLight2.position.x = Math.sin(time * 0.7 + Math.PI) * 7.5
      pointLight2.position.z = Math.cos(time * 0.7 + Math.PI) * 7.5

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      renderer.dispose()
      containerRef.current?.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <button
      type="submit"
      disabled={disabled}
      onClick={onClick}
      className="h-6 w-6 rounded-full hover:bg-muted transition-colors"
    >
      <div ref={containerRef} className="w-6 h-6" />
    </button>
  )
}