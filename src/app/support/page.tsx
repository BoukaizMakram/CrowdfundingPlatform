'use client'

import Link from 'next/link'

const faqs = [
  {
    question: 'How do I create a campaign?',
    answer: 'Click "FundRaise" in the navigation bar or go to your Dashboard and click "Create Campaign". Fill in the details about your campaign, add images, set a goal, and submit for review.',
  },
  {
    question: 'How long does campaign approval take?',
    answer: 'Campaign review typically takes 1-2 business days. You will be notified once your campaign is approved or if any changes are needed.',
  },
  {
    question: 'How do I receive funds from my campaign?',
    answer: 'Set up your payout method in Settings. You can choose between Stripe, PayPal, or Wise. Once configured, you can request withdrawals from your campaign earnings.',
  },
  {
    question: 'Is there a platform fee?',
    answer: 'We charge a 5% platform fee on donations. Donors have the option to cover this fee so your campaign receives the full donation amount.',
  },
  {
    question: 'Can I edit my campaign after publishing?',
    answer: 'Yes, you can edit your campaign details from the Campaigns page in your dashboard. Some changes may require re-approval.',
  },
  {
    question: 'How do refunds work?',
    answer: 'If you need a refund for a donation, please contact our support team with your transaction details and we will process it within 5-7 business days.',
  },
]

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] pt-8 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Support</h1>
        <p className="text-gray-500 text-sm mb-8">Find answers or get in touch</p>

        {/* FAQ */}
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 mb-8">
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h2>
          </div>
          {faqs.map((faq, i) => (
            <details key={i} className="group px-6 py-4">
              <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-900 list-none">
                {faq.question}
                <svg className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>

        {/* Contact */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-[#edffd3] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[#274a34]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Still need help?</h2>
          <p className="text-sm text-gray-500 mb-4">Our support team is here to assist you.</p>
          <a
            href="mailto:contact@amanatick.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#274a34] text-white font-medium text-sm rounded-xl hover:bg-[#1d3827] transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}
