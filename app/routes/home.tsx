import Header from '../components/Header';
import Footer from "../components/Footer";
import "../app.css";
import React, { useEffect, useRef } from "react";
import * as THREE from 'three';
import { gsap } from 'gsap';
import Chart from 'chart.js/auto';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Link } from 'react-router';


gsap.registerPlugin(ScrollTrigger);

function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // ---- Three.js 3D Background Initialization ----
    if (!canvasRef.current) return;
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setClearColor(0x13141a, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.05,
      100
    );
    camera.position.set(0, 3, 13);

    // Create particles
    const particleCount = 600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 28; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 24; // z
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      size: 0.22,
      color: "#11ffd6",
      transparent: true,
      opacity: 0.47,
    });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Torus Knot
    const knotGeo = new THREE.TorusKnotGeometry(2.7, 0.64, 150, 10);
    const knotMat = new THREE.MeshPhysicalMaterial({
      color: "#6366f1",
      roughness: 0.15,
      metalness: 0.8,
      transmission: 0.4,
      thickness: 0.75,
      ior: 1.28,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      reflectivity: 0.7,
      emissive: "#212bf5",
      emissiveIntensity: 0.45,
    });
    const knot = new THREE.Mesh(knotGeo, knotMat);
    knot.position.set(-2, 0, 0);
    scene.add(knot);

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      knot.rotation.y += 0.003;
      knot.rotation.x += 0.002;
      particles.rotation.y += 0.0008;
      particles.rotation.x += 0.00022;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Handle resize
    const onResize = () => {
      if (!canvasRef.current) return;
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      knotGeo.dispose();
      knotMat.dispose();
      scene.clear();
    };
  }, []);

  useEffect(() => {
    // ---- GSAP Animations ----
    gsap.from(".section-title", {
      scrollTrigger: {
        trigger: ".section-title",
        start: "top 90%",
        toggleActions: "play none none reverse",
      },
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.2,
    });

    gsap.utils.toArray("section").forEach((sec, idx) => {
    const element = sec as HTMLElement;
    gsap.from(element.querySelector(".glass"), {
      scrollTrigger: {
        trigger: element,
        start: "top 70%",
        toggleActions: "play none none reverse",
      },
      opacity: 0,
      y: 80,
      duration: 1,
      delay: 0.01 * idx,
      ease: "power2.out",
    });
  });


    gsap.from(".nav-shadow", {
      y: -50,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
    });
    gsap.from(".fa-chevron-down", {
      y: -22,
      repeat: -1,
      yoyo: true,
      duration: 1.3,
      ease: "sine.inOut",
    });

    gsap.to("#three-bg", {
      scrollTrigger: {
        trigger: "#about",
        start: "top 50%",
        end: "bottom top",
        scrub: true,
      },
      filter: "blur(8px)",
      opacity: 0.17,
      scale: 0.985,
      ease: "sine.inOut",
    });

    // Cleanup on unmount (kill all ScrollTriggers)
    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);


  useEffect(() => {
    // ---- Chart.js ----
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: "radar",
      data: {
        labels: [
          "UI Design",
          "Frontend",
          "3D Graphics",
          "Animation",
          "Backend",
          "Collaboration",
        ],
        datasets: [
          {
            label: "Proficiency",
            data: [9, 9, 8.5, 8, 7, 8.3],
            backgroundColor: "rgba(17,255,214,0.15)",
            borderColor: "#11ffd6",
            pointBackgroundColor: "#6366f1",
            borderWidth: 2,
            pointRadius: 6,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          r: {
            angleLines: { color: "#28324a" },
            grid: { color: "#646dae", circular: true },
            pointLabels: {
              color: "#bebec6",
              font: { size: 16, weight: "bold" },
            },
            ticks: { display: false},
            min: 0,
            max: 10,
          },
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    });

    return () => {
      chart.destroy();
    };
  }, []);

  useEffect(() => {
    // ---- Fake form submission ----
    if (!formRef.current) return;

    const form = formRef.current;
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;

    const onSubmit = (e: Event) => {
      e.preventDefault();
      btn.textContent = "Sending...";
      btn.setAttribute("disabled", "true");

      setTimeout(() => {
        btn.textContent = "Send";
        btn.removeAttribute("disabled");
        alert("Message sent (fake)!");
        form.reset();
      }, 3000);
    };

    form.addEventListener("submit", onSubmit);

    return () => {
      form.removeEventListener("submit", onSubmit);
    };
  }, []);
  return(
    <>
      <canvas
          ref={canvasRef}
          id="three-bg"
          style={{ position: "fixed", inset: 0, zIndex: 1}}
      ></canvas>
      <Header type='home'/>
      <section className="relative pt-32 pb-44 flex flex-col items-center justify-center min-h-screen text-center z-10">
        <h2 className="text-2xl md:text-3xl font-medium text-teal-200 mb-7">Musician & Swimmer & Front-End Developer</h2>
        <p className="text-lg md:text-xl max-w-xl mx-auto opacity-90 mb-10">
          I’m a curious soul who loves blending creativity and logic, whether it’s
          through coding, music, or solving challenges—always seeking to learn,
          grow, and explore the extraordinary.
        </p>
        <div className="absolute bottom-55 opacity-70 animate-bounce">
          <i className="fas fa-chevron-down text-teal-300 text-3xl "></i>
        </div>
        <Link to="/projects" className="absolute bottom-35 bg-gradient-to-r from-purple-300 to-indigo-400 hover:from-indigo-400 hover:to-teal-300 px-8 py-4 rounded-full text-lg font-semibold text-gray-900 shadow-lg transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-300">View My Projects</Link>
      </section>
      <Footer />
    </>
  )
}

export default Home;