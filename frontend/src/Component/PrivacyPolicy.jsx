import React from 'react';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-bold text-gray-800 mb-3">{title}</h2>
    <div className="text-gray-600 leading-relaxed space-y-4">{children}</div>
  </div>
);

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">Privacy Policy</h1>
        <p className="text-center text-gray-500 mb-10">Last updated: {new Date().toLocaleDateString()}</p>

        <Section title="1. Introduction">
          <p>
            Welcome to Abyd. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at contact@abyd.in.
          </p>
          <p>
            This privacy policy applies to all information collected through our website and/or any related services, sales, marketing or events (we refer to them collectively in this privacy policy as the "Services").
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>
            We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and services, when you participate in activities on the Services or otherwise when you contact us.
          </p>
          <p>
            The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make and the products and features you use. The personal information we collect may include the following: Name, Email Address, Phone Number, Business Information, and Payment Data.
          </p>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>
            We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
          </p>
          <ul className="list-disc pl-6">
            <li>To facilitate account creation and logon process.</li>
            <li>To send administrative information to you.</li>
            <li>To fulfill and manage your orders.</li>
            <li>To post testimonials with your consent.</li>
            <li>To deliver targeted advertising to you.</li>
          </ul>
        </Section>

        <Section title="4. Data Security">
          <p>
            We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
          </p>
        </Section>

        <Section title="5. Your Privacy Rights">
          <p>
            In some regions (like the European Economic Area), you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time.
          </p>
        </Section>

        <Section title="6. Changes to This Policy">
          <p>
            We may update this privacy policy from time to time. The updated version will be indicated by an updated "Last updated" date and the updated version will be effective as soon as it is accessible.
          </p>
        </Section>

        <Section title="7. Contact Us">
          <p>
            If you have questions or comments about this policy, you may email us at contact@abyd.in.
          </p>
        </Section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;