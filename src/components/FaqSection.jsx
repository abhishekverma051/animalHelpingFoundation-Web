import React, { useState } from 'react';

const faqs = [
  {
    num: '01',
    q: 'How Can I Donate To The Foundation?',
    a: 'You Can Choose An Ongoing Campaign Or Make A General Donation, Select Your Preferred Amount, And Complete The Payment Securely Through Our Online Payment Gateway.'
  },
  {
    num: '02',
    q: 'Where Does My Donation Go?',
    a: '100% of public donations go directly towards animal rescue operations, daily feeding drives, emergency surgeries, shelter maintenance, and veterinary supplies.'
  },
  {
    num: '03',
    q: 'Can I Choose Which Campaign I Want To Support?',
    a: 'Yes! You can choose any specific campaign under "Causes We Support" or make a general contribution to our emergency relief fund.'
  },
  {
    num: '04',
    q: 'Will I Receive A Donation Receipt?',
    a: 'Yes, an instant tax-deductible donation receipt with 80G tax benefit details will be sent directly to your registered email address.'
  },
  {
    num: '05',
    q: 'Is My Donation Eligible For A Tax Benefit?',
    a: 'All donations made to Animal Helping Foundation are eligible for tax exemption under Section 80G of the Indian Income Tax Act.'
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="faq-section" id="help">
      <div className="container" style={{ maxWidth: '920px', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <span className="faq-pill-badge">FAQ</span>
          <h2 className="faq-main-title">
            Everything You Need to Know.
          </h2>
        </div>

        <div className="faq-list">
          {faqs.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div className={`faq-item ${isOpen ? 'open' : ''}`} key={item.num}>
                <div className="faq-question" onClick={() => toggleFaq(idx)}>
                  <div className="faq-question-left">
                    <span className="faq-number">{item.num}</span>
                    <span className="faq-title-text">{item.q}</span>
                  </div>
                  <div className="faq-arrow-icon">
                    {isOpen ? (
                      /* Diagonal Down-Left Arrow (Open state) */
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="5" x2="5" y2="19"></line>
                        <polyline points="15 19 5 19 5 9"></polyline>
                      </svg>
                    ) : (
                      /* Diagonal Up-Right Arrow (Closed state) */
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                      </svg>
                    )}
                  </div>
                </div>

                {isOpen && (
                  <div className="faq-answer">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
