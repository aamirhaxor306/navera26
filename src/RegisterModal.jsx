import { useState, useEffect } from 'react';
import { supabase } from './supabase.js';
import { X, ChevronRight, ChevronLeft, Check, UserPlus, AlertCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';

const EJS_SERVICE  = 'service_517y9u8';
const EJS_TEMPLATE = 'template_2wpd4rr';
const EJS_KEY      = 'ErYufAQoyjlO3qSER';

const REQUIRED_FIELDS = ['full_name', 'phone', 'dob', 'college', 'passout_year', 'emergency_contact'];
const FIELD_LABELS = {
    full_name:         'Full Name',
    phone:             'Phone Number',
    dob:               'Date of Birth',
    college:           'College / University',
    passout_year:      'Passout Year',
    emergency_contact: 'Emergency Contact',
};

function parseMax(teamSize) {
    if (!teamSize || /solo/i.test(teamSize)) return 1;
    const m = teamSize.match(/(\d+)\s*[–\-]\s*(\d+)/);
    if (m) return parseInt(m[2]);
    const s = teamSize.match(/(\d+)/);
    return s ? parseInt(s[1]) : 1;
}

function Overlay({ onClose, children }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box reg-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}><X size={18} /></button>
                {children}
            </div>
        </div>
    );
}

function SummaryRow({ label, value }) {
    return (
        <div className="reg-summary-row">
            <span className="reg-summary-label">{label}</span>
            <span className="reg-summary-value">{value}</span>
        </div>
    );
}

export default function RegisterModal({ event, user, onClose }) {
    const [step, setStep]           = useState(1);
    const [profile, setProfile]     = useState(null);
    const [editProfile, setEditP]   = useState({});
    const [teamName, setTeamName]   = useState('');
    const [teammates, setTeammates] = useState([]);
    const [submitting, setSubmit]   = useState(false);
    const [done, setDone]           = useState(false);
    const [error, setError]         = useState('');
    const [alreadyReg, setAlready]  = useState(false);
    const [profileLoading, setPL]   = useState(true);

    const maxSize  = parseMax(event.teamSize);
    const isSolo   = maxSize === 1;
    const maxMates = maxSize - 1;

    useEffect(() => {
        supabase.from('profiles').select('*').eq('id', user.id).single()
            .then(({ data }) => {
                setProfile(data || {});
                setEditP(data || {});
                setPL(false);
            });
        supabase.from('registrations').select('id')
            .eq('event_id', event.id).eq('user_id', user.id)
            .then(({ data }) => { if (data?.length) setAlready(true); });
    }, []);

    const missingFields = REQUIRED_FIELDS.filter(f => !editProfile[f]?.toString().trim());
    const profileComplete = missingFields.length === 0;

    const addMate = () => {
        if (teammates.length < maxMates)
            setTeammates([...teammates, { name: '', email: '', phone: '' }]);
    };

    const updMate = (i, k, v) => {
        const u = [...teammates];
        u[i][k] = v;
        setTeammates(u);
    };

    const removeMate = i => setTeammates(teammates.filter((_, x) => x !== i));

    const validateStep1 = async () => {
        setError('');
        if (!profileComplete) { setError('Please fill all required fields.'); return; }

        const phoneRe = /^[0-9]{10,15}$/;
        if (!phoneRe.test(editProfile.phone?.replace(/[\s\-\+]/g, ''))) {
            setError('Enter a valid phone number (10–15 digits).');
            return;
        }
        if (!phoneRe.test(editProfile.emergency_contact?.replace(/[\s\-\+]/g, ''))) {
            setError('Enter a valid emergency contact number.');
            return;
        }

        // save profile updates if anything changed
        const changed = REQUIRED_FIELDS.some(f => editProfile[f] !== profile[f]);
        if (changed || !profile.id) {
            const { error: err } = await supabase.from('profiles').upsert({
                id: user.id,
                email: user.email,
                degree_type: editProfile.degree_type || profile?.degree_type,
                ...editProfile,
            });
            if (err) { setError(err.message); return; }
            setProfile({ ...editProfile });
        }

        setStep(isSolo ? 3 : 2);
    };

    const validateStep2 = () => {
        setError('');
        const leaderEmail = user.email.toLowerCase();
        const emails = [leaderEmail];

        for (let i = 0; i < teammates.length; i++) {
            const t = teammates[i];
            if (!t.name.trim())  { setError(`Teammate ${i + 1}: name is required.`);  return; }
            if (!t.email.trim()) { setError(`Teammate ${i + 1}: email is required.`); return; }
            if (!t.phone.trim()) { setError(`Teammate ${i + 1}: phone is required.`); return; }

            const emailLower = t.email.toLowerCase();
            if (emailLower === leaderEmail) {
                setError(`Teammate ${i + 1}: email cannot be same as team leader's email.`);
                return;
            }
            if (emails.includes(emailLower)) {
                setError(`Teammate ${i + 1}: duplicate email — each member must have a unique email.`);
                return;
            }
            emails.push(emailLower);
        }
        setStep(3);
    };

    const submit = async () => {
        setSubmit(true);
        setError('');

        const { error: err } = await supabase.from('registrations').insert({
            event_id:     event.id,
            event_name:   event.name,
            user_id:      user.id,
            team_name:    teamName || editProfile.full_name,
            leader_name:  editProfile.full_name,
            leader_email: user.email,
            leader_phone: editProfile.phone,
            teammates,
        });

        if (err) {
            setError(err.code === '23505' ? 'You are already registered for this event.' : err.message);
            setSubmit(false);
            return;
        }

        const mateList = teammates.length
            ? teammates.map(t => `${t.name} (${t.email}, ${t.phone})`).join('\n')
            : 'Solo participation';

        const sendEmail = (to_email, to_name) =>
            emailjs.send(EJS_SERVICE, EJS_TEMPLATE, {
                to_email, to_name,
                event_name:     event.name,
                event_date:     event.date,
                event_location: event.location,
                team_name:      teamName || editProfile.full_name || '',
                teammates_list: mateList,
            }, EJS_KEY).catch(console.warn);

        await sendEmail(user.email, editProfile.full_name || user.email);
        for (const t of teammates) if (t.email) await sendEmail(t.email, t.name);

        setDone(true);
        setSubmit(false);
    };

    /* ── Already registered ── */
    if (alreadyReg) return (
        <Overlay onClose={onClose}>
            <div className="reg-done">
                <Check size={44} color="var(--accent-light)" />
                <h2>Already Registered</h2>
                <p>You've already registered for <strong>{event.name}</strong>.</p>
                <button className="btn btn-outline" onClick={onClose}>Close</button>
            </div>
        </Overlay>
    );

    /* ── Success ── */
    if (done) return (
        <Overlay onClose={onClose}>
            <div className="reg-done">
                <Check size={44} color="var(--accent-light)" />
                <h2>You're In!</h2>
                <p>Registration confirmed for <strong>{event.name}</strong>.<br />A confirmation email has been sent to you and your teammates.</p>
                <button className="btn btn-primary" onClick={onClose}>Done</button>
            </div>
        </Overlay>
    );

    if (profileLoading) return (
        <Overlay onClose={onClose}>
            <p style={{ color: 'var(--text-secondary)', padding: '40px', textAlign: 'center' }}>Loading your profile…</p>
        </Overlay>
    );

    const stepLabels = isSolo ? ['Your Info', 'Confirm'] : ['Your Info', 'Teammates', 'Confirm'];

    return (
        <Overlay onClose={onClose}>
            <div className="reg-header">
                <h2 className="reg-title">Register — {event.name}</h2>
                <div className="reg-stepper">
                    {stepLabels.map((label, i) => (
                        <span key={i} className={`reg-step-pill ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>
                            {step > i + 1 ? <Check size={11} /> : i + 1} {label}
                        </span>
                    ))}
                </div>
            </div>

            {/* ── Step 1: Your Info ── */}
            {step === 1 && (
                <div className="reg-body">
                    {!profileComplete && (
                        <div className="reg-incomplete-banner">
                            <AlertCircle size={15} />
                            Complete your profile to register — missing: {missingFields.map(f => FIELD_LABELS[f]).join(', ')}
                        </div>
                    )}

                    <div className="reg-info-grid">
                        <div className="reg-field">
                            <label>Email</label>
                            <input className="reg-input readonly" value={user?.email || ''} readOnly />
                        </div>
                        {REQUIRED_FIELDS.map(f => (
                            <div className="reg-field" key={f}>
                                <label>{FIELD_LABELS[f]} <span className="reg-required">*</span></label>
                                {f === 'passout_year' ? (
                                    <select
                                        className="reg-input"
                                        value={editProfile[f] || ''}
                                        onChange={e => setEditP({ ...editProfile, [f]: e.target.value })}
                                    >
                                        <option value="">Select year</option>
                                        {[2024,2025,2026,2027,2028,2029].map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        className="reg-input"
                                        type={f === 'dob' ? 'date' : f === 'phone' || f === 'emergency_contact' ? 'tel' : 'text'}
                                        value={editProfile[f] || ''}
                                        onChange={e => setEditP({ ...editProfile, [f]: e.target.value })}
                                        placeholder={FIELD_LABELS[f]}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {!isSolo && (
                        <div className="reg-field" style={{ marginTop: 8 }}>
                            <label>Team Name <span className="reg-required">*</span></label>
                            <input
                                className="reg-input"
                                value={teamName}
                                onChange={e => setTeamName(e.target.value)}
                                placeholder="Enter your team name"
                            />
                        </div>
                    )}

                    {error && <p className="reg-error"><AlertCircle size={13} /> {error}</p>}

                    <div className="reg-actions">
                        <button className="btn btn-primary" onClick={validateStep1}>
                            {isSolo ? 'Review' : 'Add Teammates'} <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Step 2: Teammates ── */}
            {step === 2 && !isSolo && (
                <div className="reg-body">
                    <p className="reg-hint">
                        Team size: <strong>{event.teamSize}</strong> — add up to {maxMates} teammate{maxMates > 1 ? 's' : ''}.
                        All fields are required.
                    </p>

                    {teammates.map((t, i) => (
                        <div className="reg-mate-block" key={i}>
                            <div className="reg-mate-hdr">
                                <span>Teammate {i + 1}</span>
                                <button className="reg-remove" onClick={() => removeMate(i)}><X size={14} /></button>
                            </div>
                            <div className="reg-info-grid">
                                {[['name','Full Name','text'],['email','Email','email'],['phone','Phone','tel']].map(([k,l,tp]) => (
                                    <div className="reg-field" key={k}>
                                        <label>{l} <span className="reg-required">*</span></label>
                                        <input
                                            type={tp}
                                            className="reg-input"
                                            value={t[k]}
                                            onChange={e => updMate(i, k, e.target.value)}
                                            placeholder={l}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {teammates.length < maxMates && (
                        <button className="reg-add-mate" onClick={addMate}>
                            <UserPlus size={15} /> Add Teammate
                        </button>
                    )}

                    {error && <p className="reg-error"><AlertCircle size={13} /> {error}</p>}

                    <div className="reg-actions">
                        <button className="btn btn-outline" onClick={() => { setError(''); setStep(1); }}><ChevronLeft size={16} /> Back</button>
                        <button className="btn btn-primary" onClick={validateStep2}>Review <ChevronRight size={16} /></button>
                    </div>
                </div>
            )}

            {/* ── Step 3: Confirm ── */}
            {((isSolo && step === 3) || (!isSolo && step === 3)) && (
                <div className="reg-body">
                    <div className="reg-summary">
                        <SummaryRow label="Event"   value={event.name} />
                        <SummaryRow label="Date"    value={event.date} />
                        <SummaryRow label="Venue"   value={event.location} />
                        <SummaryRow label="Leader"  value={`${editProfile.full_name} · ${user?.email}`} />
                        <SummaryRow label="Phone"   value={editProfile.phone} />
                        <SummaryRow label="College" value={editProfile.college} />
                        {!isSolo && teamName && <SummaryRow label="Team" value={teamName} />}
                        {teammates.length > 0 && (
                            <div className="reg-summary-row">
                                <span className="reg-summary-label">Teammates</span>
                                <div className="reg-summary-mates">
                                    {teammates.map((t, i) => (
                                        <span key={i} className="reg-mate-tag">
                                            {t.name} · {t.email} · {t.phone}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {error && <p className="reg-error"><AlertCircle size={13} /> {error}</p>}

                    <div className="reg-actions">
                        <button className="btn btn-outline" onClick={() => { setError(''); setStep(isSolo ? 1 : 2); }}>
                            <ChevronLeft size={16} /> Back
                        </button>
                        <button className="btn btn-primary" onClick={submit} disabled={submitting}>
                            {submitting ? 'Submitting…' : 'Confirm Registration'}
                        </button>
                    </div>
                </div>
            )}
        </Overlay>
    );
}
