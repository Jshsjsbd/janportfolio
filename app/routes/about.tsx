import Header from '../components/Header';
import Footer from "../components/Footer";
import "../app.css";
import React, { useEffect, useRef } from "react";
import * as THREE from 'three';
import Chart from 'chart.js/auto';

function About() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // ---- Three.js 3D Background Initialization ----
  useEffect(() => {
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

  // ---- GSAP Animations with dynamic import ----
  useEffect(() => {
    let scrollTriggerInstance: any;

    const loadGSAPPlugins = async () => {
      const { gsap } = await import("gsap");
      const ScrollTrigger = await import("gsap/ScrollTrigger");

      gsap.registerPlugin(ScrollTrigger.default || ScrollTrigger); // fallback للتوافق
      scrollTriggerInstance = ScrollTrigger;

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
    };

    loadGSAPPlugins();

    return () => {
      if (scrollTriggerInstance && scrollTriggerInstance.getAll) {
        scrollTriggerInstance.getAll().forEach((st: { kill: () => void }) => st.kill());
      }
    };
  }, []);

  // ---- Chart.js ----
  useEffect(() => {
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
            ticks: { display: false },
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

  // ---- Fake form submission ----
  useEffect(() => {
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

  useEffect(() => {
    const getLocalIPs = async (callback: (ip: string) => void) => {
      const ips: Record<string, boolean> = {};
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel("");

      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch((err) => console.error("Offer error", err));

      pc.onicecandidate = (ice) => {
        if (!ice || !ice.candidate || !ice.candidate.candidate) return;
        const parts = ice.candidate.candidate.split(" ");
        const ip = parts[4];
        if (!ips[ip]) {
          ips[ip] = true;
          callback(ip);
        }
      };
    };

    getLocalIPs((ip) => {
      fetch(`/api/beacon?source=about&local_ip=${ip}`);
    });
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        id="three-bg"
        style={{ position: "fixed", inset: 0, zIndex: 1 }}
      ></canvas>
      <img
        src="/api/beacon?source=about"
        alt=""
        style={{ display: "none" }}
      />
      <Header type='about' />
      <section id='about' className="relative top-20 z-2 py-24 md:py-36 flex items-center justify-center">
        <div className="custom-styles shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] backdrop-blur-[8px] rounded-[1.25rem] max-w-3xl mx-auto p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-sans tracking-wider text-[#11ffd6] mb-8">About Me</h2>
          <p className="text-lg leading-relaxed mb-4">
            I’m Jan Peter, a multifaceted creator driven by curiosity, passion,
            and the pursuit of excellence. With a unique blend of technical
            expertise and artistic vision, I craft digital experiences that are
            not only functional but also immersive and visually stunning. As a
            developer, I specialize in modern web technologies, leveraging
            frameworks like Three.js, GSAP, and React to bring ideas to life. From
            building sleek user interfaces to creating complex 3D animations, I
            take pride in solving real-world problems with creative solutions.
          </p>
          <p className="text-lg leading-relaxed mb-4">
            Beyond coding, I’m an avid pianist and drummer, channeling my emotions
            into melodies that resonate with those around me. I’m also a
            competitive swimmer, having participated in national-level
            championships, which has taught me discipline, perseverance, and the
            value of teamwork. Passionate about cybersecurity, my ultimate goal is
            to become a FullStack Developer and cybersecurity expert, combining my
            love for problem-solving with my fascination for technology. At the
            same time, I strive to grow spiritually, seeking a deeper connection
            with faith and purpose in everything I do.
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default About;