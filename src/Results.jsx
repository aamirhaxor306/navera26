import { useState, useEffect } from 'react';
import { supabase } from './supabase.js';
import { publicUrl } from './publicUrl.js';
import { Home as HomeIcon, Calendar, Star, Trophy, LogOut, Medal, ShieldCheck } from 'lucide-react';

const ADMIN_EMAIL = 'adminssb@naverassb.com';
const placeColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
const placeLabels = ['1ST', '2ND', '3RD'];

export default function Results({ setMode, handleLogout, user }) {
    const [grouped, setGrouped] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const { data } = await supabase.from('results').select('*').order('event_name').order('place');
            const g = {};
            (data || []).forEach(r => {
                if (!g[r.event_name]) g[r.event_name] = [];
                g[r.event_name].push(r);
            });
            setGrouped(g);
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
                    <button className="nav-item" onClick={() => setMode('sponsors')}><Star size={22} />SPONSORS</button>
                    <button className="nav-item active" onClick={() => setMode('results')}><Trophy size={22} />RESULTS</button>
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
                    <h1 className="page-title">RESULTS</h1>
                    <p className="page-subtitle">The champions of Navera '26.</p>
                </div>

                {loading ? <p style={{ color: 'var(--text-secondary)' }}>Loading...</p> : (
                    Object.keys(grouped).length === 0
                        ? <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: 60 }}>Results will be announced soon.</p>
                        : <div className="results-grid">
                            {Object.entries(grouped).map(([eventName, winners]) => (
                                <div className="result-card" key={eventName}>
                                    <h2 className="result-event-name">{eventName}</h2>
                                    <div className="result-winners">
                                        {winners.map(w => (
                                            <div className="result-row" key={w.id}>
                                                <span className="result-place" style={{ color: placeColors[w.place - 1] }}>
                                                    <Medal size={14} /> {placeLabels[w.place - 1]}
                                                </span>
                                                <div>
                                                    <p className="result-team">{w.team_name}</p>
                                                    <p className="result-members">{w.members}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                )}
            </main>
        </div>
    );
}
