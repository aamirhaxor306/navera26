import { useState, useEffect } from 'react';
import { supabase } from './supabase.js';
import { publicUrl } from './publicUrl.js';
import { Home as HomeIcon, Calendar, LogOut, ShieldCheck } from 'lucide-react';

const ADMIN_EMAIL = 'adminssb@naverassb.com';

export default function Sponsors({ setMode, handleLogout, user }) {
    const [sponsors, setSponsors] = useState({ title: [], gold: [], silver: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const { data } = await supabase.from('sponsors').select('*').order('created_at');
            const grouped = { title: [], gold: [], silver: [] };
            (data || []).forEach(s => { if (grouped[s.tier]) grouped[s.tier].push(s); });
            setSponsors(grouped);
            setLoading(false);
        };
        load();
    }, []);

    return (
        <div className="home-wrapper">
            <div className="home-bg" />
            <aside className="sidebar">
                <img src={publicUrl('images/navera-logo-transparent.png')} alt="Navera" className="sidebar-logo" />
                <nav className="sidebar-nav">
                    <button className="nav-item" onClick={() => setMode('home')}><HomeIcon size={22} />HOME</button>
                    <button className="nav-item" onClick={() => setMode('events')}><Calendar size={22} />EVENTS</button>
                    {user?.email === ADMIN_EMAIL && (
                        <button className="nav-item" onClick={() => setMode('admin')}><ShieldCheck size={22} />ADMIN</button>
                    )}
                    <span className="sidebar-spacer" />
                    <button className="nav-item logout" onClick={user ? handleLogout : () => setMode('login')}>
                        <LogOut size={22} />{user ? 'LOGOUT' : 'LOGIN'}
                    </button>
                </nav>
            </aside>

            <main className="page-main">
                <div className="page-header">
                    <h1 className="page-title">SPONSORS</h1>
                    <p className="page-subtitle">The builders behind the builders.</p>
                </div>

                {loading ? <p style={{ color: 'var(--text-secondary)' }}>Loading...</p> : (
                    <div className="sponsors-section">
                        {sponsors.title.length > 0 && <>
                            <p className="sponsor-tier-label title-tier">TITLE SPONSOR</p>
                            <div className="sponsors-row">
                                {sponsors.title.map(s => (
                                    <div className="sponsor-card sponsor-title" key={s.id}>
                                        <p className="sponsor-name">{s.name}</p>
                                        <p className="sponsor-desc">{s.description}</p>
                                    </div>
                                ))}
                            </div>
                        </>}
                        {sponsors.gold.length > 0 && <>
                            <p className="sponsor-tier-label gold-tier">GOLD SPONSORS</p>
                            <div className="sponsors-row">
                                {sponsors.gold.map(s => (
                                    <div className="sponsor-card sponsor-gold" key={s.id}>
                                        <p className="sponsor-name">{s.name}</p>
                                        <p className="sponsor-desc">{s.description}</p>
                                    </div>
                                ))}
                            </div>
                        </>}
                        {sponsors.silver.length > 0 && <>
                            <p className="sponsor-tier-label silver-tier">SILVER SPONSORS</p>
                            <div className="sponsors-row">
                                {sponsors.silver.map(s => (
                                    <div className="sponsor-card sponsor-silver" key={s.id}>
                                        <p className="sponsor-name">{s.name}</p>
                                        <p className="sponsor-desc">{s.description}</p>
                                    </div>
                                ))}
                            </div>
                        </>}
                        {!sponsors.title.length && !sponsors.gold.length && !sponsors.silver.length && (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: 60 }}>No sponsors added yet.</p>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
