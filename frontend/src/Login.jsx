import React, { useState, useEffect } from 'react';
import { Shield, Lock, User, Mail, ArrowRight, UserPlus, LogIn } from 'lucide-react';

function Login({ onLogin }) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Auto-clear error/success messages
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError('');
                setSuccess('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (isSignUp) {
            // Signup Logic
            if (password !== confirmPassword) {
                setError('Passwords do not match.');
                return;
            }

            const users = JSON.parse(localStorage.getItem('netguard_users') || '[]');
            if (users.find(u => u.username === username)) {
                setError('Operator ID already exists in the registry.');
                return;
            }

            const newUser = { username, email, password };
            localStorage.setItem('netguard_users', JSON.stringify([...users, newUser]));

            setSuccess('Account registered successfully! Please login.');
            setIsSignUp(false);
            setPassword('');
            setConfirmPassword('');
        } else {
            // Login Logic
            // Fixed admin login
            if (username === 'admin' && password === 'admin') {
                onLogin();
                return;
            }

            // Check registered users
            const users = JSON.parse(localStorage.getItem('netguard_users') || '[]');
            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                onLogin();
            } else {
                setError('Access Denied: Invalid Operator ID or Security Key.');
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-background-glow"></div>

            <div className="login-card">
                <div className="logo" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
                    <Shield size={36} color="var(--accent-primary)" strokeWidth={3} />
                    <span style={{ fontSize: '1.25rem', letterSpacing: '4px' }}>NETGUARD</span>
                </div>

                <h1 className="login-title" style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px' }}>{isSignUp ? 'New Operator' : 'Terminal Access'}</h1>
                <p className="login-subtitle" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {isSignUp ? 'Register a new identity in the security registry' : 'Authentication required to proceed'}
                </p>

                <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
                    <div className="form-group">
                        <label htmlFor="username" style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.65rem', marginBottom: '0.75rem', display: 'block' }}>Operator ID</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                id="username"
                                type="text"
                                className="form-input"
                                placeholder="operator_name"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{ paddingLeft: '3rem', borderRadius: '14px', background: 'rgba(255,255,255,0.02)' }}
                                required
                            />
                        </div>
                    </div>

                    {isSignUp && (
                        <div className="form-group">
                            <label htmlFor="email" style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.65rem', marginBottom: '0.75rem', display: 'block' }}>Registry Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    id="email"
                                    type="email"
                                    className="form-input"
                                    placeholder="name@netguard.io"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ paddingLeft: '3rem', borderRadius: '14px', background: 'rgba(255,255,255,0.02)' }}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="password" style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.65rem', marginBottom: '0.75rem', display: 'block' }}>Security Key</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                id="password"
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ paddingLeft: '3rem', borderRadius: '14px', background: 'rgba(255,255,255,0.02)' }}
                                required
                            />
                        </div>
                    </div>

                    {isSignUp && (
                        <div className="form-group">
                            <label htmlFor="confirmPassword" style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.65rem', marginBottom: '0.75rem', display: 'block' }}>Verify Key</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={{ paddingLeft: '3rem', borderRadius: '14px', background: 'rgba(255,255,255,0.02)' }}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <button type="submit" className="login-button" style={{ borderRadius: '14px', height: '52px', marginTop: '1rem' }}>
                        {isSignUp ? (
                            <>Register Identity <UserPlus size={18} /></>
                        ) : (
                            <>Initialize Access <ArrowRight size={18} /></>
                        )}
                    </button>

                    {error && <div className="error-message" style={{ borderRadius: '12px', marginTop: '1.5rem', fontSize: '0.8rem' }}>{error}</div>}
                    {success && <div className="error-message" style={{ borderRadius: '12px', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--accent-success)', background: 'rgba(0, 255, 157, 0.05)', border: '1px solid rgba(0, 255, 157, 0.1)' }}>{success}</div>}
                </form>

                <div style={{ marginTop: '2rem' }}>
                    <button
                        type="button"
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError('');
                            setSuccess('');
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-primary)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            margin: '0 auto',
                            opacity: 0.7,
                            transition: 'all 0.3s'
                        }}
                    >
                        {isSignUp ? (
                            <><LogIn size={16} /> SIGN IN TO TERMINAL</>
                        ) : (
                            <><UserPlus size={16} /> REGISTER NEW OPERATOR</>
                        )}
                    </button>
                </div>

                <div style={{ marginTop: '3rem', fontSize: '0.6rem', color: 'var(--text-secondary)', letterSpacing: '2px', opacity: 0.5 }}>
                    SECURE PROTOCOL v2.5.0 // ENCRYPTED SESSION
                </div>
            </div>
        </div>
    );
}

export default Login;
