import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProfileModal from './ProfileModal';
import Modal from './Modal';

export default function Navbar({ title, subtitle }) {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMsgSubject, setNewMsgSubject] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [newMsgTarget, setNewMsgTarget] = useState('all');
  const [newMsgPriority, setNewMsgPriority] = useState('normal');
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [newMsgSent, setNewMsgSent] = useState(false);
  const [msgError, setMsgError] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Shift punch registered', time: 'Today', unread: true },
    { id: 2, title: 'Corporate policy notice published', time: 'Yesterday', unread: true },
    { id: 3, title: 'Quarterly review scheduled', time: '2 days ago', unread: false }
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await axios.get('/api/announcements');
      if (res.data.success) setMessages(res.data.announcements);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchMessages(); }, [showEmailModal]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await axios.get(`/api/employees?search=${encodeURIComponent(searchQuery)}`);
        if (res.data.success) setSearchResults(res.data.employees.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const formatDate = (d) => {
    return d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'short' });
  };

  const formatTime = (d) => d.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });

  const handleLogout = () => { logout(); navigate('/auth'); };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsgSubject.trim() || !newMessageText.trim()) return;
    try {
      setIsSendingMsg(true);
      setMsgError('');
      const res = await axios.post('/api/announcements', {
        title: newMsgSubject.trim(),
        content: newMessageText.trim(),
        category: 'Mail',
        targetRole: newMsgTarget,
        priority: newMsgPriority
      });
      if (res.data.success) {
        setNewMsgSubject(''); setNewMessageText(''); setNewMsgTarget('all'); setNewMsgPriority('normal');
        setNewMsgSent(true);
        setTimeout(() => setNewMsgSent(false), 3000);
        await fetchMessages();
      }
    } catch (err) {
      setMsgError(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setIsSendingMsg(false);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await axios.delete(`/api/announcements/${id}`);
      await fetchMessages();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete.');
    }
  };

  const markAllRead = () => setNotifications(notifications.map(n => ({ ...n, unread: false })));

  const firstName = user?.name ? user.name.split(' ')[0] : 'User';

  return (
    <>
      <header style={{
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #ECEFF8',
        padding: '12px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div>
            <div style={{
              fontSize: '18px',
              fontWeight: '800',
              color: '#1E1B4B',
              letterSpacing: '-0.4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              Hi, {firstName} <span style={{ display: 'inline-block', animation: 'wave 2s infinite' }}>👋</span>
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '1px' }}>
              What would you like to do today?
            </div>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#F5F6FF',
              border: '1.5px solid #E0E7FF',
              borderRadius: '100px',
              padding: '6px 14px',
              transition: 'all 0.2s ease'
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.5" style={{ marginRight: '8px', flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '12.5px',
                  color: '#1E1B4B',
                  fontFamily: 'inherit'
                }}
              />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" style={{ cursor: 'pointer', flexShrink: 0 }}>
                <line x1="4" y1="21" x2="4" y2="14"/>
                <line x1="4" y1="10" x2="4" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12" y2="3"/>
                <line x1="20" y1="21" x2="20" y2="16"/>
                <line x1="20" y1="12" x2="20" y2="3"/>
                <line x1="1" y1="14" x2="7" y2="14"/>
                <line x1="9" y1="8" x2="15" y2="8"/>
                <line x1="17" y1="16" x2="23" y2="16"/>
              </svg>
            </div>

            {searchQuery.trim() && (
              <div style={{
                position: 'absolute',
                top: '42px',
                left: 0,
                right: 0,
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                boxShadow: '0 12px 36px rgba(99, 102, 241, 0.16)',
                zIndex: 200,
                maxHeight: '260px',
                overflowY: 'auto',
                border: '1px solid #E0E7FF'
              }}>
                {isSearching ? (
                  <div style={{ padding: '14px', fontSize: '12px', color: '#6B7280', textAlign: 'center' }}>Searching employees...</div>
                ) : searchResults.length === 0 ? (
                  <div style={{ padding: '14px', fontSize: '12px', color: '#6B7280', textAlign: 'center' }}>No matching employees</div>
                ) : (
                  searchResults.map(emp => (
                    <div
                      key={emp._id}
                      onClick={() => {
                        setSearchQuery('');
                        navigate(user?.role === 'hr' ? '/hr/employees' : user?.role === 'manager' ? '/manager/team' : '/employee/profile');
                      }}
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid #F3F4F6',
                        cursor: 'pointer',
                        fontSize: '13px',
                        color: '#1E1B4B',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#EEF2FF'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <strong style={{ display: 'block' }}>{emp.firstName} {emp.lastName}</strong>
                      <span style={{ fontSize: '11px', color: '#6366F1' }}>{emp.department} • {emp.position}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowEmailModal(true)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: '#EEF2FF',
              border: '1px solid #C7D2FE',
              color: '#6366F1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s ease'
            }}
            title={t('messagesTitle')}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(99,102,241,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            {messages.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#EF4444',
                border: '2px solid #FFFFFF'
              }}/>
            )}
          </button>

          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: '#EEF2FF',
              border: '1px solid #C7D2FE',
              color: '#6366F1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s ease'
            }}
            title={t('notificationsTitle')}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(99,102,241,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {notifications.some(n => n.unread) && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#EF4444',
                border: '2px solid #FFFFFF'
              }}/>
            )}
          </button>

          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            style={{
              backgroundColor: '#EEF2FF',
              color: '#6366F1',
              border: '1px solid #C7D2FE',
              borderRadius: '100px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              outline: 'none',
              fontWeight: '700'
            }}
          >
            <option value="en">EN</option>
            <option value="hi">हिंदी</option>
          </select>

          <div style={{
            fontSize: '12px',
            color: '#6366F1',
            background: '#F5F6FF',
            padding: '6px 14px',
            borderRadius: '100px',
            border: '1px solid #E0E7FF',
            fontWeight: '600'
          }}>
            {formatDate(currentTime)} • {formatTime(currentTime)}
          </div>

          <div
            onClick={() => setShowProfileModal(true)}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '3px',
              borderRadius: '50%',
              border: '2px solid #C7D2FE',
              transition: 'all 0.2s ease'
            }}
            title={t('profile')}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#6366F1'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#C7D2FE'}
          >
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366F1&color=fff&size=60`}
              alt="Profile"
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
            />
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: '#F3F4F6',
              border: '1px solid #E5E7EB',
              color: '#4B5563',
              padding: '6px 12px',
              borderRadius: '100px',
              fontSize: '11.5px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.18s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1E1B4B'; e.currentTarget.style.color = '#FFFFFF'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#4B5563'; }}
          >
            {t('signOut')}
          </button>
        </div>

        {showNotifDropdown && (
          <div style={{
            position: 'absolute',
            top: '64px',
            right: '180px',
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            boxShadow: '0 16px 40px rgba(99, 102, 241, 0.18)',
            width: '320px',
            zIndex: 250,
            border: '1px solid #E0E7FF',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8F9FE' }}>
              <strong style={{ fontSize: '13.5px', color: '#1E1B4B' }}>{t('notificationsTitle')}</strong>
              <button
                onClick={markAllRead}
                style={{ background: 'none', border: 'none', color: '#6366F1', fontSize: '11.5px', cursor: 'pointer', fontWeight: '700', padding: 0 }}
              >
                Mark all read
              </button>
            </div>
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              {notifications.map(n => (
                <div key={n.id} style={{
                  padding: '12px 18px',
                  borderBottom: '1px solid #F8F9FA',
                  backgroundColor: n.unread ? '#EEF2FF' : '#FFFFFF',
                  fontSize: '12.5px',
                  cursor: 'default'
                }}>
                  <div style={{ fontWeight: n.unread ? '700' : '500', color: '#1E1B4B' }}>{n.title}</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{n.time}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      <div style={{
        padding: '16px 28px',
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1E1B4B', letterSpacing: '-0.4px' }}>
            {title}
          </h2>
          <span style={{ fontSize: '12.5px', color: '#6B7280' }}>
            {subtitle || 'Here are your important updates and overview.'}
          </span>
        </div>
      </div>

      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />

      <Modal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        title={t('messagesTitle')}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <button onClick={fetchMessages} className="btn btn-secondary btn-sm">↻ Refresh</button>
            <button onClick={() => setShowEmailModal(false)} className="btn btn-secondary">Close</button>
          </div>
        }
      >
        {newMsgSent && <div className="alert-success">Message sent and synced across all portals!</div>}
        {msgError && <div className="alert-danger">{msgError}</div>}

        <div style={{ backgroundColor: '#F8F9FE', padding: '16px', borderRadius: '16px', border: '1px solid #E0E7FF', marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#1E1B4B', marginBottom: '12px' }}>
            Compose Memo / Direct Message
          </div>
          <form onSubmit={handleSendMessage}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6366F1' }}>Send To</label>
                <select className="form-control" value={newMsgTarget} onChange={e => setNewMsgTarget(e.target.value)} style={{ fontSize: '12.5px', borderRadius: '10px' }}>
                  <option value="all">Everyone (All Organization)</option>
                  <option value="hr">HR Personnel</option>
                  <option value="manager">Department Managers</option>
                  <option value="employee">All Employees</option>
                </select>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6366F1' }}>Priority</label>
                <select className="form-control" value={newMsgPriority} onChange={e => setNewMsgPriority(e.target.value)} style={{ fontSize: '12.5px', borderRadius: '10px' }}>
                  <option value="normal">Normal Priority</option>
                  <option value="high">Urgent Priority</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6366F1' }}>Subject</label>
              <input type="text" className="form-control" placeholder="Subject..." value={newMsgSubject} onChange={e => setNewMsgSubject(e.target.value)} style={{ fontSize: '12.5px', borderRadius: '10px' }} required />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6366F1' }}>Message Content</label>
              <textarea className="form-control" rows="3" placeholder="Write your message here..." value={newMessageText} onChange={e => setNewMessageText(e.target.value)} style={{ fontSize: '12.5px', borderRadius: '10px', resize: 'vertical' }} required />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={isSendingMsg}>
                {isSendingMsg ? 'Sending...' : 'Send Message →'}
              </button>
            </div>
          </form>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', fontWeight: '800', color: '#1E1B4B', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Corporate Inbox ({messages.length})
          </div>
          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Live synchronized</span>
        </div>

        <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {messages.length === 0 ? (
            <div style={{ fontSize: '12.5px', color: '#9CA3AF', padding: '24px', textAlign: 'center', backgroundColor: '#F8F9FE', borderRadius: '12px' }}>
              No messages found. Dispatch your first message above!
            </div>
          ) : (
            messages.map(m => {
              const isMine = m.createdBy === user?.id || m.authorName === user?.name;
              const isHigh = m.priority === 'high';
              return (
                <div key={m._id} style={{
                  padding: '12px 16px',
                  border: '1px solid #E0E7FF',
                  borderLeft: isHigh ? '3px solid #EF4444' : '3px solid #6366F1',
                  borderRadius: '12px',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(99,102,241,0.04)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '13px', color: '#1E1B4B' }}>{m.title}</strong>
                        {isHigh && <span style={{ backgroundColor: '#FEE2E2', color: '#DC2626', fontSize: '10px', padding: '1px 6px', borderRadius: '100px', fontWeight: '800' }}>URGENT</span>}
                        <span style={{ backgroundColor: '#EEF2FF', color: '#6366F1', fontSize: '10px', padding: '1px 8px', borderRadius: '100px', fontWeight: '700' }}>To: {m.targetRole ? m.targetRole.toUpperCase() : 'ALL'}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#6B7280', display: 'flex', gap: '6px' }}>
                        <span>From: <strong>{m.authorName}</strong> ({m.authorRole})</span>
                        <span>•</span>
                        <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {(user?.role === 'hr' || isMine) && (
                      <button onClick={() => handleDeleteMessage(m._id)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '16px', padding: '2px 4px' }}>
                        ×
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: '12.5px', color: '#4B5563', marginTop: '8px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{m.content}</p>
                </div>
              );
            })
          )}
        </div>
      </Modal>
    </>
  );
}
