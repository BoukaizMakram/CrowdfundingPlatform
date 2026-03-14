import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy - Amanatick',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-500">Last updated: March 8, 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none space-y-10 text-[15px] leading-relaxed text-gray-700">

          {/* 1 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              Amanatick (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services (collectively, the &quot;Services&quot;).
            </p>
            <p>
              By using our Services, you consent to the data practices described in this Privacy Policy. If you do not agree with the practices described here, please do not use our Services.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
            <p>We collect information in the following ways:</p>

            <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account information:</strong> Name, email address, phone number, and password when you create an account.</li>
              <li><strong>Campaign information:</strong> Campaign title, description, category, funding goal, images, and videos.</li>
              <li><strong>Payment information:</strong> Payout method preferences (Stripe, PayPal, or Wise) and associated email addresses. Payment card details are processed directly by Stripe and are never stored on our servers.</li>
              <li><strong>Donation information:</strong> Donation amount, donor name (unless anonymous), and donation messages.</li>
              <li><strong>Communications:</strong> Information you provide when contacting us for support.</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Usage data:</strong> Pages visited, features used, time spent on pages, and interaction patterns.</li>
              <li><strong>Device information:</strong> Browser type, operating system, device type, and screen resolution.</li>
              <li><strong>Log data:</strong> IP address, access times, referring URLs, and error logs.</li>
              <li><strong>Cookies:</strong> We use cookies and similar tracking technologies to enhance your experience. See Section 7 for details.</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide, maintain, and improve our Services.</li>
              <li>To process donations and payouts.</li>
              <li>To create and manage your account.</li>
              <li>To display campaign information to potential Donors.</li>
              <li>To communicate with you about your account, campaigns, or donations.</li>
              <li>To detect, prevent, and address fraud, abuse, and security issues.</li>
              <li>To comply with legal obligations.</li>
              <li>To enforce our Terms of Use.</li>
              <li>To send you service-related notifications and updates.</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. How We Share Your Information</h2>
            <p>We may share your information in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Campaign visibility:</strong> Campaign details (title, description, images, organizer name) are publicly visible on the Platform. Donor names and messages are visible on campaign pages unless the donor chooses to remain anonymous.</li>
              <li><strong>Payment processors:</strong> We share necessary information with Stripe to process payments. Stripe&apos;s use of your data is governed by its own privacy policy.</li>
              <li><strong>Service providers:</strong> We may share information with third-party service providers who assist us in operating the Platform (e.g., hosting, analytics, email services).</li>
              <li><strong>Legal requirements:</strong> We may disclose your information if required by law, court order, or governmental authority, or if we believe disclosure is necessary to protect our rights, your safety, or the safety of others.</li>
              <li><strong>Business transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
            </ul>
            <p>
              We do <strong>not</strong> sell your personal information to third parties for marketing purposes.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Encryption of data in transit (TLS/SSL).</li>
              <li>Secure storage of data using industry-standard practices.</li>
              <li>Regular security assessments and monitoring.</li>
              <li>Access controls limiting who can access personal data.</li>
            </ul>
            <p>
              However, no method of transmission over the Internet or method of electronic storage is 100% secure. We cannot guarantee absolute security of your data.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide you with our Services. We may also retain certain information as required by law, to resolve disputes, enforce our agreements, or for legitimate business purposes.
            </p>
            <p>
              Campaign and donation data may be retained for a minimum of 5 years for financial record-keeping and compliance purposes.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Cookies &amp; Tracking Technologies</h2>
            <p>
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Keep you signed in to your account.</li>
              <li>Remember your preferences and settings.</li>
              <li>Understand how you use our Services.</li>
              <li>Improve the performance and functionality of the Platform.</li>
            </ul>
            <p>
              You can control cookies through your browser settings. Disabling cookies may affect the functionality of certain features.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data, subject to legal retention requirements.</li>
              <li><strong>Portability:</strong> Request a copy of your data in a structured, machine-readable format.</li>
              <li><strong>Objection:</strong> Object to certain processing of your personal data.</li>
              <li><strong>Withdrawal of consent:</strong> Withdraw consent where processing is based on consent.</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at <strong>contact@amanatick.com</strong>. We will respond to your request within 30 days.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Children&apos;s Privacy</h2>
            <p>
              Our Services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected personal data from a child without parental consent, we will take steps to delete that information.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from the laws of your country. By using our Services, you consent to the transfer of your information to these countries.
            </p>
            <p>
              We take appropriate safeguards to ensure that your personal data remains protected in accordance with this Privacy Policy.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-3">
              <p className="font-medium text-gray-900">Amanatick</p>
              <p>Email: <strong>contact@amanatick.com</strong></p>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
