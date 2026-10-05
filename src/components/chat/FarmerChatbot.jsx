import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { generateResponse } from '../../services/aiService';

const FarmerChatbot = () => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Draggable state — starts at bottom-right
  const [pos, setPos] = useState({ x: window.innerWidth - 96, y: window.innerHeight - 96 });
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const onMouseDown = (e) => {
    isDragging.current = true;
    hasDragged.current = false;
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    e.preventDefault();
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      const dx = Math.abs(e.clientX - (pos.x + dragOffset.current.x));
      const dy = Math.abs(e.clientY - (pos.y + dragOffset.current.y));
      if (dx > 4 || dy > 4) hasDragged.current = true;
      const newX = Math.min(Math.max(0, e.clientX - dragOffset.current.x), window.innerWidth - 64);
      const newY = Math.min(Math.max(0, e.clientY - dragOffset.current.y), window.innerHeight - 64);
      setPos({ x: newX, y: newY });
    };
    const onMouseUp = () => { isDragging.current = false; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [pos]);

  // Initialize with welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ id: 1, text: t('chatbot.welcome'), sender: 'ai' }]);
    }
  }, [isOpen, messages.length, t]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const userMsg = { id: Date.now(), text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    const aiText = await generateResponse(userMsg.text, language);
    const aiMsg = { id: Date.now() + 1, text: aiText, sender: 'ai' };
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  // Chat window position: above and to the left of the button if near right edge
  const chatLeft = pos.x + 380 + 16 > window.innerWidth ? pos.x - 380 - 16 : pos.x;
  const chatTop = pos.y - 600 < 0 ? pos.y + 80 : pos.y - 600;

  return (
    <>
      {/* Draggable Floating Chat Button */}
      <button
        onMouseDown={onMouseDown}
        onClick={() => { if (!hasDragged.current) setIsOpen(o => !o); }}
        style={{
          position: 'fixed',
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'var(--accent-cyan)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          outline: 'none',
          userSelect: 'none',
        }}
      >
        <span className="material-symbols-rounded" style={{ fontSize: '32px', pointerEvents: 'none' }}>
          {isOpen ? 'close' : 'smart_toy'}
        </span>
      </button>

      {/* Chat Window — floats near the button */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          left: `${chatLeft}px`,
          top: `${chatTop}px`,
          width: '380px',
          height: '600px',
          maxHeight: '80vh',
          background: 'var(--bg-surface)',
          border: '1px solid var(--glass-border)',
          borderRadius: '24px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999,
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out forwards'
        }}>
          <style>
            {`
              @keyframes slideUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}
          </style>

          {/* Chat Header */}
          <div style={{
            padding: '20px',
            background: 'var(--glass-highlight)',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px', height: '40px',
              borderRadius: '50%',
              background: 'var(--accent-cyan)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff'
            }}>
              <span className="material-symbols-rounded">eco</span>
            </div>
            <div>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>{t('chatbot.title')}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{t('chatbot.status')}</span>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '12px 16px',
                  borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.sender === 'user' ? 'var(--accent-cyan)' : 'var(--glass-highlight)',
                  color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--glass-border)',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '16px 16px 16px 4px',
                  background: 'var(--glass-highlight)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem'
                }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '18px', animation: 'pulse 1.5s infinite' }}>more_horiz</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '20px',
            borderTop: '1px solid var(--glass-border)',
            background: 'var(--glass-highlight)'
          }}>
            <div style={{
              display: 'flex',
              background: 'var(--bg-surface)',
              border: '1px solid var(--glass-border)',
              borderRadius: '99px',
              padding: '6px'
            }}>
              <input
                type="text"
                placeholder={t('chatbot.placeholder')}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  padding: '10px 16px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSend}
                style={{
                  width: '40px', height: '40px',
                  borderRadius: '50%',
                  background: 'var(--glass-highlight)',
                  color: 'var(--accent-cyan)',
                  border: 'none',
                  outline: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--glass-border)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--glass-highlight)'}
              >
                <span className="material-symbols-rounded" style={{ fontSize: '20px', marginLeft: '4px' }}>send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FarmerChatbot;
