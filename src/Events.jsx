import { useState, useEffect } from 'react';
import { supabase } from './supabase.js';
import { publicUrl } from './publicUrl.js';
import { Home as HomeIcon, Calendar, LogOut, MapPin, Users, Mail, Phone, ArrowLeft, ShieldCheck, ExternalLink, Trophy } from 'lucide-react';

const ADMIN_EMAIL = 'adminssb@naverassb.com';

function normalizeExternalHref(url) {
    const u = (url || '').trim();
    if (!u) return '';
    if (/^https?:\/\//i.test(u)) return u;
    return `https://${u}`;
}

const events = [
    {
        id: 1,
        name: 'Hackathon',
        category: 'Tech',
        date: 'March 25, 2026',
        description: 'Build innovative solutions in 24 hours. Solo or team up to 4. Push boundaries with AI, IoT, or any tech stack of your choice.',
        tag: 'FLAGSHIP',
        banner: null,
        location: 'Main Auditorium, Block A',
        teamSize: '1 – 4 members',
        eligibility: [
            'Open to all enrolled undergraduate and postgraduate students',
            'Maximum 4 members per team',
            'At least one member must be from a CS / IT / EC branch',
            'Each participant can register in only one team',
        ],
        host: { name: 'Raza Khan', email: 'hackathon@navera.tech', phone: '+91 98765 43210' },
    },
    {
        id: 2,
        name: 'Robo Wars',
        category: 'Robotics',
        date: 'March 25, 2026',
        description: 'Build and battle robots in an arena combat challenge. Design, fabricate, and fight your way to the top.',
        tag: 'POPULAR',
        banner: null,
        location: 'Sports Ground, Block C',
        teamSize: '2 – 4 members',
        eligibility: [
            'Open to all students with a valid college ID',
            'Teams of 2 to 4 members',
            'Robots must weigh under 15 kg',
            'No pre-built commercial robots allowed',
        ],
        host: { name: 'Sara Ali', email: 'robowars@navera.tech', phone: '+91 91234 56789' },
    },
    {
        id: 3,
        name: 'Code Sprint',
        category: 'Competitive Programming',
        date: 'March 26, 2026',
        description: 'Solve algorithmic problems under time pressure. Compete individually against the best coders from across colleges.',
        tag: null,
        banner: null,
        location: 'Computer Lab 1 & 2, Block B',
        teamSize: 'Solo only',
        eligibility: [
            'Individual participation only — no teams',
            'Open to all students regardless of branch',
            'Basic knowledge of any programming language required',
            'Own laptop allowed; lab systems will also be available',
        ],
        host: { name: 'Hamza Siddiq', email: 'codesprint@navera.tech', phone: '+91 99887 76655' },
    },
    {
        id: 4,
        name: 'UI/UX Design Challenge',
        category: 'Design',
        date: 'March 26, 2026',
        description: 'Design stunning user experiences for real-world problems. Present your Figma prototype to a panel of design experts.',
        tag: null,
        banner: null,
        location: 'Design Studio, Block D',
        teamSize: '1 – 2 members',
        eligibility: [
            'Open to all enrolled students',
            'Solo or pairs (max 2 members)',
            'Designs must be original — no templates',
            'Figma or Adobe XD must be used for prototyping',
        ],
        host: { name: 'Fatima Noor', email: 'design@navera.tech', phone: '+91 97654 32109' },
    },
    {
        id: 5,
        name: 'Project Expo',
        category: 'Exhibition',
        date: 'March 27, 2026',
        description: 'Showcase your project to judges and industry professionals. Win exciting prizes and get your work noticed.',
        tag: null,
        banner: null,
        location: 'Exhibition Hall, Block E',
        teamSize: '1 – 5 members',
        eligibility: [
            'Open to all students and recent graduates (2024–2026 batch)',
            'Projects must be original student work',
            'Hardware and software projects both welcome',
            'Each team gets a 6×4 ft display stall',
        ],
        host: { name: 'Omar Sheikh', email: 'expo@navera.tech', phone: '+91 96543 21098' },
    },
    {
        id: 6,
        name: 'CTF',
        category: 'Cybersecurity',
        date: 'March 27, 2026',
        description: 'Capture the flag — test your hacking, reverse engineering, and security skills in a controlled legal environment.',
        tag: null,
        banner: null,
        location: 'Cyber Lab, Block B',
        teamSize: '1 – 3 members',
        eligibility: [
            'Open to all students with interest in cybersecurity',
            'Teams of 1 to 3 members',
            'No prior CTF experience required — beginner-friendly tracks available',
            'Ethical hacking rules strictly enforced',
        ],
        host: { name: 'Zainab Mirza', email: 'ctf@navera.tech', phone: '+91 95432 10987' },
    },
];

function Sidebar({ setMode, handleLogout, user, activeMode = 'events' }) {
    return (
        <aside className="sidebar">
            <img src={publicUrl('images/navera-logo-transparent.png')} alt="Navera" className="sidebar-logo" />
            <nav className="sidebar-nav">
                <button className="nav-item" onClick={() => setMode('home')}><HomeIcon size={22} />HOME</button>
                <button className={`nav-item ${activeMode === 'events' ? 'active' : ''}`} onClick={() => setMode('events')}><Calendar size={22} />EVENTS</button>
                {user?.email === ADMIN_EMAIL && (
                    <button className="nav-item" onClick={() => setMode('admin')}><ShieldCheck size={22} />ADMIN</button>
                )}
                <span className="sidebar-spacer" />
                <button className="nav-item logout" onClick={user ? handleLogout : () => setMode('login')}>
                    <LogOut size={22} />{user ? 'LOGOUT' : 'LOGIN'}
                </button>
            </nav>
        </aside>
    );
}

function EventDetailView({ event, onBack, setMode, handleLogout, user }) {
    const unstopHref = (event.unstop_link || '').trim();

    return (
        <div className="home-wrapper">
            <div className="home-bg" />
            <Sidebar setMode={setMode} handleLogout={handleLogout} user={user} />

            <main className="page-main">
                <button className="detail-back-btn" onClick={onBack}>
                    <ArrowLeft size={15} /> Back to Events
                </button>

                {/* Banner */}
                <div className="detail-banner">
                    {event.banner && <img src={event.banner} alt={event.name} />}
                    <div className="detail-banner-overlay">
                        <span className="detail-banner-category">{event.category}</span>
                        <h1 className="detail-banner-title">{event.name}</h1>
                        {event.tag && <span className="event-tag" style={{ marginTop: 10 }}>{event.tag}</span>}
                    </div>
                </div>

                {/* Meta strip */}
                <div className="detail-meta-strip">
                    <span className="detail-meta-item"><Calendar size={14} /> {event.date}</span>
                    <span className="detail-meta-item"><MapPin size={14} /> {event.location}</span>
                    <span className="detail-meta-item"><Users size={14} /> {event.teamSize}</span>
                    {event.prize_pool && <span className="detail-meta-item"><Trophy size={14} /> {event.prize_pool}</span>}
                </div>

                {/* Two-column body */}
                <div className="detail-body">
                    <div className="detail-col-main">
                        <section className="detail-section">
                            <h2 className="detail-section-title">About</h2>
                            <p className="detail-section-text">{event.description}</p>
                        </section>

                        <section className="detail-section">
                            <h2 className="detail-section-title">Eligibility Criteria</h2>
                            <ul className="detail-criteria-list">
                                {(Array.isArray(event.eligibility) ? event.eligibility : []).map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </section>
                    </div>

                    <aside className="detail-col-side">
                        <div className="detail-cta-card">
                            {unstopHref && (
                                <a
                                    className="btn btn-primary detail-register-btn"
                                    href={normalizeExternalHref(unstopHref)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Register now on Unstop <ExternalLink size={16} />
                                </a>
                            )}
                            <p className="detail-cta-note">Free entry · Limited seats</p>
                        </div>

                        <div className="detail-contact-card">
                            <h3 className="detail-contact-title">Host Contact</h3>
                            <p className="detail-contact-name">{event.host.name}</p>
                            <a className="detail-contact-link" href={`mailto:${event.host.email}`}>
                                <Mail size={14} /> {event.host.email}
                            </a>
                            <a className="detail-contact-link" href={`tel:${event.host.phone}`}>
                                <Phone size={14} /> {event.host.phone}
                            </a>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}

export default function Events({ setMode, handleLogout, user }) {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            // Prefer admin-defined ordering if available; fallback to created_at.
            const tryOrdered = async () => {
                const res = await supabase
                    .from('events')
                    .select('*')
                    .order('sort_order', { ascending: true, nullsFirst: false })
                    .order('created_at', { ascending: true });
                if (res.error) throw res.error;
                return res.data || [];
            };
            const tryCreatedAt = async () => {
                const res = await supabase.from('events').select('*').order('created_at', { ascending: true });
                if (res.error) throw res.error;
                return res.data || [];
            };

            let data = [];
            try {
                data = await tryOrdered();
            } catch {
                data = await tryCreatedAt();
            }

            setEvents((data || []).map(ev => ({
                ...ev,
                teamSize: ev.team_size,
                host: { name: ev.host_name, email: ev.host_email, phone: ev.host_phone },
            })));
            setLoading(false);
        };
        load();
    }, []);

    if (selectedEvent) {
        return (
            <EventDetailView
                event={selectedEvent}
                onBack={() => setSelectedEvent(null)}
                setMode={setMode}
                handleLogout={handleLogout}
                user={user}
            />
        );
    }

    return (
        <div className="home-wrapper">
            <div className="home-bg" />
            <Sidebar setMode={setMode} handleLogout={handleLogout} user={user} />

            <main className="page-main">
                <div className="page-header">
                    <h1 className="page-title">EVENTS</h1>
                    <p className="page-subtitle">Builder&apos;s Boardroom</p>
                </div>
                {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>}
                {!loading && events.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: 60 }}>No events added yet.</p>}
                <div className="events-grid">
                    {events.map(ev => (
                        <div className="event-card" key={ev.id} onClick={() => setSelectedEvent(ev)}>
                            {ev.tag && <span className="event-tag">{ev.tag}</span>}
                            <p className="event-category">{ev.category}</p>
                            <h2 className="event-name">{ev.name}</h2>
                            <p className="event-desc">{ev.description}</p>
                            <div className="event-footer">
                                <span className="event-date"><Calendar size={14} /> {ev.date}</span>
                                {ev.teamSize && <span className="event-date"><Users size={14} /> {ev.teamSize}</span>}
                            </div>
                            <p className="event-card-cta">View Details →</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
