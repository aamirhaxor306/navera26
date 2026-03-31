import { useState, useEffect } from 'react';
import { supabase } from './supabase.js';
import { Home as HomeIcon, Calendar, Star, Trophy, LogOut, Users, Plus, Trash2, Edit2, X, Check, ShieldCheck, ClipboardList } from 'lucide-react';

const ADMIN_EMAIL = 'adminssb@naverassb.com';
const isAdminEmail = (email) => (email || '').trim().toLowerCase() === ADMIN_EMAIL;

function Sidebar({ setMode, handleLogout, user, active }) {
    return (
        <aside className="sidebar">
            <img src="/images/navera-logo-transparent.png" alt="Navera" className="sidebar-logo" />
            <nav className="sidebar-nav">
                <button className="nav-item" onClick={() => setMode('home')}><HomeIcon size={22} />HOME</button>
                <button className="nav-item" onClick={() => setMode('events')}><Calendar size={22} />EVENTS</button>
                <button className="nav-item" onClick={() => setMode('sponsors')}><Star size={22} />SPONSORS</button>
                <button className="nav-item" onClick={() => setMode('results')}><Trophy size={22} />RESULTS</button>
                {isAdminEmail(user?.email) && (
                    <button className={`nav-item ${active === 'admin' ? 'active' : ''}`} onClick={() => setMode('admin')}>
                        <ShieldCheck size={22} />ADMIN
                    </button>
                )}
                <span className="sidebar-spacer" />
                <button className="nav-item logout" onClick={handleLogout}><LogOut size={22} />LOGOUT</button>
            </nav>
        </aside>
    );
}

/* ── Reusable modal ── */
function Modal({ title, onClose, children }) {
    return (
        <div className="admin-modal-backdrop" onClick={onClose}>
            <div className="admin-modal" onClick={e => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <h3 className="admin-modal-title">{title}</h3>
                    <button className="admin-modal-close" onClick={onClose}><X size={18} /></button>
                </div>
                {children}
            </div>
        </div>
    );
}

/* ══════════════════════════════
   EVENTS TAB
══════════════════════════════ */
function EventsTab() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const blank = { name: '', category: '', date: '', description: '', tag: '', location: '', team_size: '', eligibility: '', rounds: '', host_name: '', host_email: '', host_phone: '' };
    const [form, setForm] = useState(blank);

    const load = async () => {
        setLoading(true);
        const { data } = await supabase.from('events').select('*').order('created_at');
        setEvents(data || []);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const openAdd = () => { setForm(blank); setEditing(null); setShowForm(true); };
    const openEdit = (ev) => {
        setForm({
            ...ev,
            eligibility: Array.isArray(ev.eligibility) ? ev.eligibility.join('\n') : '',
            rounds: ev.rounds ? ev.rounds.map(r => `${r.label}|${r.title}|${r.detail}`).join('\n') : '',
        });
        setEditing(ev.id);
        setShowForm(true);
    };

    const save = async () => {
        const payload = {
            ...form,
            eligibility: form.eligibility.split('\n').map(s => s.trim()).filter(Boolean),
            rounds: form.rounds.split('\n').filter(Boolean).map(line => {
                const [label, title, ...rest] = line.split('|');
                return { label: label?.trim(), title: title?.trim(), detail: rest.join('|').trim() };
            }),
        };
        if (editing) {
            await supabase.from('events').update(payload).eq('id', editing);
        } else {
            await supabase.from('events').insert(payload);
        }
        setShowForm(false);
        load();
    };

    const del = async (id) => {
        if (!confirm('Delete this event?')) return;
        await supabase.from('events').delete().eq('id', id);
        load();
    };

    return (
        <div className="admin-tab-content">
            <div className="admin-tab-header">
                <h2 className="admin-tab-title">Events</h2>
                <button className="admin-add-btn" onClick={openAdd}><Plus size={16} /> Add Event</button>
            </div>

            {loading ? <p className="admin-loading">Loading...</p> : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr><th>Name</th><th>Category</th><th>Date</th><th>Location</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {events.length === 0 && <tr><td colSpan={5} className="admin-empty">No events yet</td></tr>}
                            {events.map(ev => (
                                <tr key={ev.id}>
                                    <td>{ev.name}</td>
                                    <td>{ev.category}</td>
                                    <td>{ev.date}</td>
                                    <td>{ev.location}</td>
                                    <td className="admin-actions">
                                        <button onClick={() => openEdit(ev)}><Edit2 size={14} /></button>
                                        <button className="del" onClick={() => del(ev.id)}><Trash2 size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showForm && (
                <Modal title={editing ? 'Edit Event' : 'Add Event'} onClose={() => setShowForm(false)}>
                    <div className="admin-form">
                        <div className="admin-form-row">
                            <div className="admin-form-group"><label>Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                            <div className="admin-form-group"><label>Category</label><input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
                        </div>
                        <div className="admin-form-row">
                            <div className="admin-form-group"><label>Date</label><input value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} placeholder="March 25, 2026" /></div>
                            <div className="admin-form-group"><label>Tag (optional)</label><input value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} placeholder="FLAGSHIP" /></div>
                        </div>
                        <div className="admin-form-row">
                            <div className="admin-form-group"><label>Location</label><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
                            <div className="admin-form-group"><label>Team Size</label><input value={form.team_size} onChange={e => setForm({ ...form, team_size: e.target.value })} placeholder="1 – 4 members" /></div>
                        </div>
                        <div className="admin-form-group"><label>Description</label><textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                        <div className="admin-form-group">
                            <label>Eligibility (one per line)</label>
                            <textarea rows={4} value={form.eligibility} onChange={e => setForm({ ...form, eligibility: e.target.value })} placeholder="Open to all students&#10;Max 4 members per team" />
                        </div>
                        <div className="admin-form-group">
                            <label>Rounds (format: Label|Title|Detail, one per line)</label>
                            <textarea rows={4} value={form.rounds} onChange={e => setForm({ ...form, rounds: e.target.value })} placeholder="Round 1|Idea Submission|Submit a 2-page proposal&#10;Round 2|Finals|Top teams pitch on stage" />
                        </div>
                        <div className="admin-form-row">
                            <div className="admin-form-group"><label>Host Name</label><input value={form.host_name} onChange={e => setForm({ ...form, host_name: e.target.value })} /></div>
                            <div className="admin-form-group"><label>Host Email</label><input value={form.host_email} onChange={e => setForm({ ...form, host_email: e.target.value })} /></div>
                        </div>
                        <div className="admin-form-group"><label>Host Phone</label><input value={form.host_phone} onChange={e => setForm({ ...form, host_phone: e.target.value })} /></div>
                        <div className="admin-form-actions">
                            <button className="admin-cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                            <button className="admin-save-btn" onClick={save}><Check size={15} /> Save</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

/* ══════════════════════════════
   SPONSORS TAB
══════════════════════════════ */
function SponsorsTab() {
    const [sponsors, setSponsors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const blank = { name: '', description: '', tier: 'silver' };
    const [form, setForm] = useState(blank);

    const load = async () => {
        setLoading(true);
        const { data } = await supabase.from('sponsors').select('*').order('created_at');
        setSponsors(data || []);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const openAdd = () => { setForm(blank); setEditing(null); setShowForm(true); };
    const openEdit = (s) => { setForm(s); setEditing(s.id); setShowForm(true); };

    const save = async () => {
        if (editing) await supabase.from('sponsors').update(form).eq('id', editing);
        else await supabase.from('sponsors').insert(form);
        setShowForm(false);
        load();
    };

    const del = async (id) => {
        if (!confirm('Delete this sponsor?')) return;
        await supabase.from('sponsors').delete().eq('id', id);
        load();
    };

    return (
        <div className="admin-tab-content">
            <div className="admin-tab-header">
                <h2 className="admin-tab-title">Sponsors</h2>
                <button className="admin-add-btn" onClick={openAdd}><Plus size={16} /> Add Sponsor</button>
            </div>

            {loading ? <p className="admin-loading">Loading...</p> : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr><th>Name</th><th>Tier</th><th>Description</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {sponsors.length === 0 && <tr><td colSpan={4} className="admin-empty">No sponsors yet</td></tr>}
                            {sponsors.map(s => (
                                <tr key={s.id}>
                                    <td>{s.name}</td>
                                    <td><span className={`admin-tier-badge tier-${s.tier}`}>{s.tier}</span></td>
                                    <td>{s.description}</td>
                                    <td className="admin-actions">
                                        <button onClick={() => openEdit(s)}><Edit2 size={14} /></button>
                                        <button className="del" onClick={() => del(s.id)}><Trash2 size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showForm && (
                <Modal title={editing ? 'Edit Sponsor' : 'Add Sponsor'} onClose={() => setShowForm(false)}>
                    <div className="admin-form">
                        <div className="admin-form-row">
                            <div className="admin-form-group"><label>Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                            <div className="admin-form-group">
                                <label>Tier</label>
                                <select value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })}>
                                    <option value="title">Title</option>
                                    <option value="gold">Gold</option>
                                    <option value="silver">Silver</option>
                                </select>
                            </div>
                        </div>
                        <div className="admin-form-group"><label>Description</label><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                        <div className="admin-form-actions">
                            <button className="admin-cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                            <button className="admin-save-btn" onClick={save}><Check size={15} /> Save</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

/* ══════════════════════════════
   RESULTS TAB
══════════════════════════════ */
function ResultsTab() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const blank = { event_name: '', place: 1, team_name: '', members: '' };
    const [form, setForm] = useState(blank);

    const load = async () => {
        setLoading(true);
        const { data } = await supabase.from('results').select('*').order('event_name').order('place');
        setResults(data || []);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const openAdd = () => { setForm(blank); setEditing(null); setShowForm(true); };
    const openEdit = (r) => { setForm(r); setEditing(r.id); setShowForm(true); };

    const save = async () => {
        if (editing) await supabase.from('results').update(form).eq('id', editing);
        else await supabase.from('results').insert(form);
        setShowForm(false);
        load();
    };

    const del = async (id) => {
        if (!confirm('Delete this result?')) return;
        await supabase.from('results').delete().eq('id', id);
        load();
    };

    const placeLabel = (p) => p === 1 ? '🥇 1st' : p === 2 ? '🥈 2nd' : '🥉 3rd';

    return (
        <div className="admin-tab-content">
            <div className="admin-tab-header">
                <h2 className="admin-tab-title">Results</h2>
                <button className="admin-add-btn" onClick={openAdd}><Plus size={16} /> Add Result</button>
            </div>

            {loading ? <p className="admin-loading">Loading...</p> : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr><th>Event</th><th>Place</th><th>Team</th><th>Members</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {results.length === 0 && <tr><td colSpan={5} className="admin-empty">No results yet</td></tr>}
                            {results.map(r => (
                                <tr key={r.id}>
                                    <td>{r.event_name}</td>
                                    <td>{placeLabel(r.place)}</td>
                                    <td>{r.team_name}</td>
                                    <td>{r.members}</td>
                                    <td className="admin-actions">
                                        <button onClick={() => openEdit(r)}><Edit2 size={14} /></button>
                                        <button className="del" onClick={() => del(r.id)}><Trash2 size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showForm && (
                <Modal title={editing ? 'Edit Result' : 'Add Result'} onClose={() => setShowForm(false)}>
                    <div className="admin-form">
                        <div className="admin-form-row">
                            <div className="admin-form-group"><label>Event Name</label><input value={form.event_name} onChange={e => setForm({ ...form, event_name: e.target.value })} /></div>
                            <div className="admin-form-group">
                                <label>Place</label>
                                <select value={form.place} onChange={e => setForm({ ...form, place: parseInt(e.target.value) })}>
                                    <option value={1}>1st</option>
                                    <option value={2}>2nd</option>
                                    <option value={3}>3rd</option>
                                </select>
                            </div>
                        </div>
                        <div className="admin-form-row">
                            <div className="admin-form-group"><label>Team Name</label><input value={form.team_name} onChange={e => setForm({ ...form, team_name: e.target.value })} /></div>
                            <div className="admin-form-group"><label>Members</label><input value={form.members} onChange={e => setForm({ ...form, members: e.target.value })} placeholder="Ali, Sara, Raza" /></div>
                        </div>
                        <div className="admin-form-actions">
                            <button className="admin-cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                            <button className="admin-save-btn" onClick={save}><Check size={15} /> Save</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

/* ══════════════════════════════
   PARTICIPANTS TAB
══════════════════════════════ */
function ParticipantsTab() {
    const [rows, setRows]         = useState([]);
    const [loading, setLoading]   = useState(true);
    const [search, setSearch]     = useState('');
    const [eventFilter, setEvent] = useState('');
    const [degFilter, setDeg]     = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            // fetch registrations + profiles in parallel
            const [{ data: regs }, { data: profiles }] = await Promise.all([
                supabase.from('registrations').select('*').order('registered_at', { ascending: false }),
                supabase.from('profiles').select('*'),
            ]);
            const profileMap = {};
            (profiles || []).forEach(p => { profileMap[p.id] = p; });

            // one row per registered participant (leader + expand teammates)
            const flat = [];
            (regs || []).forEach(r => {
                const profile = profileMap[r.user_id] || {};
                // leader row
                flat.push({
                    event:     r.event_name,
                    team:      r.team_name || '—',
                    role:      'Leader',
                    name:      r.leader_name || profile.full_name || '—',
                    email:     r.leader_email || '—',
                    phone:     r.leader_phone || profile.phone || '—',
                    college:   profile.college || '—',
                    degree:    profile.degree_type || '—',
                    passout:   profile.passout_year || '—',
                    reg_id:    r.id,
                });
                // teammate rows
                (r.teammates || []).forEach((t, i) => {
                    flat.push({
                        event:   r.event_name,
                        team:    r.team_name || '—',
                        role:    `Teammate ${i + 1}`,
                        name:    t.name || '—',
                        email:   t.email || '—',
                        phone:   t.phone || '—',
                        college: '—',
                        degree:  '—',
                        passout: '—',
                        reg_id:  r.id,
                    });
                });
            });
            setRows(flat);
            setLoading(false);
        };
        load();
    }, []);

    const events  = [...new Set(rows.map(r => r.event))].filter(Boolean);
    const degrees = [...new Set(rows.map(r => r.degree))].filter(d => d !== '—');

    const filtered = rows.filter(r => {
        if (eventFilter && r.event !== eventFilter) return false;
        if (degFilter   && r.degree !== degFilter)  return false;
        if (search) {
            const q = search.toLowerCase();
            if (![r.name, r.email, r.college, r.phone, r.team].some(v => v?.toLowerCase().includes(q))) return false;
        }
        return true;
    });

    const exportCSV = () => {
        const headers = ['Event', 'Team', 'Role', 'Name', 'Email', 'Phone', 'College', 'Degree', 'Passout Year'];
        const csvRows = [
            headers.join(','),
            ...filtered.map(r => [
                r.event, r.team, r.role, r.name, r.email, r.phone, r.college, r.degree, r.passout
            ].map(v => `"${(v || '').replace(/"/g, '""')}"`).join(',')),
        ];
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `navera26-participants${eventFilter ? `-${eventFilter}` : ''}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="admin-tab-content">
            <div className="admin-tab-header" style={{ flexWrap: 'wrap', gap: 10 }}>
                <h2 className="admin-tab-title">
                    Participants <span className="admin-count">{filtered.length}</span>
                </h2>
                <div className="admin-filters">
                    <input
                        className="admin-search"
                        placeholder="Search name, email, college…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <select className="admin-filter-select" value={eventFilter} onChange={e => setEvent(e.target.value)}>
                        <option value="">All Events</option>
                        {events.map(ev => <option key={ev} value={ev}>{ev}</option>)}
                    </select>
                    <select className="admin-filter-select" value={degFilter} onChange={e => setDeg(e.target.value)}>
                        <option value="">All Degrees</option>
                        {degrees.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <button className="admin-export-btn" onClick={exportCSV}>
                        ↓ Export CSV
                    </button>
                </div>
            </div>

            {loading ? <p className="admin-loading">Loading...</p> : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Event</th><th>Team</th><th>Role</th><th>Name</th>
                                <th>Email</th><th>Phone</th><th>College</th><th>Degree</th><th>Passout</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 && (
                                <tr><td colSpan={9} className="admin-empty">No participants found</td></tr>
                            )}
                            {filtered.map((p, i) => (
                                <tr key={`${p.reg_id}-${i}`}>
                                    <td>{p.event}</td>
                                    <td>{p.team}</td>
                                    <td>
                                        <span className={`admin-role-badge ${p.role === 'Leader' ? 'role-leader' : 'role-mate'}`}>
                                            {p.role}
                                        </span>
                                    </td>
                                    <td>{p.name}</td>
                                    <td>{p.email}</td>
                                    <td>{p.phone}</td>
                                    <td>{p.college}</td>
                                    <td>{p.degree}</td>
                                    <td>{p.passout}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════
   REGISTRATIONS TAB
══════════════════════════════ */
function RegistrationsTab() {
    const [grouped, setGrouped] = useState({});
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({});
    const [search, setSearch] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('registrations')
                .select('*')
                .order('registered_at', { ascending: false });
            const g = {};
            (data || []).forEach(r => {
                if (!g[r.event_name]) g[r.event_name] = [];
                g[r.event_name].push(r);
            });
            setGrouped(g);
            // expand all by default
            const exp = {};
            Object.keys(g).forEach(k => exp[k] = true);
            setExpanded(exp);
            setLoading(false);
        };
        load();
    }, []);

    const toggle = name => setExpanded(e => ({ ...e, [name]: !e[name] }));

    const totalCount = Object.values(grouped).reduce((s, a) => s + a.length, 0);

    const matchSearch = r => {
        if (!search) return true;
        const q = search.toLowerCase();
        return [r.leader_name, r.leader_email, r.team_name].some(v => v?.toLowerCase().includes(q)) ||
            (r.teammates || []).some(t => t.name?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q));
    };

    return (
        <div className="admin-tab-content">
            <div className="admin-tab-header">
                <h2 className="admin-tab-title">Registrations <span className="admin-count">{totalCount}</span></h2>
                <input className="admin-search" placeholder="Search name, email, team…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {loading ? <p className="admin-loading">Loading...</p> : (
                Object.keys(grouped).length === 0
                    ? <p className="admin-empty" style={{ padding: '40px 0', textAlign: 'center' }}>No registrations yet.</p>
                    : Object.entries(grouped).map(([eventName, regs]) => {
                        const filtered = regs.filter(matchSearch);
                        if (filtered.length === 0) return null;
                        return (
                            <div className="admin-reg-group" key={eventName}>
                                <button className="admin-reg-group-hdr" onClick={() => toggle(eventName)}>
                                    <span>{eventName}</span>
                                    <span className="admin-reg-count">{regs.length} registered</span>
                                    <span className="admin-reg-toggle">{expanded[eventName] ? '▲' : '▼'}</span>
                                </button>
                                {expanded[eventName] && (
                                    <div className="admin-table-wrap">
                                        <table className="admin-table">
                                            <thead>
                                                <tr><th>Team / Name</th><th>Leader Email</th><th>Phone</th><th>Teammates</th><th>Registered At</th></tr>
                                            </thead>
                                            <tbody>
                                                {filtered.map(r => (
                                                    <tr key={r.id}>
                                                        <td>{r.team_name || r.leader_name}</td>
                                                        <td>{r.leader_email}</td>
                                                        <td>{r.leader_phone || '—'}</td>
                                                        <td>
                                                            {r.teammates?.length
                                                                ? r.teammates.map((t, i) => (
                                                                    <div key={i} className="admin-reg-mate">
                                                                        {t.name} · {t.email}
                                                                    </div>
                                                                ))
                                                                : <span style={{ color: 'var(--text-secondary)' }}>Solo</span>}
                                                        </td>
                                                        <td style={{ whiteSpace: 'nowrap' }}>
                                                            {new Date(r.registered_at).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        );
                    })
            )}
        </div>
    );
}

/* ══════════════════════════════
   MAIN ADMIN PAGE
══════════════════════════════ */
export default function Admin({ setMode, handleLogout, user }) {
    const [tab, setTab] = useState('events');
    const tabs = [
        { key: 'events',        label: 'Events',        icon: <Calendar size={15} /> },
        { key: 'sponsors',      label: 'Sponsors',      icon: <Star size={15} /> },
        { key: 'results',       label: 'Results',       icon: <Trophy size={15} /> },
        { key: 'registrations', label: 'Registrations', icon: <ClipboardList size={15} /> },
        { key: 'participants',  label: 'Participants',  icon: <Users size={15} /> },
    ];

    return (
        <div className="home-wrapper">
            <div className="home-bg" />
            <Sidebar setMode={setMode} handleLogout={handleLogout} user={user} active="admin" />

            <main className="page-main">
                <div className="admin-header">
                    <div>
                        <h1 className="page-title">ADMIN PANEL</h1>
                        <p className="page-subtitle">Manage events, sponsors, results and participants</p>
                    </div>
                </div>

                <div className="admin-tabs">
                    {tabs.map(t => (
                        <button key={t.key} className={`admin-tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {tab === 'events'        && <EventsTab />}
                {tab === 'sponsors'     && <SponsorsTab />}
                {tab === 'results'      && <ResultsTab />}
                {tab === 'registrations'&& <RegistrationsTab />}
                {tab === 'participants' && <ParticipantsTab />}
            </main>
        </div>
    );
}
