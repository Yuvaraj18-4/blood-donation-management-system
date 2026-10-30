import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { sendChatMessage } from '../api';
import './Chatbot.css';

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hi! I’m your Blood Donation Assistant 💉. Ask me anything about donation eligibility, blood type compatibility, health preparation, or finding upcoming blood camps!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickReplies = [
    "Check eligibility criteria",
    "Blood compatibility rules",
    "Health tips before donation",
    "Find nearest blood camp",
    "Benefits of donating blood"
  ];

  const handleSend = async (customInput) => {
    const userInput = (customInput || input).trim();
    if (!userInput) return;

    const newUserMsg = { sender: 'user', text: userInput };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(userInput);
      const botText = res.data.reply || "Thank you for asking. Please consult our local blood camp coordinators for direct medical assessment.";
      setMessages((prev) => [...prev, { sender: 'bot', text: botText }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: "⚠️ Medical Assistant server is temporarily offline. Clinical reminder: Donors must be 18-65 years old, weight ≥ 45-50 kg, and have rested at least 90 days since previous whole blood donation."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="chatbot-page">
        <div className="chatbot-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>💬 Clinical Blood Donation Assistant</h2>
            <span style={{ fontSize: '11px', background: '#ffebee', color: '#b71c1c', padding: '3px 8px', borderRadius: '10px' }}>
              Verified Guidelines
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '-5px', marginBottom: '15px' }}>
            * Automated advisory based on national transfusion guidelines. Does not substitute for laboratory cross-matching.
          </p>

          <div className="chat-window">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.sender}`}>
                <div className="chat-bubble" style={{ whiteSpace: 'pre-line' }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-msg bot typing">
                <div className="chat-bubble">
                  Consulting transfusion database<span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Reply Buttons */}
          <div className="quick-replies">
            {quickReplies.map((reply, i) => (
              <button key={i} onClick={() => handleSend(reply)} disabled={loading}>
                {reply}
              </button>
            ))}
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={input}
              placeholder="Ask about eligibility, safety, blood groups..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
              disabled={loading}
            />
            <button onClick={() => handleSend()} disabled={loading || !input.trim()}>
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chatbot;
