import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import Panel from '../components/common/Panel';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const HelpPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All', icon: '📋' },
    { id: 'submission', label: 'Submission', icon: '📤' },
    { id: 'status', label: 'Status', icon: '📊' },
    { id: 'rejection', label: 'Rejection', icon: '❌' },
    { id: 'timeline', label: 'Timeline', icon: '⏱️' },
    { id: 'documents', label: 'Documents', icon: '📄' },
    { id: 'contact', label: 'Contact', icon: '📞' },
  ];

  const faqs = [
    {
      id: 1,
      question: 'How do I submit a clearance request?',
      answer: 'Navigate to the "Clearance" section and click "Submit Request". Fill out the required information and submit.',
      category: 'submission',
    },
    {
      id: 2,
      question: 'How do I check my clearance status?',
      answer: 'Go to your dashboard and look at the "My Clearance Status" card. It will show your current progress.',
      category: 'status',
    },
    {
      id: 3,
      question: 'What if my request is rejected?',
      answer: 'You will receive a notification with the reason for rejection. You can resubmit after addressing the issues.',
      category: 'rejection',
    },
    {
      id: 4,
      question: 'How long does approval take?',
      answer: 'Approval typically takes 1-2 business days depending on the department.',
      category: 'timeline',
    },
    {
      id: 5,
      question: 'What documents do I need to submit?',
      answer: 'The required documents vary by department. Check each department\'s requirements in the "Clearance" section.',
      category: 'documents',
    },
    {
      id: 6,
      question: 'How do I contact support?',
      answer: 'You can contact support via email at support@clearpass.com or call +63 (2) 8123-4567 during office hours.',
      category: 'contact',
    },
    {
      id: 7,
      question: 'Can I cancel a submitted request?',
      answer: 'Yes, you can cancel a pending request from the "Clearance" section before it is processed.',
      category: 'submission',
    },
    {
      id: 8,
      question: 'What happens after I complete all requirements?',
      answer: 'Once all departments approve your clearance, you will receive a completion certificate.',
      category: 'status',
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const handleSendSupport = () => {
    if (supportMessage.trim()) {
      alert('Support ticket created! We will respond within 24 hours.');
      setSupportMessage('');
    } else {
      alert('Please enter a message.');
    }
  };


  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSupportMessage(e.target.value);
  };

  return (
    <Layout title="Help & Support">
      <div className="help-page">
        
        <div className="page-header">
          <div className="page-header-text">
            <h2>Help & Support</h2>
            <p>Frequently asked questions and support resources</p>
          </div>
        </div>

       
        <div className="help-search">
          <Input
            placeholder="Search for answers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="🔍"
            className="help-search-input"
          />
        </div>  

    
        <div className="help-categories">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`help-category-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span className="category-icon">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* ===== FAQ ===== */}
        <Panel title="📚 Frequently Asked Questions">
          {filteredFaqs.length === 0 ? (
            <div className="panel-empty">
              <span className="empty-icon">🔍</span>
              <p>No results found for "{searchTerm}"</p>
            </div>
          ) : (
            <div className="faq-list">
              {filteredFaqs.map((faq) => (
                <div key={faq.id} className="faq-item">
                  <details>
                    <summary>
                      <span className="faq-icon">❓</span>
                      {faq.question}
                      <span className="faq-category">{faq.category}</span>
                    </summary>
                    <p>{faq.answer}</p>
                  </details>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* ===== CONTACT SUPPORT ===== */}
        <Panel title="📞 Contact Support">
          <div className="contact-support">
            <p className="contact-description">
              If you need further assistance, please contact our support team:
            </p>

            <div className="contact-methods">
              <div className="contact-method">
                <span className="contact-icon">📧</span>
                <div>
                  <strong>Email</strong>
                  <p>support@clearpass.com</p>
                </div>
              </div>
              <div className="contact-method">
                <span className="contact-icon">📱</span>
                <div>
                  <strong>Phone</strong>
                  <p>+63 (2) 8123-4567</p>
                </div>
              </div>
              <div className="contact-method">
                <span className="contact-icon">💬</span>
                <div>
                  <strong>Live Chat</strong>
                  <p>Available 8:00 AM - 5:00 PM</p>
                </div>
              </div>
            </div>

            {/* ===== SUPPORT FORM ===== */}
            <div className="support-form">
              <h4>Send us a message</h4>
              <div className="support-textarea-wrapper">
                <textarea
                  className="support-textarea"
                  placeholder="Describe your issue..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  rows={4}
                />
              </div>
              <Button variant="primary" onClick={handleSendSupport}>
                🎧 Send Message
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    </Layout>
  );
};

export default HelpPage;