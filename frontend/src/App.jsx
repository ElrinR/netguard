import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  AlertTriangle,
  Lock,
  Settings,
  LayoutDashboard,
  Search,
  Bell,
  Terminal,
  Cpu,
  Globe,
  Database,
  ArrowRight,
  LogOut,
  UserCheck
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import Login from './Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    syn_floods: 0,
    arp_spoofing: 0,
    total_alerts: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    syn_threshold: 20,
    sensitivity: "Standard",
    syn_enabled: true,
    arp_enabled: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [trafficData, setTrafficData] = useState([
    { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), incoming: 0, outgoing: 0 },
  ]);

  useEffect(() => {
    const fetchInitialSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const settingsData = await response.json();
          setSettings(prev => ({ ...prev, ...settingsData }));
        }
      } catch (error) {
        console.error("Error fetching initial settings:", error);
      }
    };
    fetchInitialSettings();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alertsRes, statsRes] = await Promise.all([
          fetch('/api/alerts'),
          fetch('/api/stats')
        ]);

        if (alertsRes.ok) {
          const alertsData = await alertsRes.json();

          // Bug fix: Correctly calculate unread notifications
          setAlerts(prev => {
            if (prev.length > 0 && alertsData.length > prev.length) {
              const diff = alertsData.length - prev.length;
              setUnreadNotifications(u => u + diff);
            }
            return alertsData;
          });


        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);

          // Update traffic chart with real data
          if (statsData.traffic) {
            const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setTrafficData(prev => {
              const newData = [...prev, {
                time: now,
                incoming: statsData.traffic.incoming,
                outgoing: statsData.traffic.outgoing
              }];
              return newData.slice(-10); // Keep last 10 points
            });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredAlerts = alerts.filter(alert =>
    alert.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (response.ok) {
        setSaveMessage('Configuration saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('Failed to save configuration.');
      }
    } catch {
      setSaveMessage('Error connecting to backend.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">System State</div>
                <div className={`stat-value ${stats.status === 'SECURE' ? 'safe' : (stats.status === 'WARNING' ? 'warning' : 'danger')}`}>
                  {stats.status || 'OFFLINE'}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Blocked</div>
                <div className="stat-value">{stats.total_alerts}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">SYN Floods</div>
                <div className="stat-value danger">{stats.syn_floods}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">ARP Events</div>
                <div className="stat-value danger">{stats.arp_spoofing}</div>
              </div>
            </div>

            <div className="stat-card chart-container" style={{ height: '320px', padding: '2rem', marginBottom: '2rem' }}>
              <div className="section-title">
                <Activity size={18} color="var(--accent-primary)" />
                <span>Live Traffic Intelligence</span>
              </div>
              <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={trafficData}>
                  <defs>
                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-success)" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="var(--accent-success)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                  <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(5, 5, 8, 0.9)', border: '1px solid var(--glass-border)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ fontSize: '0.8rem' }}
                  />
                  <Area type="monotone" dataKey="incoming" stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorIn)" strokeWidth={2} />
                  <Area type="monotone" dataKey="outgoing" stroke="var(--accent-success)" fillOpacity={1} fill="url(#colorOut)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <section className="alerts-section">
              <div className="section-title">
                <Terminal size={18} color="var(--accent-primary)" />
                <span>Live Audit Logs</span>
              </div>
              <table className="alerts-table">
                <thead>
                  <tr>
                    <th>Protocol</th>
                    <th>Intelligence</th>
                    <th>Timestamp</th>
                    <th>Response</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.length > 0 ? (
                    [...filteredAlerts].reverse().slice(0, 10).map((alert, index) => {
                      const isArp = alert.includes('ARP');
                      const parts = alert.split('] ALERT: ');
                      const time = parts[0]?.replace('[', '') || 'Live';
                      const msg = parts[1] || alert;
                      return (
                        <tr key={index} className="alert-item" style={{ animationDelay: `${index * 0.1}s` }}>
                          <td>
                            <span className={`badge ${isArp ? 'badge-warning' : 'badge-danger'}`}>
                              {isArp ? 'ARP Sec' : 'SYN Flo'}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{msg}</td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{time}</td>
                          <td>
                            {alert.includes('ACTION TAKEN') ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-success)', fontSize: '0.75rem', fontWeight: 600 }}>
                                <Shield size={12} />
                                BLOCKED
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-danger)', fontSize: '0.75rem', fontWeight: 600 }}>
                                <AlertTriangle size={12} />
                                DETECTED
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No telemetry data available.</td></tr>
                  )}
                </tbody>
              </table>
            </section>
          </div>
        );

      case 'traffic':
        return (
          <div className="stat-card" style={{ padding: '2.5rem', height: '500px', animation: 'fadeIn 0.5s ease' }}>
            <div className="section-title">
              <Activity size={20} color="var(--accent-primary)" />
              <span>Network Throughput Analysis</span>
            </div>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(5, 5, 8, 0.9)', border: '1px solid var(--glass-border)', borderRadius: '12px' }} />
                <Bar dataKey="incoming" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outgoing" fill="var(--accent-success)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'firewall':
        return (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="section-title">
              <Lock size={20} color="var(--accent-danger)" />
              <span>Active Security Enforcement</span>
            </div>
            <div className="stats-grid">
              <div className="stat-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>SYN Flood Mitigation</span>
                <button
                  onClick={() => setSettings({ ...settings, syn_enabled: !settings.syn_enabled })}
                  style={{ background: settings.syn_enabled ? 'rgba(0, 255, 157, 0.1)' : 'rgba(255, 255, 255, 0.05)', color: settings.syn_enabled ? 'var(--accent-success)' : 'var(--text-secondary)', border: `1px solid ${settings.syn_enabled ? 'var(--accent-success)' : 'var(--glass-border)'}`, padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {settings.syn_enabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
              <div className="stat-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>ARP Spoof Prevention</span>
                <button
                  onClick={() => setSettings({ ...settings, arp_enabled: !settings.arp_enabled })}
                  style={{ background: settings.arp_enabled ? 'rgba(0, 255, 157, 0.1)' : 'rgba(255, 255, 255, 0.05)', color: settings.arp_enabled ? 'var(--accent-success)' : 'var(--text-secondary)', border: `1px solid ${settings.arp_enabled ? 'var(--accent-success)' : 'var(--glass-border)'}`, padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {settings.arp_enabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>
            
            <div style={{ marginTop: '1rem', paddingBottom: '2rem' }}>
              <button onClick={handleSaveSettings} disabled={isSaving} className="login-button" style={{ maxWidth: '250px', marginTop: '0' }}>
                {isSaving ? 'Syncing...' : 'Deploy Firewall Rules'}
              </button>
              {saveMessage && (
                <span style={{ marginLeft: '1.5rem', color: 'var(--accent-primary)', fontSize: '0.85rem' }}>
                  {saveMessage}
                </span>
              )}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div style={{ maxWidth: '600px', animation: 'fadeIn 0.5s ease' }}>
            <div className="stat-card" style={{ padding: '2.5rem' }}>
              <div className="section-title">
                <Settings size={20} color="var(--accent-primary)" />
                <span>Configuration Matrix</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span className="stat-label">Detection Threshold</span>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{settings.syn_threshold} PKTS/M</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={settings.syn_threshold}
                    onChange={(e) => setSettings({ ...settings, syn_threshold: parseInt(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <div className="stat-label" style={{ marginBottom: '1.25rem' }}>Alert Sensitivity</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    {['High', 'Standard', 'Low'].map(level => (
                      <div
                        key={level}
                        className="stat-card"
                        onClick={() => setSettings({ ...settings, sensitivity: level })}
                        style={{
                          textAlign: 'center',
                          padding: '1rem',
                          cursor: 'pointer',
                          background: settings.sensitivity === level ? 'rgba(0, 242, 255, 0.05)' : 'rgba(255,255,255,0.01)',
                          borderColor: settings.sensitivity === level ? 'var(--accent-primary)' : 'var(--glass-border)'
                        }}
                      >
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{level}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                  <button onClick={handleSaveSettings} disabled={isSaving} className="login-button" style={{ marginTop: 0 }}>
                    {isSaving ? 'Syncing...' : 'Update Security Policy'}
                  </button>
                  {saveMessage && (
                    <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', color: 'var(--accent-primary)', fontSize: '0.85rem' }}>
                      {saveMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="logo">
          <Shield size={22} color="var(--accent-primary)" strokeWidth={3} />
          <span>NETGUARD</span>
        </div>
        <nav className="nav-links">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
            { id: 'traffic', icon: Activity, label: 'Analytics' },
            { id: 'firewall', icon: Lock, label: 'Firewall' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map(item => (
            <div
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
          <div className="stat-label" style={{ fontSize: '0.65rem', marginBottom: '0.75rem' }}>Engine Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: stats.sniffer_active ? 'var(--accent-success)' : 'var(--accent-danger)',
              boxShadow: stats.sniffer_active ? '0 0 12px var(--accent-success)' : 'none'
            }}></div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{stats.sniffer_active ? 'Live' : 'Offline'}</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="header" style={{ marginBottom: '4rem' }}>
          <div>
            <h1 style={{ textTransform: 'capitalize', fontSize: '2rem' }}>{activeTab}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              {activeTab === 'dashboard' ? 'Real-time security telemetry' : `System ${activeTab} configurations`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div
              className={`nav-item ${isSearchOpen ? 'active' : ''}`}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              style={{ padding: '0.6rem', background: 'var(--bg-card)', border: '1px solid var(--glass-border)' }}
            >
              <Search size={18} />
            </div>
            <div style={{ position: 'relative' }}>
              <div
                style={{ position: 'relative', cursor: 'pointer', padding: '0.6rem', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setUnreadNotifications(0);
                }}
              >
                <Bell size={20} color={unreadNotifications > 0 ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
                {unreadNotifications > 0 && <span style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--accent-danger)', width: '8px', height: '8px', borderRadius: '50%', border: '2px solid var(--bg-dark)' }}></span>}
              </div>

              {isNotificationsOpen && (
                <div style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '320px',
                  background: 'rgba(10, 10, 15, 0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  zIndex: 1001,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                  animation: 'fadeIn 0.3s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Security Alerts</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', cursor: 'pointer' }} onClick={() => setAlerts([])}>Clear All</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                    {alerts.length > 0 ? (
                      alerts.slice(-5).reverse().map((alert, i) => (
                        <div key={i} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                            <AlertTriangle size={14} color="var(--accent-danger)" style={{ marginTop: '2px' }} />
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', marginBottom: '0.25rem', lineHeight: 1.4 }}>{alert.split('] ALERT: ')[1] || alert}</div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{alert.split(']')[0]?.replace('[', '') || 'Just now'}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        No active threats detected.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div
              style={{ position: 'relative' }}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'linear-gradient(45deg, var(--accent-primary), var(--accent-secondary))' }}></div>
              </div>

              {isProfileOpen && (
                <div style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '260px',
                  background: 'rgba(5, 5, 8, 0.95)',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  zIndex: 1000,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  animation: 'fadeIn 0.3s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <UserCheck size={24} color="var(--accent-primary)" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Administrator</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Operator ID: 00-1B-4C</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Access Level:</span>
                      <span style={{ color: 'var(--accent-danger)', fontWeight: 600 }}>ROOT_CORE</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Session ID:</span>
                      <span style={{ color: 'var(--text-primary)' }}>NG-77421</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Last Sync:</span>
                      <span style={{ color: 'var(--text-primary)' }}>Real-time</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsLoggedIn(false)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(255, 0, 85, 0.1)',
                      border: '1px solid rgba(255, 0, 85, 0.2)',
                      borderRadius: '12px',
                      color: 'var(--accent-danger)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.3s'
                    }}
                  >
                    <LogOut size={16} />
                    Terminate Session
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {isSearchOpen && (
          <div style={{ marginBottom: '3rem', animation: 'fadeIn 0.4s ease' }}>
            <input
              type="text"
              placeholder="Search telemetry logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '20px' }}
              autoFocus
            />
          </div>
        )}

        {renderContent()}
      </main>
    </div>
  );
}

export default App;
