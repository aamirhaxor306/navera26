import { ChevronRight, Home as HomeIcon, Calendar, Star, Trophy, LogOut, ShieldCheck } from 'lucide-react';

const ADMIN_EMAIL = 'adminssb@naverassb.com';

export default function Home({ setMode, handleLogout, user, isAdmin }) {
    return (
        <div className="home-wrapper">
            {/* Full-screen cyberpunk background */}
            <div className="home-bg" />

            {/* Left Sidebar */}
            <aside className="sidebar">
                <img
                    src="/images/navera-logo-transparent.png"
                    alt="Navera"
                    className="sidebar-logo"
                />

                <nav className="sidebar-nav">
                    <button
                        className="nav-item active"
                        onClick={() => setMode('home')}
                    >
                        <HomeIcon size={22} />
                        HOME
                    </button>

                    <button
                        className="nav-item"
                        onClick={() => setMode('events')}
                    >
                        <Calendar size={22} />
                        EVENTS
                    </button>

                    <button
                        className="nav-item"
                        onClick={() => setMode('sponsors')}
                    >
                        <Star size={22} />
                        SPONSORS
                    </button>

                    <button
                        className="nav-item"
                        onClick={() => setMode('results')}
                    >
                        <Trophy size={22} />
                        RESULTS
                    </button>

                    {user?.email === ADMIN_EMAIL && (
                        <button className="nav-item" onClick={() => setMode('admin')}>
                            <ShieldCheck size={22} />ADMIN
                        </button>
                    )}

                    <span className="sidebar-spacer" />

                    <button
                        className="nav-item logout"
                        onClick={user ? handleLogout : () => setMode('login')}
                    >
                        <LogOut size={22} />
                        {user ? 'LOGOUT' : 'LOGIN'}
                    </button>
                </nav>
            </aside>

            {/* Main hero content */}
            <main className="home-main">
                <div className="hero-content">
                    <div className="hero-logo-wrap">
                        {/* Decorative lines above */}
                        <div className="deco-lines-top">
                            <div className="deco-line deco-line-short" />
                            <div className="deco-line deco-line-long" />
                        </div>

                        {/* Sparkle star */}
                        <span className="sparkle">✦</span>

                        <img
                            src="/images/navera-logo-transparent.png"
                            alt="NAVERA 25"
                            className="hero-logo"
                        />

                        <p className="hero-tagline">THE BUILDERS' ERA</p>

                        {/* Decorative lines below */}
                        <div className="deco-lines-bottom">
                            <div className="deco-line deco-line-long" />
                            <div className="deco-line deco-line-short" />
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="hero-ctas">
                        <button
                            className="btn btn-primary"
                            onClick={() => setMode('events')}
                        >
                            Explore Events <ChevronRight size={18} />
                        </button>
                        <button
                            className="btn btn-outline"
                            onClick={() => setMode('login')}
                        >
                            Register Now
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
