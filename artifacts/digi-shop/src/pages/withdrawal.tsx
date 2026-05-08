import { LegalPage } from "@/components/legal-page";

export function Withdrawal() {
  return (
    <LegalPage
      title="Right of Withdrawal"
      subtitle="Information about your right of withdrawal under EU consumer law and the standard withdrawal form."
      lastUpdated="2 May 2025"
    >
      <h2>1. Your Right of Withdrawal</h2>
      <p>
        You have the right to withdraw from this contract within 14 calendar days without giving any reason. The withdrawal period expires 14 days after the day on which you acquire, or a third party other than the carrier and indicated by you acquires, physical possession of the goods.
      </p>
      <p>
        To exercise your right of withdrawal, you must inform us — DIGITALSOFT DI MUNSHI SHIHAB, Via Aldo Pio Manuzio 24, 40132 Bologna (BO), Italia, Email: support@nexuskeys.com — of your decision to withdraw from this contract by an unequivocal statement (e.g. a letter sent by post or email). You may use the standard withdrawal form below, but it is not obligatory.
      </p>
      <p>
        To meet the withdrawal deadline, it is sufficient for you to send your communication concerning the exercise of your right of withdrawal before the withdrawal period has expired.
      </p>

      <h2>2. Special Rules for Digital Content</h2>
      <p>
        <strong>Important:</strong> Under Article 16(m) of Directive 2011/83/EU and Article 59(o) of the Italian Consumer Code (Legislative Decree 206/2005), the right of withdrawal <strong>does not apply</strong> to contracts for the supply of digital content not provided on a tangible medium, where:
      </p>
      <ul>
        <li>The performance has begun with the consumer's prior express consent, and</li>
        <li>The consumer has acknowledged that they thereby lose their right of withdrawal.</li>
      </ul>
      <p>
        When you purchase a software license key from NexusKeys, you are asked during checkout to expressly consent to the immediate delivery of the digital content (the license key) and to acknowledge that by doing so, you waive your right of withdrawal. This consent and acknowledgement are required to complete your purchase.
      </p>
      <p>
        Accordingly, once your license key has been delivered to your email address, you no longer have the right to withdraw from the contract, provided you gave your prior express consent as described above.
      </p>
      <p>
        If you did not expressly consent to the waiver of your right of withdrawal, or if your license key has not yet been delivered, please contact us immediately at support@nexuskeys.com.
      </p>

      <h2>3. Effects of Withdrawal (Where Applicable)</h2>
      <p>
        If you validly withdraw from this contract, we shall reimburse to you all payments received from you, without undue delay and in any event not later than 14 days from the day on which we are informed about your decision to withdraw. We will carry out such reimbursement using the same means of payment as you used for the initial transaction, unless you have expressly agreed otherwise; in any event, you will not incur any fees as a result of such reimbursement.
      </p>

      <h2>4. Standard Withdrawal Form</h2>
      <p>
        (Complete and return this form only if you wish to withdraw from the contract and the right of withdrawal has not been validly waived.)
      </p>
      <div className="border border-border rounded-lg p-6 bg-muted/30 my-6">
        <p><strong>To:</strong><br />
        DIGITALSOFT DI MUNSHI SHIHAB<br />
        Via Aldo Pio Manuzio 24<br />
        40132 Bologna (BO), Italia<br />
        Email: support@nexuskeys.com</p>

        <p className="mt-4">
          I/We (*) hereby give notice that I/We (*) withdraw from my/our (*) contract of sale of the following goods (*)/for the provision of the following service (*):
        </p>
        <p>Ordered on (*) / received on (*):</p>
        <p>Name of consumer(s):</p>
        <p>Address of consumer(s):</p>
        <p>Signature of consumer(s) (only if this form is notified on paper):</p>
        <p>Date:</p>
        <p className="text-sm text-muted-foreground mt-4">(*) Delete as appropriate.</p>
      </div>
      <p>
        This standard withdrawal form corresponds to Annex I(B) of Directive 2011/83/EU of the European Parliament and of the Council.
      </p>

      <h2>5. Consumer Consent Declaration for Digital Content</h2>
      <p>
        During checkout, the following declaration is presented for your confirmation:
      </p>
      <div className="border border-border rounded-lg p-6 bg-muted/30 my-6 italic">
        <p>
          "I request the immediate supply of digital content. I acknowledge and expressly agree that by providing this consent and requesting immediate performance, I lose my right of withdrawal from this contract once the digital content has been made available to me."
        </p>
      </div>
      <p>
        By ticking the corresponding checkbox and completing your purchase, you provide this consent. This complies with the requirements of Article 16(m) of Directive 2011/83/EU.
      </p>

      <h2>6. Questions</h2>
      <p>
        If you have any questions regarding your right of withdrawal or our policies, please contact us at <a href="mailto:support@nexuskeys.com">support@nexuskeys.com</a> or visit our <a href="/contact">contact page</a>.
      </p>
    </LegalPage>
  );
}
