import PageWrapper from "@/components/PageWrapper";

export default function TermsPage() {
  return (
    <PageWrapper>
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
        <div className="w-full max-w-4xl">
          <h1 className="mb-8 text-4xl font-bold tracking-tight">
            Terms of Service
          </h1>

          <div className="prose dark:prose-invert max-w-none">
            <p className="lead">Last updated: May 8, 2024</p>

            <h2>1. Introduction</h2>
            <p>
              Welcome to LiveVitals. These Terms of Service govern your use of
              our website and services. By accessing or using LiveVitals, you
              agree to be bound by these Terms.
            </p>

            <h2>2. Definitions</h2>
            <p>
              "Service" refers to the LiveVitals application, website, and any
              other related services. "User" refers to individuals who register
              for and use our Service. "Content" refers to all information
              displayed, transmitted, or otherwise made available via our
              Service.
            </p>

            <h2>3. Account Registration</h2>
            <p>
              To use certain features of our Service, you must register for an
              account. You agree to provide accurate, current, and complete
              information during the registration process and to update such
              information to keep it accurate, current, and complete.
            </p>

            <h2>4. Privacy Policy</h2>
            <p>
              Your privacy is important to us. Our Privacy Policy describes how
              we collect, use, and disclose information about you. By using our
              Service, you consent to the collection, use, and disclosure of
              information as described in our Privacy Policy.
            </p>

            <h2>5. User Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activities that occur under your
              account. You agree to notify us immediately of any unauthorized
              use of your account.
            </p>

            <h2>6. Acceptable Use</h2>
            <p>
              You agree not to use the Service for any unlawful purpose or in
              any way that could damage, disable, overburden, or impair the
              Service. You also agree not to attempt to gain unauthorized access
              to any part of the Service or any systems or networks connected to
              the Service.
            </p>

            <h2>7. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account and
              access to the Service at our sole discretion, without notice, for
              conduct that we believe violates these Terms or is harmful to
              other users of the Service, us, or third parties, or for any other
              reason.
            </p>

            <h2>8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will
              provide notice of significant changes by posting the new Terms on
              our website and updating the "Last updated" date. Your continued
              use of the Service after such changes constitutes your acceptance
              of the new Terms.
            </p>

            <h2>9. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at
              support@livevitals.com.
            </p>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
}
