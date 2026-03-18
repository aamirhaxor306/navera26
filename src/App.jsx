import { useState, useEffect } from 'react';
import { supabase } from './supabase.js';
import Home from './Home.jsx';
import Events from './Events.jsx';
import Sponsors from './Sponsors.jsx';
import Results from './Results.jsx';
import Login from './Login.jsx';
import Admin from './Admin.jsx';

const ADMIN_EMAIL = 'adminssb@naverassb.com';

export default function App() {
    const [mode, setMode] = useState('home');
    const [user, setUser] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) setUser(session.user);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setMode('home');
    };

    const props = { setMode, handleLogout, user, isAdmin: user?.email === ADMIN_EMAIL };

    switch (mode) {
        case 'login':    return <Login    setMode={setMode} setUser={setUser} />;
        case 'events':   return <Events   {...props} />;
        case 'sponsors': return <Sponsors {...props} />;
        case 'results':  return <Results  {...props} />;
        case 'admin':    return user?.email === ADMIN_EMAIL ? <Admin {...props} /> : <Home {...props} />;
        default:         return <Home     {...props} />;
    }
}
