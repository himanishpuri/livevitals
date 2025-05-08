import PageWrapper from "@/components/PageWrapper";

export default function PrivacyPage() {
  return (
    <PageWrapper>
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
        <div className="w-full max-w-4xl">
          <h1 className="mb-8 text-4xl font-bold tracking-tight">
            Privacy Policy
          </h1>

          <div className="prose dark:prose-invert max-w-none">
            <p className="lead">Last updated: May 8, 2024</p>

            <h2>1. Introduction</h2>
            <p>
              At LiveVitals, we take your privacy seriously. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you use our service. Please read this privacy
              policy carefully.
            </p>

            <h2>2. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us when you
              register for an account, create or modify your profile, or
              communicate with us. This information may include your name, email
              address, password, phone number, date of birth, and other
              information you choose to provide.
            </p>

            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process and complete transactions</li>
              <li>
                Send you technical notices, updates, security alerts, and
                support messages
              </li>
              <li>Respond to your comments, questions, and requests</li>
              <li>
                Communicate with you about products, services, offers, and
                events
              </li>
              <li>
                Monitor and analyze trends, usage, and activities in connection
                with our services
              </li>
            </ul>

            <h2>4. Sharing of Information</h2>
            <p>We may share your personal information with:</p>
            <ul>
              <li>Service providers who perform services on our behalf</li>
              <li>
                Professional advisors, such as lawyers, auditors, and insurers
              </li>
              <li>
                Government authorities if required by law or in response to
                legal process
              </li>
            </ul>

            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to
              protect the security of your personal information. However, please
              be aware that no security measures are perfect or impenetrable,
              and we cannot guarantee the security of your data.
            </p>

            <h2>6. Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding
              your personal information, such as the right to access, correct,
              or delete your personal information, or to object to or restrict
              certain processing of your personal information.
            </p>

            <h2>7. Changes to This Privacy Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will
              notify you of any changes by posting the new privacy policy on
              this page and updating the "Last updated" date.
            </p>

            <h2>8. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy, please
              contact us at privacy@livevitals.com.
            </p>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
}
