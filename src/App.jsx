import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

// ── Tailwind config injected via CDN script tag ──────────────────────────────
// Colors match the original Stitch HTML exactly

// ─── NAV ─────────────────────────────────────────────────────────────────────
const NAV_LINKS = ["Home", "About", "Projects", "Contact"];

const PROFILE_PHOTO = "/profile-photo.jpg";

const SOCIAL_LINKS = {
  email: "mailto:adityaarajj2323@gmail.com",
  linkedin: "https://www.linkedin.com/in/aditya-raj-53ba77282",
  github: "https://github.com/Adityarajj23",
  location: "https://maps.google.com/?q=Bangalore,India",
  twitter: "https://x.com/AdityaRaj_2606",
  instagram: "https://www.instagram.com/adityaa_raj23/",
};

function useViewport() {
  const [width, setWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    width,
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1100,
  };
}

function Nav({ active, setActive }) {
  const [scrolled, setScrolled] = useState(false);
  const { isMobile } = useViewport();

  useEffect(() => {
  setScrolled(false);
  const scrollEl = document.getElementById("app-scroll");
  if (!scrollEl) return;
  scrollEl.scrollTo(0, 0);
  if (active !== "Home") return;
  const h = () => setScrolled(scrollEl.scrollTop > 20);
  scrollEl.addEventListener("scroll", h);
  return () => scrollEl.removeEventListener("scroll", h);
}, [active]);

  return (
    <nav
      style={{
        position: "fixed",
        top: 12,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
        width: "min(92%, 900px)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: isMobile ? 12 : 24,
        padding: isMobile ? "12px 16px" : "14px 32px",
        borderRadius: 9999,
        border: "1px solid rgba(255,255,255,0.1)",
        background: scrolled
          ? "rgba(6,14,32,0.92)"
          : "rgba(15,25,48,0.72)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
        transition: "background 0.3s, top 0.3s",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <span style={{ fontWeight: 900, color: "#fff", fontSize: isMobile ? 14 : 18, letterSpacing: "-0.05em", textTransform: "uppercase" }}>
        ADITYA_RAJ
      </span>
      <div style={{ display: "flex", gap: isMobile ? 12 : 32, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
        {NAV_LINKS.map((l) => (
          <button
            key={l}
            onClick={() => setActive(l)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: isMobile ? 12 : 14,
              letterSpacing: "0.05em",
              color: active === l ? "#53ddfc" : "#94a3b8",
              borderBottom: active === l ? "2px solid #53ddfc" : "2px solid transparent",
              paddingBottom: 4,
              transition: "all 0.2s",
            }}
          >
            {l}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ─── PUZZLE CUBE (Three.js) ──────────────────────────────────────────────────
function PuzzleCube() {
  const mountRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    let scene, camera, renderer, cubeGroup;
    let animId;
    let t = 0;

    function init() {
      const el = mountRef.current;
      if (!el) return;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
      camera.position.set(4, 4, 6);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(el.clientWidth, el.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      el.appendChild(renderer.domElement);

      cubeGroup = new THREE.Group();
      scene.add(cubeGroup);

      const colors = [0xba9eff, 0x53ddfc, 0xa27cff, 0x8455ef, 0x48d4f3, 0x40ceed,
        0xba9eff, 0xffffff, 0x53ddfc];

      let i = 0;
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            const geo = new THREE.BoxGeometry(0.88, 0.88, 0.88);
            const mat = new THREE.MeshPhongMaterial({
              color: colors[i % colors.length],
              emissive: colors[i % colors.length],
              emissiveIntensity: 0.15,
              shininess: 120,
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, y, z);
            mesh.userData = { ox: x, oy: y, oz: z, phase: Math.random() * Math.PI * 2 };
            cubeGroup.add(mesh);
            i++;
          }
        }
      }

      const al = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(al);
      const dl = new THREE.DirectionalLight(0xba9eff, 1.2);
      dl.position.set(5, 8, 5);
      scene.add(dl);
      const dl2 = new THREE.DirectionalLight(0x53ddfc, 0.8);
      dl2.position.set(-5, -3, -5);
      scene.add(dl2);

      // mouse interaction
      let mx = 0, my = 0;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        my = ((e.clientY - r.top) / r.height - 0.5) * 2;
      });

      function animate() {
        animId = requestAnimationFrame(animate);
        t += 0.008;
        cubeGroup.rotation.y = t * 0.4 + mx * 0.5;
        cubeGroup.rotation.x = t * 0.2 + my * 0.3;

        cubeGroup.children.forEach((m) => {
          const { ox, oy, oz, phase } = m.userData;
          const explode = Math.sin(t * 0.5 + phase) * 0.15;
          m.position.set(ox * (1 + explode), oy * (1 + explode), oz * (1 + explode));
          m.rotation.x = t + phase;
          m.rotation.y = t * 0.7 + phase;
        });

        renderer.render(scene, camera);
      }
      animate();
    }
    init();
    return () => {
      cancelAnimationFrame(animId);
      if (renderer) renderer.dispose();
      if (mountRef.current && renderer) {
        try { mountRef.current.removeChild(renderer.domElement); } catch (_) { }
      }
    };
  }, []);

  return (
    <div ref={mountRef} style={{ width: 340, height: 340, borderRadius: "50%", overflow: "hidden", cursor: "grab" }} />
  );
}

// ─── 3D PHONE (Three.js) ────────────────────────────────────────────────────
function PhoneFrame({ photoSrc }) {
  const [loaded, setLoaded] = useState(false);
  const phoneRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const { isMobile } = useViewport();

  useEffect(() => {
    let frameId;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;

      const phone = phoneRef.current;
      if (!phone) return;

      const floatY = Math.sin(time) * (isMobile ? -5 : -10);
      const rotateY = pointerRef.current.x * (isMobile ? 12 : 18) + Math.sin(time * 0.7) * (isMobile ? 5 : 7);
      const rotateX = pointerRef.current.y * (isMobile ? -10 : -14) + Math.cos(time * 0.9) * (isMobile ? 3 : 5);

      phone.style.transform = `perspective(1200px) translateY(${floatY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    animate();

    return () => cancelAnimationFrame(frameId);
  }, []);

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    pointerRef.current = { x, y };
  };

  const handleMouseLeave = () => {
    pointerRef.current = { x: 0, y: 0 };
  };

  const handleTouchMove = (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / rect.width - 0.5;
    const y = (touch.clientY - rect.top) / rect.height - 0.5;
    pointerRef.current = { x, y };
  };

  const handleTouchEnd = () => {
    pointerRef.current = { x: 0, y: 0 };
  };

  return (
    <div
      ref={phoneRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        width: "100%",
        maxWidth: isMobile ? 290 : 340,
        margin: "0 auto",
        borderRadius: 40,
        padding: 14,
        background: "linear-gradient(160deg, rgba(15,25,48,0.98), rgba(4,10,24,0.95))",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.45), 0 0 40px rgba(83,221,252,0.18)",
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      <div
        style={{
          position: "relative",
          borderRadius: 28,
          overflow: "hidden",
          height: isMobile ? 500 : 560,
          background: "linear-gradient(180deg, rgba(9,19,40,1), rgba(6,14,32,1))",
          border: "1px solid rgba(83,221,252,0.12)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 14,
            left: "50%",
            transform: "translateX(-50%)",
            width: 104,
            height: 22,
            borderRadius: 999,
            background: "rgba(2,8,16,0.9)",
            zIndex: 3,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at top, rgba(83,221,252,0.16), transparent 40%), linear-gradient(180deg, rgba(186,158,255,0.08), transparent 45%)",
            zIndex: 1,
          }}
        />
        <img
          src={photoSrc}
          alt="Aditya Raj"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(false)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: isMobile ? "center 18%" : "center 20%",
            display: "block",
            opacity: loaded ? 1 : 0.18,
            transform: isMobile ? "scale(1.08)" : "scale(1.05)",
          }}
        />
        {!loaded && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: isMobile ? 22 : 32,
              textAlign: "center",
            }}
          >
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, color: "#fff", fontSize: 26, letterSpacing: "-0.03em" }}>
              Add your photo
            </div>
            <div style={{ fontFamily: "'Inter',sans-serif", color: "#a3aac4", fontSize: 14, lineHeight: 1.7 }}>
              Place <span style={{ color: "#53ddfc" }}>/profile-photo.jpg</span> in the project&apos;s public folder.
            </div>
          </div>
        )}
        <div
          style={{
            position: "absolute",
            left: 20,
            right: 20,
            bottom: 22,
            zIndex: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: isMobile ? "10px 14px" : "12px 16px",
            borderRadius: 18,
            background: "rgba(6,14,32,0.72)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(14px)",
          }}
        >
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, color: "#53ddfc", letterSpacing: "0.18em", textTransform: "uppercase" }}>
              Full Stack + AI/ML
            </div>
            <div style={{ fontFamily: "'Inter',sans-serif", color: "#fff", fontSize: 14, marginTop: 4 }}>
              Aditya Raj
            </div>
          </div>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 12px rgba(74,222,128,0.8)" }} />
        </div>
        <div style={{ position: "absolute", left: "50%", bottom: 10, transform: "translateX(-50%)", width: 96, height: 8, borderRadius: 999, background: "rgba(255,255,255,0.16)", zIndex: 3, boxShadow: "0 0 18px rgba(83,221,252,0.2)" }} />
      </div>
    </div>
  );
}

// ─── PARTICLE FIELD ──────────────────────────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    c.width = c.offsetWidth;
    c.height = c.offsetHeight;
    const pts = Array.from({ length: 80 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
    }));
    let id;
    function draw() {
      id = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > c.width) p.vx *= -1;
        if (p.y < 0 || p.y > c.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(186,158,255,0.5)";
        ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(83,221,252,${0.15 * (1 - d / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }
    draw();
    return () => cancelAnimationFrame(id);
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ setActive }) {
  const [visible, setVisible] = useState(false);
  const { isMobile } = useViewport();
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  return (
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: isMobile ? "112px 16px 64px" : "120px 24px 80px", position: "relative", overflow: "hidden" }}>
      <ParticleField />
      <div style={{ position: "absolute", top: "25%", left: "-80px", width: 384, height: 384, background: "rgba(132,85,239,0.08)", borderRadius: "50%", filter: "blur(120px)" }} />
      <div style={{ position: "absolute", bottom: "25%", right: "-80px", width: 384, height: 384, background: "rgba(64,206,237,0.08)", borderRadius: "50%", filter: "blur(120px)" }} />

      <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 900, width: "100%" }}>
        <div style={{ marginBottom: 48, display: "flex", justifyContent: "center" }}>
          <div style={{ width: isMobile ? 240 : 340, height: isMobile ? 240 : 340 }}><PuzzleCube /></div>
        </div>

        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s ease 0.2s" }}>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "clamp(48px,8vw,96px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1, marginBottom: 24 }}>
            ADITYA{" "}
            <span style={{ background: "linear-gradient(90deg,#ba9eff,#53ddfc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              RAJ
            </span>
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 16 : 18, color: "#a3aac4", maxWidth: 600, margin: "0 auto 32px", lineHeight: 1.7, padding: isMobile ? "0 8px" : 0 }}>
            Full-Stack Engineer & AI/ML Developer. Building scalable systems where intelligent design meets technical precision.
          </p>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setActive("Projects")} style={{ padding: isMobile ? "14px 24px" : "14px 36px", background: "linear-gradient(90deg,#ba9eff,#8455ef)", border: "none", borderRadius: 9999, color: "#000", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: "0.1em", cursor: "pointer", boxShadow: "0 0 30px rgba(186,158,255,0.3)", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}>
              EXPLORE WORK
            </button>
            <button onClick={() => setActive("Contact")} style={{ padding: isMobile ? "14px 24px" : "14px 36px", background: "rgba(25,37,64,0.6)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9999, color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.05em", cursor: "pointer", backdropFilter: "blur(12px)", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "rgba(31,43,73,0.8)"} onMouseOut={e => e.currentTarget.style.background = "rgba(25,37,64,0.6)"}>
              GET IN TOUCH
            </button>
          </div>
        </div>

        {/* Stat chips */}
        <div style={{ marginTop: 64, display: "flex", gap: isMobile ? 12 : 24, justifyContent: "center", flexWrap: "wrap", opacity: visible ? 1 : 0, transition: "opacity 1s ease 0.6s" }}>
          {[["9.32", "CGPA"], ["Top 32", "Hackathon"], ["98%", "Fraud Recall"], ["2+", "Years Coding"]].map(([val, label]) => (
            <div key={label} style={{ background: "rgba(25,37,64,0.6)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: isMobile ? "14px 16px" : "16px 24px", backdropFilter: "blur(12px)", textAlign: "center" }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 900, fontSize: isMobile ? 22 : 28, background: "linear-gradient(90deg,#ba9eff,#53ddfc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{val}</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: "#a3aac4", letterSpacing: "0.2em", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── ABOUT PAGE ───────────────────────────────────────────────────────────────
const SKILLS = [
  { cat: "Languages", items: ["Python", "C++", "JavaScript", "SQL"] },
  { cat: "Frontend", items: ["React", "HTML/CSS", "Tailwind"] },
  { cat: "Backend", items: ["Flask", "Django", "REST APIs"] },
  { cat: "AI/ML", items: ["PyTorch", "Scikit-learn", "EfficientNet", "OpenCV"] },
  { cat: "Databases", items: ["MongoDB", "MySQL", "PostgreSQL"] },
  { cat: "Analytics", items: ["Pandas", "Tableau", "Power BI", "Matplotlib"] },
  { cat: "Tools", items: ["Git/GitHub", "Jupyter", "GoogleADK", "LiteLLM"] },
  { cat: "Other", items: ["Web Scraping", "API Integration", "OCR Pipelines"] },
];

function AboutPage() {
  const { isMobile, isTablet } = useViewport();
  return (
    <section style={{ minHeight: "100vh", padding: isMobile ? "112px 16px 64px" : "120px 24px 80px", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(9,19,40,0.5)" }} />
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>
        {/* Header */}
        <div style={{ marginBottom: 64 }}>
          <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", color: "#53ddfc", textTransform: "uppercase" }}>About Me</span>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "clamp(36px,6vw,64px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", marginTop: 12 }}>
            Crafting <span style={{ color: "#ba9eff" }}>intelligent</span> digital systems.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 32 : 64, alignItems: "start" }}>
          {/* 3D Phone */}
          <div>
            <div style={{ background: "rgba(25,37,64,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 32, overflow: "visible", backdropFilter: "blur(12px)", boxShadow: "0 0 40px rgba(83,221,252,0.1)", padding: isMobile ? "12px 0 24px" : "18px 0 30px" }}>
              <PhoneFrame photoSrc={PROFILE_PHOTO} />
            </div>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#6d758c", textAlign: "center", marginTop: 12, letterSpacing: "0.1em" }}>Profile preview</p>
          </div>

          {/* Bio + Skills */}
          <div>
            <div style={{ marginBottom: 40 }}>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: isMobile ? 15 : 17, color: "#a3aac4", lineHeight: 1.8, marginBottom: 20 }}>
                I'm <strong style={{ color: "#fff" }}>Aditya Raj</strong>, a Computer Science undergraduate at Dayananda Sagar College of Engineering (CGPA 9.32), specializing in full-stack web development and AI/ML systems.
              </p>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: isMobile ? 15 : 17, color: "#a3aac4", lineHeight: 1.8, marginBottom: 20 }}>
                I build scalable applications using React, Flask, and MongoDB, and develop hybrid AI pipelines combining computer vision, OCR, and deep learning. My work has achieved 98% fraud recall in production systems.
              </p>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: isMobile ? 15 : 17, color: "#a3aac4", lineHeight: 1.8 }}>
                A national-level hackathon finalist (Top 32/100 among 800–1000 teams), I thrive at the intersection of backend engineering and intelligent systems design.
              </p>
            </div>

            {/* Education */}
            <div style={{ marginBottom: 40 }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, color: "#fff", marginBottom: 16, fontSize: 16, letterSpacing: "0.05em", textTransform: "uppercase" }}>Education</h3>
              {[
                { school: "Dayananda Sagar College of Engineering", degree: "B.E. Computer Science & Engineering", year: "2023–2027", score: "CGPA 9.32" },
                { school: "Delhi Public School, B.S. City", degree: "All India Senior School Certificate (XII)", year: "2020–2022", score: "92.2%" },
              ].map((e) => (
                <div key={e.school} style={{ background: "rgba(25,37,64,0.5)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "16px 20px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 8 : 0 }}>
                  <div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, color: "#fff", fontSize: 14 }}>{e.school}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", color: "#a3aac4", fontSize: 12, marginTop: 4 }}>{e.degree} · {e.year}</div>
                  </div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, color: "#53ddfc", fontSize: 14, whiteSpace: "nowrap" }}>{e.score}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skills Grid */}
        <div style={{ marginTop: 64 }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, color: "#fff", marginBottom: 32, fontSize: 16, letterSpacing: "0.2em", textTransform: "uppercase" }}>Technical Arsenal</h3>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, minmax(0, 1fr))" : "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>
            {SKILLS.map((s) => (
              <div key={s.cat} style={{ background: "rgba(25,37,64,0.5)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "20px 24px", transition: "all 0.3s" }} onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(186,158,255,0.3)"; e.currentTarget.style.transform = "translateY(-4px)"; }} onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 10, fontWeight: 700, color: "#53ddfc", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>{s.cat}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {s.items.map((item) => (
                    <span key={item} style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#dee5ff", background: "rgba(186,158,255,0.1)", border: "1px solid rgba(186,158,255,0.15)", borderRadius: 6, padding: "3px 10px" }}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── PROJECTS PAGE ────────────────────────────────────────────────────────────
const PROJECTS = [
  {
    title: "Hybrid Fraud Bill Detection",
    tag: "Computer Vision · EfficientNet + OCR",
    year: "2024",
    desc: "Fraud detection pipeline combining deep learning image classification with OCR-based numeric validation. Achieved 98% fraud recall on 694-receipt test dataset. Deployed via FastAPI + Swagger UI.",
    span: 8,
    accent: "#ba9eff",
    icon: "🔍",
    href: "https://github.com/Adityarajj23/Fraud_bill_detection.git"
  },
  {
    title: "Thali-Verse",
    tag: "Full-Stack · React + Flask + MongoDB",
    year: "2024",
    desc: "Full-stack restaurant management system with menu management, order tracking, analytics dashboards, MongoDB aggregation pipelines, and seasonal sales trend visualizations.",
    span: 4,
    accent: "#53ddfc",
    icon: "🍽️",
    href: "https://github.com/Adityarajj23/Thali-Verse.git"
  },

  {
    title: "ODDO × NMIT Hackathon Backend",
    tag: "Backend · Python + Django",
    year: "2024",
    desc: "Complete backend infrastructure for a national hackathon project. Modular services for user management, order processing, and item handling with REST-style API endpoints.",
    span: 4,
    accent: "#a27cff",
    icon: "🏆",
    href: "https://github.com/Adityarajj23/ODDO_X_NMIT.git"
  },
  {
    title: "AI Model Selection Automation",
    tag: "AI/ML · LiteLLM + GoogleADK",
    year: "Ongoing",
    desc: "Scalable system for automated LLM selection based on benchmarking metrics. Configurable evaluation pipelines to compare model outputs and dynamic integration of new AI models.",
    span: 8,
    accent: "#48d4f3",
    icon: "🤖",
    href: "https://github.com/Adityarajj23/AI-Model-Selection-Automation.git"
  },
  {
    title: "Jarvis Voice Assistant",
    tag: "AI · Python + Gemini API",
    year: "2024",
    desc: "Speech-enabled AI assistant with voice commands for opening applications, retrieving information, and answering queries. Integrates speech recognition, NLP, and system automation modules.",
    span: 12,
    accent: "#8455ef",
    icon: "🎙️",
    href: "https://github.com/Adityarajj23/Jarvis_Voice-Assistant.git"
  },
];

function ProjectCard({ p }) {
  const [hov, setHov] = useState(false);
  const [ctaHov, setCtaHov] = useState(false);
  const { isMobile, isTablet } = useViewport();

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => {
        setHov(false);
        setCtaHov(false);
      }}
      style={{
        gridColumn: isMobile ? "span 12" : isTablet ? `span ${Math.min(p.span, 6)}` : `span ${p.span}`,
        background: hov ? "rgba(31,43,73,0.7)" : "rgba(25,37,64,0.5)",
        border: `1px solid ${hov ? p.accent + "44" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 24,
        padding: isMobile ? 22 : 32,
        transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
        transform: hov ? "translateY(-6px) scale(1.01)" : "none",
        boxShadow: hov ? `0 0 40px ${p.accent}22` : "none",
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 10, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, color: p.accent, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>{p.tag} � {p.year}</div>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, color: "#fff", fontSize: isMobile ? 18 : 22, letterSpacing: "-0.02em" }}>{p.title}</h3>
        </div>
        <span style={{ fontSize: isMobile ? 26 : 32 }}>{p.icon}</span>
      </div>
      <p style={{ fontFamily: "'Inter',sans-serif", color: "#a3aac4", lineHeight: 1.7, fontSize: 14 }}>{p.desc}</p>
      <a
        href={p.href || SOCIAL_LINKS.github}
        target="_blank"
        rel="noreferrer"
        onMouseEnter={() => setCtaHov(true)}
        onMouseLeave={() => setCtaHov(false)}
        style={{
          marginTop: 20,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          color: ctaHov ? "#fff" : p.accent,
          background: ctaHov ? "rgba(6,14,32,0.92)" : "rgba(6,14,32,0.4)",
          border: `1px solid ${ctaHov ? p.accent + "66" : "rgba(255,255,255,0.08)"}`,
          boxShadow: ctaHov ? `0 0 24px ${p.accent}22` : "none",
          fontFamily: "'Plus Jakarta Sans',sans-serif",
          fontWeight: 700,
          fontSize: 13,
          textDecoration: "none",
          borderRadius: 9999,
          padding: "10px 14px",
          transform: ctaHov ? "translateX(4px)" : "translateX(0)",
          transition: "all 0.2s ease",
        }}
      >
        View Project <span aria-hidden="true">&rarr;</span>
      </a>
    </div>
  );
}

function ProjectsPage() {
  const { isMobile, isTablet } = useViewport();
  return (
    <section style={{ minHeight: "100vh", padding: isMobile ? "112px 16px 64px" : "120px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 64 }}>
          <div style={{ display: "inline-block", padding: "4px 16px", borderRadius: 9999, background: "rgba(20,31,56,0.8)", border: "1px solid rgba(64,72,93,0.3)", marginBottom: 20 }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, fontWeight: 700, color: "#53ddfc", letterSpacing: "0.2em", textTransform: "uppercase" }}>Portfolio Gallery</span>
          </div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "clamp(40px,7vw,80px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", marginBottom: 20 }}>
            Selected{" "}
            <span style={{ background: "linear-gradient(90deg,#ba9eff,#53ddfc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textShadow: "none" }}>
              Projects
            </span>
          </h1>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: isMobile ? 15 : 17, color: "#a3aac4", maxWidth: 600, lineHeight: 1.7 }}>
            A curated exploration of full-stack applications and AI systems — where engineering precision meets intelligent design.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(6, 1fr)" : "repeat(12, 1fr)", gap: isMobile ? 16 : 24 }}>
          {PROJECTS.map((p) => <ProjectCard key={p.title} p={p} />)}
        </div>

        {/* Achievements */}
        <div style={{ marginTop: 64, background: "rgba(25,37,64,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 32, padding: isMobile ? 24 : 48, backdropFilter: "blur(12px)" }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, color: "#fff", fontSize: isMobile ? 18 : 22, marginBottom: 24 }}>🏆 Achievements</h3>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {["National-level hackathon participant — Top 32 among 800–1000 teams", "National-level hackathon participant — Top 100 among 800–1000 teams", "Contributed to system architecture and rapid prototyping of AI-based solutions"].map((a) => (
              <div key={a} style={{ flex: "1 1 280px", background: "rgba(186,158,255,0.08)", border: "1px solid rgba(186,158,255,0.15)", borderRadius: 16, padding: "16px 20px", fontFamily: "'Inter',sans-serif", fontSize: 14, color: "#dee5ff", lineHeight: 1.6 }}>
                {a}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CONTACT PAGE ─────────────────────────────────────────────────────────────
function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "New Project Inquiry", message: "" });
  const [sent, setSent] = useState(false);
  const { isMobile } = useViewport();

  return (
    <section style={{ minHeight: "100vh", padding: isMobile ? "112px 16px 64px" : "120px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 64, position: "relative" }}>
          <div style={{ position: "absolute", top: -96, left: -96, width: 384, height: 384, background: "rgba(186,158,255,0.06)", borderRadius: "50%", filter: "blur(120px)" }} />
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "clamp(48px,8vw,96px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1 }}>
            LET'S{" "}
            <span style={{ background: "linear-gradient(90deg,#ba9eff,#53ddfc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              CONNECT
            </span>
          </h1>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: isMobile ? 15 : 18, color: "#a3aac4", maxWidth: 600, lineHeight: 1.7, marginTop: 20 }}>
            Whether you have a project in mind or want to explore collaboration, I'm just a message away.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "7fr 5fr", gap: isMobile ? 24 : 48, alignItems: "start" }}>
          {/* Form */}
          <div style={{ background: "rgba(25,37,64,0.6)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 32, padding: isMobile ? 24 : 48, backdropFilter: "blur(12px)", boxShadow: "0 0 30px rgba(186,158,255,0.1)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: -80, right: -80, width: 256, height: 256, background: "rgba(83,221,252,0.08)", borderRadius: "50%", filter: "blur(80px)" }} />
            {sent ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: 64, marginBottom: 24 }}>🚀</div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: "#fff", fontWeight: 800, fontSize: 24, marginBottom: 12 }}>Transmission Sent!</h3>
                <p style={{ fontFamily: "'Inter',sans-serif", color: "#a3aac4" }}>I'll get back to you soon.</p>
                <button onClick={() => setSent(false)} style={{ marginTop: 24, padding: "12px 28px", background: "none", border: "1px solid rgba(186,158,255,0.3)", color: "#ba9eff", borderRadius: 9999, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, cursor: "pointer" }}>Send Another</button>
              </div>
            ) : (
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 24, marginBottom: 24 }}>
                  {[["Full Name", "name", "text", "Aditya Raj"], ["Email Address", "email", "email", "hello@example.com"]].map(([label, field, type, ph]) => (
                    <div key={field}>
                      <label style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 10, fontWeight: 700, color: "#53ddfc", letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>{label}</label>
                      <input type={type} placeholder={ph} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })}
                        style={{ width: "100%", boxSizing: "border-box", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(64,72,93,0.4)", borderRadius: 12, padding: isMobile ? "12px 16px" : "14px 20px", color: "#dee5ff", fontFamily: "'Inter',sans-serif", fontSize: 14, outline: "none" }}
                        onFocus={e => e.target.style.borderColor = "#53ddfc"} onBlur={e => e.target.style.borderColor = "rgba(64,72,93,0.4)"} />
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 10, fontWeight: 700, color: "#53ddfc", letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Subject</label>
                  <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                    style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(64,72,93,0.4)", borderRadius: 12, padding: isMobile ? "12px 16px" : "14px 20px", color: "#dee5ff", fontFamily: "'Inter',sans-serif", fontSize: 14, outline: "none" }}>
                    {["New Project Inquiry", "Collaboration Opportunity", "AI/ML Consultation", "Just saying hello"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 32 }}>
                  <label style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 10, fontWeight: 700, color: "#53ddfc", letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Message</label>
                  <textarea rows={5} placeholder="Tell me about your project or idea..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                    style={{ width: "100%", boxSizing: "border-box", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(64,72,93,0.4)", borderRadius: 12, padding: isMobile ? "12px 16px" : "14px 20px", color: "#dee5ff", fontFamily: "'Inter',sans-serif", fontSize: 14, outline: "none", resize: "vertical" }}
                    onFocus={e => e.target.style.borderColor = "#53ddfc"} onBlur={e => e.target.style.borderColor = "rgba(64,72,93,0.4)"} />
                </div>
                <button onClick={() => setSent(true)}
                  style={{ width: "100%", padding: "18px", background: "linear-gradient(90deg,#ba9eff,#8455ef)", border: "none", borderRadius: 9999, color: "#000", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 900, fontSize: 15, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", boxShadow: "0 0 30px rgba(186,158,255,0.4)", transition: "transform 0.2s" }}
                  onMouseOver={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}>
                  Initiate Transmission
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, color: "#fff", fontSize: 20, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 32, height: 2, background: "#53ddfc", display: "inline-block" }} /> Direct Access
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
              {[
                { icon: "@", label: "Email", val: "adityaarajj2323@gmail.com", href: SOCIAL_LINKS.email, accent: "#48d4f3" },
                { icon: "in", label: "LinkedIn", val: "Adityaraj", href: SOCIAL_LINKS.linkedin, accent: "#ba9eff" },
                { icon: "gh", label: "GitHub", val: "adityaarajj", href: SOCIAL_LINKS.github, accent: "#a27cff" },
                { icon: "[]", label: "Location", val: "Bangalore, India", href: SOCIAL_LINKS.location, accent: "#53ddfc" },
              ].map((link) => (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer" style={{ background: "rgba(15,25,48,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "16px 20px", transition: "all 0.3s", cursor: "pointer", textDecoration: "none" }} onMouseOver={e => { e.currentTarget.style.background = "rgba(31,43,73,0.8)"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = link.accent + "55"; }} onMouseOut={e => { e.currentTarget.style.background = "rgba(15,25,48,0.8)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{link.icon}</div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 10, color: "#6d758c", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>{link.label}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, color: "#dee5ff", fontSize: 12 }}>{link.val}</div>
                </a>
              ))}
            </div>

            {/* Availability */}
            <div style={{ background: "rgba(25,37,64,0.6)", border: "1px solid rgba(83,221,252,0.2)", borderRadius: 24, padding: 28, backdropFilter: "blur(12px)", boxShadow: "0 0 20px rgba(83,221,252,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
                <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, color: "#fff", fontSize: 14 }}>Available for Internships</span>
              </div>
              <p style={{ fontFamily: "'Inter',sans-serif", color: "#a3aac4", fontSize: 13, lineHeight: 1.6 }}>
                Currently seeking Software Developer or AI/ML Engineer internship opportunities. Open to both remote and on-site roles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer({ setActive }) {
  const { isMobile } = useViewport();
  return (
    <footer style={{ background: "#020810", borderTop: "1px solid rgba(255,255,255,0.05)", padding: isMobile ? "32px 16px" : "48px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", flexWrap: "wrap", gap: 24 }}>
        <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 900, color: "#fff", fontSize: 16, letterSpacing: "-0.03em", textTransform: "uppercase" }}>ADITYA_RAJ</span>
        <div style={{ display: "flex", gap: isMobile ? 16 : 32, flexWrap: "wrap" }}>
          {[
            { label: "LinkedIn", href: SOCIAL_LINKS.linkedin },
            { label: "GitHub", href: SOCIAL_LINKS.github },
            { label: "Twitter", href: SOCIAL_LINKS.twitter },
            { label: "Instagram", href: SOCIAL_LINKS.instagram },
          ].map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = "#7c3aed"} onMouseOut={e => e.target.style.color = "#64748b"}>{link.label}</a>
          ))}
          <button onClick={() => setActive("Home")} style={{ background: "none", border: "none", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12, color: "#53ddfc", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>↑ Back to Top</button>
        </div>
        <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, color: "#334155", letterSpacing: "0.15em", textTransform: "uppercase" }}>© 2024 Aditya Raj. Built with Light.</span>
      </div>
    </footer>
  );
}

export default function App() {
  const [active, setActive] = useState("Home");

  const handleSetActive = (page) => {
    setActive(page);
    const scrollEl = document.getElementById("app-scroll");
    if (scrollEl) scrollEl.scrollTo({ top: 0, behavior: "instant" });
  };

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  return (
    <div id="app-scroll" style={{ height: "100vh", overflowY: "auto", background: "#060e20", color: "#dee5ff" }}>
      <Nav active={active} setActive={handleSetActive} />
      <main>
        {active === "Home" && <HomePage setActive={handleSetActive} />}
        {active === "About" && <AboutPage />}
        {active === "Projects" && <ProjectsPage />}
        {active === "Contact" && <ContactPage />}
      </main>
      <Footer setActive={handleSetActive} />
    </div>
  );
}






























