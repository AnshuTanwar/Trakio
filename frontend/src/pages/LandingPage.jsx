import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowDown, CheckCircle, Users, LayoutDashboard, Activity, MessageSquare, Sparkles, BrainCircuit } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const yPos = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="logo">Trakio</div>
        <nav className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#about" className="nav-link">About</a>
          <Link to="/login" className="nav-link">Login</Link>
        </nav>
        <Link to="/register">
          <button className="btn-secondary" style={{ padding: '0.5rem 1.25rem' }}>Get Started &rarr;</button>
        </Link>
      </header>

      <section className="hero-section">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h1 className="hero-title">
            <span>Crafting</span>
            <span>productivity</span>
            <span className="highlight">through design</span>
          </h1>
          <p className="hero-subtitle">
            We believe good design is key to building strong teams. Trakio simplifies project management with a beautiful, intuitive interface.
          </p>
          <div className="cta-group">
            <Link to="/register">
              <button className="btn-primary">Start for free</button>
            </Link>
            <a href="#features" className="nav-link" style={{ marginLeft: '1rem' }}>See Features</a>
          </div>
        </motion.div>

        <motion.div 
          className="scroll-indicator"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span>Scroll Now</span>
          <div className="scroll-icon">
            <ArrowDown size={20} />
          </div>
        </motion.div>
      </section>

      <section id="features" className="features-section">
        <div className="features-grid">
          <motion.div 
            className="feature-text"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2>
              At Trakio — we believe that management is not just about tasks but also about creating immersive experiences.
            </h2>
            <p>
              We combine powerful features with elegant design to deliver a workspace that not only meets expectations, but exceeds them.
            </p>
            <Link to="/register">
              <button className="btn-primary" style={{ border: '1px solid #000' }}>Learn More &rarr;</button>
            </Link>
          </motion.div>

          <motion.div 
            className="feature-visuals"
            style={{ y: yPos }}
          >
            <div className="feature-card">
              <div style={{ background: '#f0eaff', padding: '1.5rem', borderRadius: '12px', color: '#4a25e1' }}>
                <LayoutDashboard size={48} />
              </div>
              <div>
                <h3>Intuitive Dashboard</h3>
                <p style={{ color: '#666', fontSize: '0.95rem' }}>Track all your projects, overdue tasks, and team progress in one beautiful unified view.</p>
              </div>
            </div>

            <div className="feature-card">
              <div style={{ background: '#eafaf1', padding: '1.5rem', borderRadius: '12px', color: '#27ae60' }}>
                <Activity size={48} />
              </div>
              <div>
                <h3>Activity Audit Log</h3>
                <p style={{ color: '#666', fontSize: '0.95rem' }}>A real-time timeline tracking every action taken by your team for full transparency.</p>
              </div>
            </div>

            <div className="feature-card">
              <div style={{ background: '#fff0ea', padding: '1.5rem', borderRadius: '12px', color: '#e67e22' }}>
                <MessageSquare size={48} />
              </div>
              <div>
                <h3>Task Comments</h3>
                <p style={{ color: '#666', fontSize: '0.95rem' }}>Communicate directly on tasks with a built-in chat system to keep context where it belongs.</p>
              </div>
            </div>

            <div className="feature-card">
              <div style={{ background: '#eaf2ff', padding: '1.5rem', borderRadius: '12px', color: '#2980b9' }}>
                <Sparkles size={48} />
              </div>
              <div>
                <h3>AI Task Generation</h3>
                <p style={{ color: '#666', fontSize: '0.95rem' }}>Instantly auto-generate actionable sub-tasks for any project using powerful AI models.</p>
              </div>
            </div>

            <div className="feature-card">
              <div style={{ background: '#f9eafe', padding: '1.5rem', borderRadius: '12px', color: '#8e44ad' }}>
                <BrainCircuit size={48} />
              </div>
              <div>
                <h3>Executive Summary & Enhancement</h3>
                <p style={{ color: '#666', fontSize: '0.95rem' }}>Get instant AI summaries of team performance and one-click professional task descriptions.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
