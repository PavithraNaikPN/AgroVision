import os

css_content = r'''/* ============================================
   LeafSense - Complete Formatted Stylesheet
   ============================================ */

/* --- CSS Variables --- */
:root {
  --primary: #16a34a;
  --primary-dark: #15803d;
  --primary-light: #22c55e;
  --accent: #4ade80;
  --accent-glow: rgba(74, 222, 128, 0.4);
  --bg-start: #e3f0e3;
  --bg-end: #c8ddc8;
  --glass-bg: rgba(255, 255, 255, 0.25);
  --glass-bg-hov: rgba(255, 255, 255, 0.4);
  --glass-bdr: rgba(255, 255, 255, 0.6);
  --glass-bdr-hov: rgba(255, 255, 255, 0.8);
  --glass-blur: 24px;
  --txt-prim: #1e2f1e;
  --txt-sec: #1e3f1e;
  --txt-muted: #2b7a2b;
  --sh-soft: 0 8px 32px rgba(0, 40, 0, 0.15);
  --sh-med: 0 12px 40px rgba(0, 40, 0, 0.2);
  --sh-glow: 0 0 40px rgba(43, 122, 43, 0.15);
  --sh-inn: inset 0 1px 1px rgba(255, 255, 255, 0.5);
  --btn: linear-gradient(135deg, #1e3f1e, #2b7a2b);
  --btn-hov: linear-gradient(135deg, #2b7a2b, #3d8b40);
  --inp-bg: rgba(255, 255, 255, 0.5);
  --icon: #2b7a2b;
}

body.dark-mode {
  --bg-start: #0a1f0a;
  --bg-end: #1a2e1a;
  --glass-bg: rgba(10, 30, 10, 0.6);
  --glass-bg-hov: rgba(0, 30, 0, 0.7);
  --glass-bdr: rgba(80, 120, 80, 0.5);
  --glass-bdr-hov: rgba(80, 120, 80, 0.7);
  --txt-prim: #d0e0d0;
  --txt-sec: #b0d0b0;
  --txt-muted: #86efac;
  --sh-glow: 0 0 40px rgba(74, 222, 128, 0.1);
}

/* --- Base --- */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', -apple-system, sans-serif;
}

html {
  scroll-behavior: smooth;
  font-size: 20px;
}

body {
  background: linear-gradient(145deg, var(--bg-start), var(--bg-end)),
    url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80') fixed;
  background-size: cover, cover;
  background-position: center, center;
  color: var(--txt-prim);
  line-height: 1.8;
  font-size: 1.15rem;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  animation: fadeInBody 1s ease-out;
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at 20% 20%, rgba(43, 122, 43, 0.15) 0, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(139, 195, 74, 0.12) 0, transparent 50%);
  z-index: -2;
  animation: morphMove 20s ease-in-out infinite alternate;
}

body::after {
  content: '';
  position: fixed;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='nf'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23nf)'/%3E%3C/svg%3E");
  opacity: 0.02;
  z-index: -1;
  pointer-events: none;
}

/* --- Keyframes --- */
@keyframes morphMove {
  0% { transform: scale(1) rotate(0); }
  50% { transform: scale(1.1) rotate(2deg); }
  100% { transform: scale(1) rotate(0); }
}

@keyframes fadeInBody {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes floatParticle {
  0% { transform: translateY(110vh) scale(0); opacity: 0; }
  10% { opacity: 0.6; }
  90% { opacity: 0.6; }
  100% { transform: translateY(-10vh) scale(1); opacity: 0; }
}

@keyframes floatLeaf {
  0%, 100% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-6px) rotate(3deg); }
}

@keyframes floatVisual {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes floatAround {
  0%, 100% { transform: translate(0, 0) rotate(0); }
  25% { transform: translate(15px, -15px) rotate(12deg); }
  50% { transform: translate(-10px, -25px) rotate(-12deg); }
  75% { transform: translate(-20px, 10px) rotate(6deg); }
}

@keyframes rotateGlow {
  0% { transform: rotate(0); }
  100% { transform: rotate(360deg); }
}

@keyframes floatCard {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes slideUp {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes slideLeft {
  0% { opacity: 0; transform: translateX(-60px); }
  100% { opacity: 1; transform: translateX(0); }
}

@keyframes slideRight {
  0% { opacity: 0; transform: translateX(60px); }
  100% { opacity: 1; transform: translateX(0); }
}

@keyframes scaleIn {
  0% { opacity: 0; transform: scale(0.85); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes scanBeam {
  0% { top: 0; opacity: 0; }
  10% { opacity: 0.8; }
  90% { opacity: 0.8; }
  100% { top: 100%; opacity: 0; }
}

@keyframes floatIcon {
  0%, 100% { transform: translateY(0) rotate(0); }
  33% { transform: translateY(-8px) rotate(3deg); }
  66% { transform: translateY(4px) rotate(-2deg); }
}

@keyframes pulseBorder {
  0%, 100% { border-color: rgba(74, 222, 128, 0.4); }
  50% { border-color: rgba(74, 222, 128, 0.8); }
}

@keyframes rippleExpand {
  to { transform: scale(4); opacity: 0; }
}

@keyframes revealAppear {
  0% { opacity: 0; transform: translateY(20px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes shimmerMove {
  0% { left: -100%; }
  100% { left: 100%; }
}

@keyframes spinLoader {
  0% { transform: rotate(0); }
  100% { transform: rotate(360deg); }
}

@keyframes skeletonShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes blinkCursor {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* --- Layout --- */
.container {
  width: 92%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.5rem 0 2rem;
  position: relative;
  z-index: 2;
  flex: 1;
}

/* ============================================
   NAVBAR
   ============================================ */
.navbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 2.5rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15));
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-radius: 32px;
  margin-top: 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.6);
  position: sticky;
  top: 12px;
  z-index: 1000;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.navbar:hover {
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.8);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.25));
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 2.2rem;
  font-weight: 900;
  color: var(--primary-dark);
  letter-spacing: -0.03em;
  z-index: 1001;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.logo i {
  font-size: 2.4rem;
  color: var(--primary-light);
  animation: floatLeaf 3s ease-in-out infinite;
  filter: drop-shadow(0 2px 15px rgba(22, 163, 74, 0.4));
}

.logo a {
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  gap: 12px;
}

.hamburger {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
}

.hamburger span {
  width: 28px;
  height: 2.5px;
  background: var(--txt-prim);
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  transform-origin: 1px;
}

.hamburger.active span:first-child {
  transform: rotate(45deg);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
  transform: translateX(20px);
}

.hamburger.active span:nth-child(3) {
  transform: rotate(-45deg);
}

.nav-links {
  display: flex;
  gap: 0.5rem;
  font-weight: 500;
  align-items: center;
  flex-wrap: wrap;
  transition: all 0.3s ease;
}

.nav-links a {
  text-decoration: none;
  color: var(--txt-sec);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 1.2rem;
  padding: 0.7rem 1.2rem;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  font-weight: 600;
}

.nav-links a::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: inherit;
  z-index: -1;
}

.nav-links a:hover,
.nav-links a.active {
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(22, 163, 74, 0.3);
}

.nav-links a:hover::before,
.nav-links a.active::before {
  opacity: 1;
}

.dark-toggle {
  background: var(--glass-bg);
  border: 1px solid var(--glass-bdr);
  color: var(--txt-prim);
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-left: 0.5rem;
  backdrop-filter: blur(10px);
}

.dark-toggle:hover {
  background: var(--glass-bg-hov);
  border-color: var(--accent);
  transform: scale(1.1) rotate(15deg);
  box-shadow: 0 0 20px var(--accent-glow);
}

.dark-toggle i {
  font-size: 1.2rem;
  color: var(--accent);
  transition: all 0.3s ease;
}

.lang-switch {
  display: flex;
  gap: 0.4rem;
  margin-left: 0.5rem;
}

.lang-btn {
  background: var(--glass-bg);
  border: 1px solid var(--glass-bdr);
  color: var(--txt-sec);
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  font-size: 1.1rem;
}

.lang-btn:hover {
  background: var(--glass-bg-hov);
  border-color: var(--accent);
  color: var(--txt-prim);
  transform: translateY(-2px);
}

.lang-btn.active {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  border-color: var(--accent);
  color: #fff;
  box-shadow: 0 4px 15px rgba(22, 163, 74, 0.3);
}

/* ============================================
   INTRO / HERO SECTION
   ============================================ */
.intro-section {
  display: flex;
  align-items: center;
  gap: 4rem;
  padding: 5rem 0;
  margin-bottom: 2rem;
  position: relative;
}

.intro-content {
  flex: 1;
  animation: slideUp 1s ease-out;
}

.intro-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, rgba(22, 163, 74, 0.25), rgba(74, 222, 128, 0.15));
  color: var(--primary-dark);
  padding: 0.8rem 1.6rem;
  border-radius: 60px;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  border: 2px solid rgba(74, 222, 128, 0.35);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(22, 163, 74, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.4);
  letter-spacing: 0.02em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.intro-content h1 {
  font-size: 4.2rem;
  font-weight: 900;
  line-height: 1.1;
  color: var(--txt-prim);
  margin-bottom: 1.5rem;
  letter-spacing: -0.03em;
  text-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.intro-highlight {
  background: linear-gradient(135deg, #15803d, #16a34a, #22c55e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 950;
}

.intro-description {
  font-size: 1.5rem;
  color: rgba(30, 47, 30, 0.85);
  margin-bottom: 2.5rem;
  max-width: 560px;
  line-height: 1.8;
  opacity: 1;
  font-weight: 500;
}

.intro-stats {
  display: flex;
  gap: 3rem;
  margin-bottom: 2.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  position: relative;
}

.stat-item::after {
  content: '';
  position: absolute;
  right: -1.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 60%;
  background: linear-gradient(to bottom, transparent, var(--glass-bdr), transparent);
}

.stat-item:last-child::after {
  display: none;
}

.stat-number {
  font-size: 2.6rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary-light), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.stat-label {
  font-size: 1.1rem;
  color: var(--txt-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: 0.4rem;
  font-weight: 700;
}

.intro-cta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.cta-primary {
  background: linear-gradient(135deg, #15803d 0%, #16a34a 50%, #22c55e 100%);
  color: #fff;
  border: none;
  padding: 1.2rem 3rem;
  border-radius: 24px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 12px 40px rgba(22, 163, 74, 0.4), 0 0 0 2px rgba(74, 222, 128, 0.2);
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.cta-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s ease;
}

.cta-primary:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 16px 50px rgba(22, 163, 74, 0.5), 0 0 40px rgba(74, 222, 128, 0.3);
}

.cta-primary:hover::before {
  left: 100%;
}

.cta-primary:active {
  transform: translateY(-1px) scale(0.98);
}

.cta-secondary {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
  color: var(--primary-dark);
  border: 2px solid rgba(74, 222, 128, 0.4);
  padding: 1.2rem 3rem;
  border-radius: 24px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  overflow: hidden;
}

.cta-secondary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(22, 163, 74, 0.08), rgba(74, 222, 128, 0.04));
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: inherit;
  z-index: -1;
}

.cta-secondary:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15));
  border-color: rgba(74, 222, 128, 0.6);
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15), 0 0 30px rgba(74, 222, 128, 0.2);
}

.cta-secondary:hover::before {
  opacity: 1;
}

.intro-visual {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: floatVisual 5s ease-in-out infinite;
  position: relative;
}

.leaf-circle {
  width: 340px;
  height: 340px;
  background: linear-gradient(135deg, rgba(22, 163, 74, 0.1), rgba(74, 222, 128, 0.05));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(74, 222, 128, 0.2);
  backdrop-filter: blur(20px);
  position: relative;
  box-shadow: var(--sh-inn), 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 60px rgba(74, 222, 128, 0.1);
}

.leaf-circle::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), transparent, var(--accent));
  z-index: -1;
  animation: rotateGlow 8s linear infinite;
  opacity: 0.3;
}

.leaf-circle i {
  font-size: 7rem;
  background: linear-gradient(135deg, var(--primary-light), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 10px 30px rgba(22, 163, 74, 0.3));
}

.floating-leaf-1,
.floating-leaf-2,
.floating-leaf-3 {
  position: absolute;
  font-size: 1.8rem;
  opacity: 0.5;
  animation: floatAround 7s infinite ease-in-out;
  filter: drop-shadow(0 4px 10px rgba(74, 222, 128, 0.3));
}

.floating-leaf-1 {
  top: 8%;
  left: -5%;
  animation-delay: 0s;
}

.floating-leaf-2 {
  bottom: 15%;
  right: -3%;
  animation-delay: 2.5s;
}

.floating-leaf-3 {
  top: 60%;
  left: -8%;
  animation-delay: 5s;
}

/* ============================================
   GLASS CARDS
   ============================================ */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-radius: 24px;
  border: 1px solid var(--glass-bdr);
  padding: 2rem;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.glass-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.08) 0, transparent 50%);
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}

.glass-card:hover {
  background: var(--glass-bg-hov);
  border-color: var(--glass-bdr-hov);
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--sh-med), var(--sh-glow);
}

.glass-card:hover::before {
  opacity: 1;
}

.float-card {
  animation: floatCard 6s ease-in-out infinite;
}

.float-card:nth-child(2) {
  animation-delay: 1s;
}

.float-card:nth-child(3) {
  animation-delay: 2s;
}

/* ============================================
   SEARCH
   ============================================ */
.search-container {
  margin: 2.5rem auto;
  max-width: 650px;
  display: flex;
  gap: 1rem;
  align-items: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(35px);
  border-radius: 32px;
  padding: 1rem 2rem;
  border: 2px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
}

.search-container:focus-within {
  border-color: rgba(74, 222, 128, 0.6);
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.2), 0 0 30px rgba(74, 222, 128, 0.25);
}

.search-container i {
  color: var(--primary);
  font-size: 1.3rem;
  font-weight: 600;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 1rem 0;
  font-size: 1.2rem;
  color: var(--txt-prim);
  outline: none;
  font-weight: 500;
}

.search-input::placeholder {
  color: rgba(30, 47, 30, 0.5);
  opacity: 0.7;
}

.search-btn {
  background: linear-gradient(135deg, #15803d, #16a34a);
  border: none;
  color: #fff;
  padding: 1rem 2.2rem;
  border-radius: 20px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 1.15rem;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(22, 163, 74, 0.35);
}

.search-btn:hover {
  background: linear-gradient(135deg, #16a34a, #22c55e);
  transform: scale(1.08);
  box-shadow: 0 12px 35px rgba(22, 163, 74, 0.45);
}

/* ============================================
   UPLOAD
   ============================================ */
.upload-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.12));
  backdrop-filter: blur(35px);
  border-radius: 40px;
  padding: 3rem;
  margin: 2.5rem 0 3.5rem;
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.35);
  text-align: center;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.upload-card:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0.18));
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.25);
  transform: translateY(-6px);
}

.ai-scan-overlay {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.ai-scan-overlay.active {
  opacity: 1;
}

.ai-scan-line {
  position: absolute;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--accent), var(--primary-light), transparent);
  box-shadow: 0 0 20px var(--accent), 0 0 40px var(--primary);
  animation: scanBeam 2s ease-in-out infinite;
  opacity: 0.8;
}

.ai-scan-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(74, 222, 128, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(74, 222, 128, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
}

.upload-area {
  border: 3px dashed rgba(74, 222, 128, 0.4);
  background: linear-gradient(135deg, rgba(22, 163, 74, 0.08), rgba(74, 222, 128, 0.04));
  backdrop-filter: blur(15px);
  border-radius: 28px;
  padding: 3rem 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 4px 15px rgba(0, 0, 0, 0.05);
}

.upload-area::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(74, 222, 128, 0.12) 0, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.upload-area:hover {
  border-color: var(--accent);
  background: linear-gradient(135deg, rgba(22, 163, 74, 0.12), rgba(74, 222, 128, 0.08));
  transform: scale(1.02);
  box-shadow: inset 0 6px 20px rgba(22, 163, 74, 0.08);
}

.upload-area:hover::before {
  opacity: 1;
}

.upload-area.drag-over {
  border-color: var(--primary-light);
  background: linear-gradient(135deg, rgba(22, 163, 74, 0.15), rgba(74, 222, 128, 0.12));
  box-shadow: inset 0 0 30px rgba(74, 222, 128, 0.15), 0 0 30px rgba(74, 222, 128, 0.2);
  animation: pulseBorder 1.5s ease-in-out infinite;
  border-width: 3px;
}

.upload-area i {
  font-size: 4rem;
  background: linear-gradient(135deg, var(--primary-light), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  opacity: 1;
  animation: floatIcon 4s ease-in-out infinite;
  filter: drop-shadow(0 4px 15px rgba(22, 163, 74, 0.2));
}

.upload-area h3 {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--primary-dark);
  letter-spacing: -0.01em;
  margin-bottom: 0.5rem;
}

.upload-area p {
  font-size: 1.2rem;
  color: rgba(30, 47, 30, 0.7);
  font-weight: 500;
}

.upload-btn {
  background: linear-gradient(135deg, #15803d, #16a34a);
  color: #fff;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 20px;
  font-size: 1.2rem;
  font-weight: 700;
  margin-top: 0.8rem;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba
