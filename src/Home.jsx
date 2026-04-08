import { motion } from 'framer-motion';
import { Home as HomeIcon, Calendar, Star, Trophy, LogOut, ShieldCheck, ChevronRight, Instagram, Linkedin } from 'lucide-react';

const ADMIN_EMAIL = 'adminssb@naverassb.com';

const EASE_OUT = [0.25, 0.46, 0.45, 0.94];

export default function Home({ setMode, handleLogout, user }) {
    return (
        <div className="home-wrapper">

            {/* Background: starts near-black → sign glows first → full reveal */}
            <motion.div
                className="home-bg"
                initial={{ filter: 'brightness(0.04) saturate(0)' }}
                animate={{ filter: [
                    'brightness(0.04) saturate(0)',
                    'brightness(0.38) saturate(0.5)',
                    'brightness(1) saturate(1)',
                ]}}
                transition={{ duration: 2.2, delay: 0.2, times: [0, 0.45, 1], ease: 'easeInOut' }}
            />

            {/* Sign glow overlay — amplifies the neon sign in the upper-left */}
            <motion.div
                className="sign-glow"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.6, 0.6, 0] }}
                transition={{ duration: 2.4, delay: 0.3, times: [0, 0.22, 0.55, 1] }}
            />

            {/* ────── SIDEBAR ────── */}
            <aside className="sidebar">
                <img src="/images/navera-logo-transparent.png" alt="Navera" className="sidebar-logo" />
                <nav className="sidebar-nav">
                    <button className="nav-item active" onClick={() => setMode('home')}>
                        <HomeIcon size={22} />HOME
                    </button>
                    <button className="nav-item" onClick={() => setMode('events')}>
                        <Calendar size={22} />EVENTS
                    </button>
                    <button className="nav-item" onClick={() => setMode('sponsors')}>
                        <Star size={22} />SPONSORS
                    </button>
                    <button className="nav-item" onClick={() => setMode('results')}>
                        <Trophy size={22} />RESULTS
                    </button>
                    {user?.email === ADMIN_EMAIL && (
                        <button className="nav-item" onClick={() => setMode('admin')}>
                            <ShieldCheck size={22} />ADMIN
                        </button>
                    )}
                    <span className="sidebar-spacer" />
                    <button className="nav-item logout" onClick={user ? handleLogout : () => setMode('login')}>
                        <LogOut size={22} />{user ? 'LOGOUT' : 'LOGIN'}
                    </button>
                </nav>
            </aside>

            {/* ────── SOCIAL STRIP (right) ────── */}
            <div className="social-strip">
                <a href="https://www.instagram.com/navera_ssb?igsh=djdyd2JvdTFxdWIx" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                    <Instagram size={20} />
                </a>
                <div className="social-divider" />
                <a href="https://www.linkedin.com/in/navera-ssb-0459103b6?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                    <Linkedin size={20} />
                </a>
            </div>

            {/* ────── HERO ────── */}
            <main className="home-main">
                <div className="hero-content">
                    <div className="hero-logo-wrap">

                        {/* Logo — fades in after scene is revealed */}
                        <motion.img
                            src="/images/navera-logo-transparent.png"
                            alt="NAVERA 26"
                            className="hero-logo"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, delay: 2.1, ease: EASE_OUT }}
                        />

                        <div className="hero-divider" />

                        {/* Tagline */}
                        <motion.p
                            className="hero-tagline"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 2.6, ease: EASE_OUT }}
                        >
                            THE BUILDERS' ERA
                        </motion.p>
                    </div>

                    {/* CTA buttons */}
                    <motion.div
                        className="hero-ctas"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 2.95, ease: EASE_OUT }}
                    >
                        <button className="btn btn-primary" onClick={() => setMode('events')}>
                            Explore Events <ChevronRight size={18} />
                        </button>
                    </motion.div>
                </div>
            </main>

            {/* Partners — static badges, bottom of Home */}
            <div className="partners-row" role="region" aria-label="Partners">
                <div className="partner-badge" aria-label="Ticketing partner">
                    <span className="partner-badge-label">Ticketing partner</span>
                    <img
                        src="/images/district.png"
                        alt="Get tickets on District by Zomato"
                        className="partner-badge-logo partner-badge-logo--district"
                    />
                </div>

                <div className="partner-badge" aria-label="Registration partner">
                    <span className="partner-badge-label">Registration partner</span>
                    <img
                        src="/images/Unstop-Logo-Blue-Small.png"
                        alt="Unstop"
                        className="partner-badge-logo"
                    />
                </div>
            </div>
        </div>
    );
}
