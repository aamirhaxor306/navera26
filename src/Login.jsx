import { useState } from 'react';
import { supabase } from './supabase.js';
import { ChevronRight, ChevronLeft, GraduationCap, BookOpen, Mail } from 'lucide-react';

const ADMIN_EMAIL = 'adminssb@naverassb.com';

export default function Login({ setMode, setUser }) {
    const [step, setStep] = useState('degree');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [signedUpUser, setSignedUpUser] = useState(null);
    const [degree, setDegree] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [profile, setProfile] = useState({
        full_name: '',
        phone: '',
        dob: '',
        college: '',
        passout_year: '',
        emergency_contact: '',
    });

    const handleDegreeSelect = (type) => {
        setDegree(type);
        setStep('auth');
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const normalizedEmail = email.trim().toLowerCase();
        const shouldForceSignIn = normalizedEmail === ADMIN_EMAIL;
        const doSignUp = isSignUp && !shouldForceSignIn;

        if (doSignUp) {
            const { data, error: err } = await supabase.auth.signUp({ email: normalizedEmail, password });
            if (err) { setError(err.message); setLoading(false); return; }
            setSignedUpUser(data.user);
            setStep('otp');
        } else {
            const { data, error: err } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
            if (err) { setError(err.message); setLoading(false); return; }
            setUser(data.user);
            setMode('home');
        }
        setLoading(false);
    };

    const handleOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { data, error: err } = await supabase.auth.verifyOtp({
            email,
            token: otp.trim(),
            type: 'signup',
        });

        if (err) { setError('Invalid OTP. Please check your email and try again.'); setLoading(false); return; }

        setSignedUpUser(data.user);
        setStep('profile');
        setLoading(false);
    };

    const handleProfile = async (e) => {
        e.preventDefault();
        setError('');

        const phoneRegex = /^[0-9]{10,15}$/;
        if (!phoneRegex.test(profile.phone.replace(/[\s\-\+]/g, ''))) {
            setError('Enter a valid phone number.');
            return;
        }
        if (!phoneRegex.test(profile.emergency_contact.replace(/[\s\-\+]/g, ''))) {
            setError('Enter a valid emergency contact number.');
            return;
        }

        setLoading(true);

        const { data: { user: currentUser } } = await supabase.auth.getUser();
        const user = currentUser || signedUpUser;

        const { error: err } = await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email,
            degree_type: degree,
            ...profile,
        });

        if (err) { setError(err.message); setLoading(false); return; }

        setUser(user);
        setMode('home');
        setLoading(false);
    };

    return (
        <div className="home-wrapper">
            <div className="home-bg" />

            <div className="login-center">
                <div className="login-card">
                    <img src="/images/navera-logo-transparent.png" alt="Navera" className="login-logo" />

                    {/* ── Step 1: Degree ── */}
                    {step === 'degree' && (
                        <div className="login-step">
                            <h2 className="login-title">Welcome to Navera '26</h2>
                            <p className="login-sub">What are you currently pursuing?</p>
                            <div className="degree-options">
                                <button className="degree-btn" onClick={() => handleDegreeSelect('undergraduate')}>
                                    <BookOpen size={28} />
                                    <span className="degree-label">Undergraduate</span>
                                    <span className="degree-desc">Bachelor's program</span>
                                </button>
                                <button className="degree-btn" onClick={() => handleDegreeSelect('postgraduate')}>
                                    <GraduationCap size={28} />
                                    <span className="degree-label">Postgraduate</span>
                                    <span className="degree-desc">Master's / PhD</span>
                                </button>
                            </div>
                            <button className="login-back-link" onClick={() => setMode('home')}>
                                Back to Home
                            </button>
                        </div>
                    )}

                    {/* ── Step 2: Auth ── */}
                    {step === 'auth' && (
                        <div className="login-step">
                            <button className="back-btn" onClick={() => setStep('degree')}>
                                <ChevronLeft size={16} /> Back
                            </button>
                            <h2 className="login-title">{isSignUp ? 'Create Account' : 'Sign In'}</h2>
                            <p className="login-sub">
                                {degree === 'undergraduate' ? 'Undergraduate' : 'Postgraduate'} · {isSignUp ? 'New participant' : 'Welcome back'}
                            </p>
                            <form className="login-form" onSubmit={handleAuth}>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="yourname@college.edu"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        placeholder="Min. 6 characters"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                {error && <p className="login-error">{error}</p>}
                                <button className="btn btn-primary login-submit" type="submit" disabled={loading}>
                                    {loading ? 'Please wait...' : isSignUp ? 'Continue' : 'Sign In'} {!loading && <ChevronRight size={16} />}
                                </button>
                            </form>
                            <p className="login-toggle">
                                {isSignUp ? 'Already registered?' : "Don't have an account?"}
                                <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }}>
                                    {isSignUp ? ' Sign In' : ' Sign Up'}
                                </button>
                            </p>
                        </div>
                    )}

                    {/* ── Step 3: OTP ── */}
                    {step === 'otp' && (
                        <div className="login-step">
                            <div className="otp-icon"><Mail size={36} /></div>
                            <h2 className="login-title">Verify Your Email</h2>
                            <p className="login-sub">We sent a 6-digit code to<br /><strong>{email}</strong></p>
                            <form className="login-form" onSubmit={handleOtp}>
                                <div className="form-group">
                                    <label>Enter OTP</label>
                                    <input
                                        type="text"
                                        placeholder="Enter OTP code"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                        maxLength={8}
                                        required
                                        className="otp-input"
                                    />
                                </div>
                                {error && <p className="login-error">{error}</p>}
                                <button className="btn btn-primary login-submit" type="submit" disabled={loading}>
                                    {loading ? 'Verifying...' : 'Verify & Continue'} {!loading && <ChevronRight size={16} />}
                                </button>
                            </form>
                            <p className="login-toggle">
                                Didn't receive it?
                                <button onClick={async () => {
                                    await supabase.auth.resend({ type: 'signup', email });
                                    setError('');
                                }}> Resend code</button>
                            </p>
                        </div>
                    )}

                    {/* ── Step 4: Profile ── */}
                    {step === 'profile' && (
                        <div className="login-step">
                            <h2 className="login-title">Complete Your Profile</h2>
                            <p className="login-sub">Tell us a bit more about yourself</p>
                            <form className="login-form" onSubmit={handleProfile}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            placeholder="Your full name"
                                            value={profile.full_name}
                                            onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            placeholder="+91 XXXXX XXXXX"
                                            value={profile.phone}
                                            onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Date of Birth</label>
                                        <input
                                            type="date"
                                            value={profile.dob}
                                            onChange={e => setProfile({ ...profile, dob: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Passout Year</label>
                                        <select
                                            value={profile.passout_year}
                                            onChange={e => setProfile({ ...profile, passout_year: e.target.value })}
                                            required
                                        >
                                            <option value="">Select year</option>
                                            {[2024, 2025, 2026, 2027, 2028, 2029].map(y => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>College / University</label>
                                    <input
                                        type="text"
                                        placeholder="Name of your institution"
                                        value={profile.college}
                                        onChange={e => setProfile({ ...profile, college: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Emergency Contact</label>
                                    <input
                                        type="tel"
                                        placeholder="Parent / Guardian number"
                                        value={profile.emergency_contact}
                                        onChange={e => setProfile({ ...profile, emergency_contact: e.target.value })}
                                        required
                                    />
                                </div>
                                {error && <p className="login-error">{error}</p>}
                                <button className="btn btn-primary login-submit" type="submit" disabled={loading}>
                                    {loading ? 'Saving...' : 'Complete Registration'} {!loading && <ChevronRight size={16} />}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
