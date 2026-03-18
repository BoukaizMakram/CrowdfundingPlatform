import Link from 'next/link'

export const metadata = {
  title: 'About - Amanatick',
}

export default function AboutPage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Amanatick</h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            The trusted Islamic crowdfunding platform connecting generous hearts with meaningful causes.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none space-y-10 text-[15px] leading-relaxed text-gray-700">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h2>
            <p>
              Amanatick was built to make giving easy, transparent, and impactful. We believe every act of charity — whether sadaqah, zakat, or waqf — should reach those who need it most, with full accountability and trust.
            </p>
            <p>
              Our platform empowers individuals, mosques, schools, orphanages, and relief organizations to raise funds for causes that matter, while giving donors the confidence that their contributions are making a real difference.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">What We Do</h2>
            <p>
              Amanatick provides a simple and secure way to create and support fundraising campaigns. Whether you&apos;re building a mosque, sponsoring orphans, funding education, or responding to emergencies — our platform handles the rest so you can focus on the cause.
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Create campaigns in minutes with a clear goal and story</li>
              <li>Share with the ummah across social media and beyond</li>
              <li>Collect and withdraw donations securely to your account</li>
              <li>Track progress with real-time analytics and updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Why Amanatick?</h2>
            <p>
              <strong>Amanah</strong> means trust in Arabic — and that&apos;s at the heart of everything we do. We built this platform on the principle that charitable giving should be transparent, accessible, and rooted in Islamic values.
            </p>
          </section>

        </div>

        {/* CTA */}
        <div className="mt-16 flex flex-col sm:flex-row gap-4">
          <Link
            href="/campaigns"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#274a34] text-white font-bold rounded-xl hover:bg-[#1d3827] transition-colors"
          >
            Donate now
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            href="/campaign/create"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#274a34] text-[#274a34] font-bold rounded-xl hover:bg-[#edffd3] transition-colors"
          >
            Start a campaign
          </Link>
        </div>
      </div>
    </div>
  )
}
