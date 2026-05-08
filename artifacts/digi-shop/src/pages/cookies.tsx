import { LegalPage } from "@/components/legal-page";

export function Cookies() {
  return (
    <LegalPage
      title="Cookie Policy"
      subtitle="Information about how we use cookies and similar technologies on this website."
      lastUpdated="2 May 2025"
    >
      <h2>1. What Are Cookies?</h2>
      <p>
        Cookies are small text files placed on your device (computer, tablet, or mobile phone) when you visit a website. They are widely used to make websites work efficiently, to remember your preferences, and to provide information to website owners.
      </p>
      <p>
        Similar technologies, such as pixels, web beacons, and local storage, may also be used for the same purposes. In this Policy, we refer to all such technologies collectively as "cookies."
      </p>

      <h2>2. Why We Use Cookies</h2>
      <p>We use cookies for the following purposes:</p>
      <ul>
        <li>To enable essential website functionality (e.g. your shopping session and cart)</li>
        <li>To remember your preferences</li>
        <li>To measure how visitors use our Website (analytics)</li>
        <li>To prevent fraud and improve security</li>
      </ul>

      <h2>3. Categories of Cookies We Use</h2>

      <h3>3.1 Strictly Necessary Cookies</h3>
      <p>
        These cookies are essential for the Website to function and cannot be switched off. They are usually set in response to actions you take, such as setting your privacy preferences, logging in, or filling in forms. Without these cookies, services you have asked for — such as maintaining your shopping cart — cannot be provided.
      </p>
      <table>
        <thead>
          <tr>
            <th>Cookie Name</th>
            <th>Purpose</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>session_id</td>
            <td>Maintains your shopping session and cart</td>
            <td>Session / 30 days</td>
          </tr>
          <tr>
            <td>cookie_consent</td>
            <td>Stores your cookie consent preferences</td>
            <td>12 months</td>
          </tr>
        </tbody>
      </table>

      <h3>3.2 Analytics and Performance Cookies</h3>
      <p>
        These cookies allow us to count visits and understand how visitors move around the Website so we can improve its performance and content. All information collected is aggregated and therefore anonymous. If you do not allow these cookies we will not know when you have visited our site.
      </p>
      <table>
        <thead>
          <tr>
            <th>Cookie Name</th>
            <th>Provider</th>
            <th>Purpose</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>_ga</td>
            <td>Google Analytics</td>
            <td>Distinguishes unique users</td>
            <td>2 years</td>
          </tr>
          <tr>
            <td>_ga_*</td>
            <td>Google Analytics</td>
            <td>Maintains session state</td>
            <td>2 years</td>
          </tr>
        </tbody>
      </table>

      <h3>3.3 Functional Cookies</h3>
      <p>
        These cookies enable the Website to provide enhanced functionality and personalisation, such as remembering your language or region preference. They may be set by us or by third-party providers.
      </p>

      <h2>4. Third-Party Cookies</h2>
      <p>
        Some cookies are placed by third parties on our behalf. These third parties include:
      </p>
      <ul>
        <li><strong>Google Analytics</strong> — website analytics. Google's privacy policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a></li>
        <li><strong>Payment processors</strong> (e.g. Stripe) — for secure payment processing. Stripe's privacy policy: <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a></li>
      </ul>
      <p>
        We do not control these third-party cookies. Please refer to the respective third parties' privacy and cookie policies for more information.
      </p>

      <h2>5. Managing and Disabling Cookies</h2>
      <p>
        You can control and manage cookies in several ways. Please note that removing or blocking cookies may impact your user experience and some functionality may no longer be available.
      </p>

      <h3>5.1 Browser Settings</h3>
      <p>
        Most browsers allow you to view, manage, delete, and block cookies. The Help section of your browser will tell you how to manage cookies. Common browser settings pages:
      </p>
      <ul>
        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
        <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
        <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Apple Safari</a></li>
        <li><a href="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
      </ul>

      <h3>5.2 Opt-Out Tools</h3>
      <p>
        To opt out of Google Analytics tracking, you can use the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a>.
      </p>
      <p>
        For more choices about interest-based advertising, visit <a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer">www.youronlinechoices.eu</a> (EU).
      </p>

      <h2>6. Legal Basis</h2>
      <p>
        Strictly necessary cookies are used on the basis of our legitimate interest in providing a functioning website. All other cookies are used only with your prior consent, in accordance with Article 6(1)(a) of the GDPR and the Italian Electronic Communications Code (Legislative Decree no. 259/2003).
      </p>

      <h2>7. Changes to This Policy</h2>
      <p>
        We may update this Cookie Policy as our use of cookies changes or in response to changes in applicable law. The date at the top of this page indicates when it was last revised.
      </p>

      <h2>8. Contact</h2>
      <p>
        If you have any questions about our use of cookies, please contact us at <a href="mailto:privacy@nexuskeys.com">privacy@nexuskeys.com</a>.
      </p>
    </LegalPage>
  );
}
