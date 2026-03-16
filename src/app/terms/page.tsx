import Link from 'next/link'

export const metadata = {
  title: 'Terms of Use - Amanatick',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white pt-8 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Use</h1>
          <p className="text-gray-500">Last updated: March 8, 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none space-y-10 text-[15px] leading-relaxed text-gray-700">

          {/* 1 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction &amp; Acceptance</h2>
            <p>
              Welcome to Amanatick (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). Amanatick is an online crowdfunding technology platform that enables individuals and organizations (&quot;Campaign Organizers&quot;) to raise funds for charitable, personal, and community causes from donors (&quot;Donors&quot;) worldwide.
            </p>
            <p>
              By accessing or using our website, services, tools, or any features provided by Amanatick (collectively, the &quot;Services&quot;), you agree to be bound by these Terms of Use (&quot;Terms&quot;). If you do not agree to these Terms, you may not access or use the Services.
            </p>
            <p>
              These Terms constitute a legally binding agreement between you and Amanatick. Please read them carefully before using the Platform.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Eligibility</h2>
            <p>To use Amanatick, you must:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Be at least 18 years of age or the age of legal majority in your jurisdiction.</li>
              <li>Have the legal capacity to enter into a binding agreement.</li>
              <li>Provide accurate, current, and complete registration information.</li>
              <li>Not have been previously suspended or removed from the Platform.</li>
            </ul>
            <p>
              By creating an account, you represent and warrant that all information you provide is truthful and accurate, and you agree to update it as necessary.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Account Registration &amp; Security</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
            </p>
            <p>
              Amanatick reserves the right to suspend or terminate any account that we reasonably believe is being used in violation of these Terms or for fraudulent purposes.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. How Amanatick Works</h2>
            <p>
              Amanatick provides the technology and infrastructure for Campaign Organizers to create fundraising campaigns and for Donors to contribute to those campaigns. <strong>Amanatick is not a party to any transaction between Campaign Organizers and Donors.</strong> We act solely as an intermediary platform.
            </p>
            <p>
              Amanatick does not guarantee that campaigns will reach their funding goals, nor do we guarantee the use of funds by Campaign Organizers. Donors contribute at their own discretion and risk.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Campaign Guidelines</h2>
            <p>Campaign Organizers agree to the following:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>All campaign information must be truthful, accurate, and not misleading.</li>
              <li>Funds raised must be used for the stated purpose of the campaign.</li>
              <li>Campaign Organizers must provide updates to Donors when reasonably requested.</li>
              <li>Campaigns must comply with all applicable laws and regulations in the Campaign Organizer&apos;s jurisdiction.</li>
              <li>Campaign Organizers are solely responsible for fulfilling any promises or commitments made in their campaigns.</li>
            </ul>
            <p>
              Amanatick reserves the right to review, approve, reject, or remove any campaign at our sole discretion, including but not limited to campaigns that violate these Terms or applicable laws.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Prohibited Campaigns &amp; Content</h2>
            <p>The following types of campaigns and content are strictly prohibited on Amanatick:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Campaigns that promote violence, terrorism, hate speech, or discrimination.</li>
              <li>Fraudulent, deceptive, or misleading campaigns.</li>
              <li>Campaigns for illegal activities or products.</li>
              <li>Campaigns involving gambling, lotteries, or games of chance.</li>
              <li>Campaigns for the sale of weapons, drugs, alcohol, tobacco, or other regulated substances.</li>
              <li>Campaigns that infringe on intellectual property rights of third parties.</li>
              <li>Sexually explicit or obscene content.</li>
              <li>Campaigns intended to launder money or finance prohibited activities.</li>
              <li>Any campaign that violates applicable local, national, or international laws.</li>
            </ul>
            <p>
              Amanatick reserves the right to remove any campaign or content that we determine, in our sole discretion, violates these guidelines, without prior notice.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Platform Fees</h2>
            <p>
              Amanatick charges a <strong>5% platform fee</strong> on each donation to sustain platform operations. During checkout, Donors are given the option to cover this fee on behalf of the campaign.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">7.1 If the Donor covers the platform fee</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-3">
              <p className="text-sm">
                The 5% fee is added on top of the donation. For example, a <strong>$100</strong> donation results in a <strong>$105</strong> charge ($100 + $5 fee). The Campaign Organizer receives the full <strong>$100</strong>.
              </p>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">7.2 If the Donor does not cover the platform fee</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-3">
              <p className="text-sm">
                The 5% fee is deducted from the donation internally. For example, a <strong>$100</strong> donation results in a <strong>$100</strong> charge. The Campaign Organizer receives <strong>$95</strong>, and <strong>$5</strong> goes to Amanatick.
              </p>
            </div>

            <p>
              In both cases, the donation amount displayed publicly on the campaign page is the amount entered by the Donor (e.g. $100), regardless of whether the fee was covered. Platform fees are never displayed publicly on campaign pages.
            </p>
            <p>
              In addition to the platform fee, third-party payment processors (such as Stripe) charge their own processing fees (approximately 2.9% + $0.30 per transaction). These fees are deducted by Stripe from the total payment and are separate from Amanatick&apos;s platform fee.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Payouts &amp; Minimum Threshold</h2>
            <p>
              Funds raised through campaigns will be disbursed to Campaign Organizers subject to the following conditions:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Minimum payout threshold:</strong> A minimum of <strong>$200 USD</strong> (or equivalent in the campaign&apos;s currency) must be raised before a payout can be issued. Campaigns that do not reach this minimum will not receive a payout until the threshold is met.
              </li>
              <li>
                <strong>Payout timing:</strong> Payouts are processed within <strong>14 business days</strong> after the campaign ends or after the minimum threshold is reached, whichever comes later.
              </li>
              <li>
                <strong>Payout methods:</strong> Campaign Organizers may receive payouts via Stripe, PayPal, or Wise, depending on their chosen payout method during campaign creation.
              </li>
              <li>
                <strong>Verification:</strong> Amanatick may require identity verification or additional documentation before processing payouts, particularly for large amounts or campaigns flagged for review.
              </li>
              <li>
                <strong>Withholding:</strong> Amanatick reserves the right to withhold, delay, or reverse payouts if we suspect fraud, a violation of these Terms, or if required by law.
              </li>
            </ul>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Donations &amp; Refund Policy</h2>
            <p>
              All donations made through Amanatick are <strong>voluntary and generally non-refundable</strong>. By making a donation, you acknowledge that:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>You are making a contribution of your own free will.</li>
              <li>You have no expectation of receiving goods or services in return (unless the campaign explicitly states otherwise).</li>
              <li>Amanatick does not guarantee how Campaign Organizers will use the funds.</li>
            </ul>
            <p>
              Refunds may be issued at Amanatick&apos;s sole discretion in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>The campaign is determined to be fraudulent.</li>
              <li>A duplicate or accidental charge occurred.</li>
              <li>The Donor contacts us within 7 days of the donation with a valid reason.</li>
            </ul>
            <p>
              To request a refund, please contact us at <strong>contact@amanatick.com</strong>. Refund requests are reviewed on a case-by-case basis.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. User Content</h2>
            <p>
              By uploading, submitting, or publishing any content on Amanatick (including text, images, videos, and other materials), you:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Represent that you own or have the necessary rights to use and share such content.</li>
              <li>Grant Amanatick a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, display, reproduce, modify, and distribute your content in connection with the Services.</li>
              <li>Acknowledge that Amanatick is not responsible for the accuracy, quality, or legality of user-submitted content.</li>
            </ul>
            <p>
              You are solely responsible for the content you provide. Amanatick may remove any content that violates these Terms without prior notice.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Intellectual Property</h2>
            <p>
              All content, trademarks, logos, designs, and other intellectual property displayed on the Platform are the property of Amanatick or its licensors. You may not use, copy, reproduce, or distribute any of our intellectual property without prior written consent.
            </p>
            <p>
              The Amanatick name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of Amanatick. You must not use such marks without our prior written permission.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Disclaimer of Warranties</h2>
            <p>
              THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p>
              Amanatick does not warrant that the Services will be uninterrupted, error-free, secure, or free of viruses or other harmful components. We do not guarantee the accuracy, reliability, or completeness of any content on the Platform.
            </p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">13. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, AMANATICK AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICES.
            </p>
            <p>
              IN NO EVENT SHALL AMANATICK&apos;S TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICES EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO AMANATICK IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED DOLLARS ($100).
            </p>
          </section>

          {/* 14 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">14. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Amanatick and its officers, directors, employees, agents, and affiliates from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys&apos; fees) arising out of or in connection with:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Your use of or access to the Services.</li>
              <li>Your violation of these Terms.</li>
              <li>Your violation of any applicable law or regulation.</li>
              <li>Any content you submit, post, or make available through the Services.</li>
              <li>Your campaign, including the use or misuse of funds raised.</li>
            </ul>
          </section>

          {/* 15 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">15. Dispute Resolution</h2>
            <p>
              Any dispute, claim, or controversy arising out of or relating to these Terms or the Services shall first be attempted to be resolved through good-faith negotiation between the parties. If the dispute cannot be resolved through negotiation within thirty (30) days, it shall be resolved through binding arbitration in accordance with the rules of the applicable arbitration authority in the jurisdiction of Amanatick&apos;s principal place of business.
            </p>
            <p>
              <strong>Class Action Waiver:</strong> You agree that any dispute resolution proceedings will be conducted on an individual basis and not as a class, consolidated, or representative action.
            </p>
          </section>

          {/* 16 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">16. Modifications to Terms</h2>
            <p>
              Amanatick reserves the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on the Platform and updating the &quot;Last updated&quot; date. Your continued use of the Services after such changes constitutes your acceptance of the modified Terms.
            </p>
            <p>
              We encourage you to review these Terms periodically to stay informed of any updates.
            </p>
          </section>

          {/* 17 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">17. Termination</h2>
            <p>
              Amanatick may suspend or terminate your access to the Services at any time, with or without cause, and with or without notice. Upon termination:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Your right to use the Services will immediately cease.</li>
              <li>Any pending payouts may be withheld pending investigation.</li>
              <li>Provisions of these Terms that by their nature should survive termination will survive (including indemnification, limitation of liability, and dispute resolution).</li>
            </ul>
          </section>

          {/* 18 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">18. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Amanatick operates, without regard to its conflict of law provisions.
            </p>
          </section>

          {/* 19 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">19. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Use, please contact us at:
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
