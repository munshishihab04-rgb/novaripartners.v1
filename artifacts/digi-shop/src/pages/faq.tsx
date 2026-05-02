import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: React.ReactNode;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        className="w-full flex justify-between items-center text-left px-6 py-5 font-medium text-foreground hover:bg-muted/40 transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{question}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 ml-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-6 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-border bg-muted/20">
          <div className="pt-4">{answer}</div>
        </div>
      )}
    </div>
  );
}

interface FAQSectionProps {
  title: string;
  items: FAQItemProps[];
}

function FAQSection({ title, items }: FAQSectionProps) {
  return (
    <div className="mb-12">
      <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border">{title}</h2>
      <div className="space-y-3">
        {items.map((item, i) => (
          <FAQItem key={i} question={item.question} answer={item.answer} />
        ))}
      </div>
    </div>
  );
}

export function FAQ() {
  return (
    <Layout>
      <div className="bg-muted/40 border-b border-border py-12">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">Frequently Asked Questions</h1>
          <p className="text-muted-foreground text-base">
            Everything you need to know about purchasing and using software licenses from NexusKeys.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl py-14">
        <FAQSection
          title="Orders and Delivery"
          items={[
            {
              question: "What is a digital license key?",
              answer: (
                <p>
                  A digital license key (also called a product key, activation key, or serial number) is a unique alphanumeric code that activates a software application and confirms it is genuine. Once you enter the key during installation or via the software's activation screen, it unlocks the full functionality of the program — no physical disc or download from us is required.
                </p>
              ),
            },
            {
              question: "How and when will I receive my license key?",
              answer: (
                <p>
                  Your license key is delivered electronically to the email address you provide at checkout. In most cases, delivery happens within minutes of a confirmed payment. In rare circumstances, it may take up to 24 hours. Please check your spam/junk folder if you have not received your key. If you still cannot find it after 24 hours, contact us at support@nexuskeys.com with your order reference.
                </p>
              ),
            },
            {
              question: "Do I need to create an account to purchase?",
              answer: (
                <p>
                  No, you do not need to create an account. You can complete your purchase as a guest by providing your email address at checkout. Your license key and order confirmation will be sent to that email address.
                </p>
              ),
            },
            {
              question: "Can I purchase for someone else?",
              answer: (
                <p>
                  Yes. Enter the recipient's email address at checkout and the license key will be delivered directly to them. Note that the purchase contract and receipt will still be associated with your billing details.
                </p>
              ),
            },
          ]}
        />

        <FAQSection
          title="Activation and Compatibility"
          items={[
            {
              question: "Are the license keys genuine and authentic?",
              answer: (
                <p>
                  Yes. All license keys sold by NexusKeys are 100% genuine and sourced through lawful distribution channels. They are not trial versions, cracked keys, or counterfeit codes. Each key activates the software directly with the official publisher's servers (e.g. Microsoft, Adobe, Autodesk).
                </p>
              ),
            },
            {
              question: "How do I activate my software?",
              answer: (
                <>
                  <p>Activation steps vary by product, but the general process is:</p>
                  <ol className="list-decimal list-inside space-y-1 mt-2">
                    <li>Download the software from the official publisher's website.</li>
                    <li>Install the software on your device.</li>
                    <li>When prompted, enter the license key you received by email.</li>
                    <li>The software will contact the publisher's activation server to verify the key.</li>
                  </ol>
                  <p className="mt-2">Detailed activation instructions for each product are included in the delivery email.</p>
                </>
              ),
            },
            {
              question: "How many devices can I use the license on?",
              answer: (
                <p>
                  This depends on the specific product and license type. The product page specifies whether a key is for 1 device, 2 devices, etc. Standard retail keys typically allow activation on 1 device. If you need to use software on multiple machines, please purchase the appropriate quantity or a multi-seat license where available.
                </p>
              ),
            },
            {
              question: "Will the key work in my country?",
              answer: (
                <p>
                  All keys sold on NexusKeys are globally valid unless the product description explicitly states otherwise. We serve customers throughout the European Union and worldwide. If you have concerns about regional restrictions for a specific product, please contact us before purchasing.
                </p>
              ),
            },
            {
              question: "Can I upgrade to a newer version using this key?",
              answer: (
                <p>
                  Our license keys activate the specific version listed in the product description. They do not automatically entitle you to upgrade to future major versions (e.g. a key for version 2027 will not activate version 2028). Check the product description for upgrade eligibility details. Some subscription-based products include free updates for the duration of the subscription.
                </p>
              ),
            },
          ]}
        />

        <FAQSection
          title="Payments and Pricing"
          items={[
            {
              question: "What payment methods do you accept?",
              answer: (
                <p>
                  We accept all major credit and debit cards (Visa, Mastercard, American Express) and other payment methods displayed at checkout. All transactions are secured with 256-bit SSL encryption. We do not store your card details on our servers — payment processing is handled by certified third-party payment providers.
                </p>
              ),
            },
            {
              question: "Are prices inclusive of VAT?",
              answer: (
                <p>
                  Prices on the Website are displayed in USD. Applicable VAT or taxes will be shown at checkout before you confirm your order. Business customers with a valid EU VAT number may be eligible for reverse charge on VAT — please contact us before purchasing.
                </p>
              ),
            },
            {
              question: "Can I get an invoice for my purchase?",
              answer: (
                <p>
                  Yes. An invoice (ricevuta/fattura) will be issued for all purchases. If you require a formal Italian tax invoice (fattura elettronica) for business purposes, please contact us at support@nexuskeys.com after your purchase with your fiscal code or VAT number and we will issue the appropriate document.
                </p>
              ),
            },
          ]}
        />

        <FAQSection
          title="Refunds and Support"
          items={[
            {
              question: "What is your refund policy?",
              answer: (
                <p>
                  Because we sell digital content, the standard EU right of withdrawal is waived once the license key has been delivered (provided you consented to immediate delivery at checkout). However, we will always provide a replacement key or full refund if your key is invalid, already used, or incorrect. Please see our full <Link href="/refunds" className="text-primary hover:underline">Refund Policy</Link> for details.
                </p>
              ),
            },
            {
              question: "My key is not working. What should I do?",
              answer: (
                <>
                  <p>Please follow these steps:</p>
                  <ol className="list-decimal list-inside space-y-1 mt-2">
                    <li>Ensure you are entering the key exactly as shown (check for typos, zeros vs. letter O, etc.).</li>
                    <li>Make sure you are activating the correct software version and platform.</li>
                    <li>Ensure your internet connection is stable (activation requires an internet connection).</li>
                    <li>If the issue persists, contact us at support@nexuskeys.com with your order reference and a description of the error message you received.</li>
                  </ol>
                </>
              ),
            },
            {
              question: "How do I contact customer support?",
              answer: (
                <p>
                  You can reach our support team via our <Link href="/contact" className="text-primary hover:underline">Contact Page</Link> or by emailing support@nexuskeys.com. We aim to respond to all enquiries within 1 business day.
                </p>
              ),
            },
          ]}
        />

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 text-center">
          <h3 className="text-lg font-bold text-foreground mb-2">Still have a question?</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Our support team is here to help. Reach out and we'll get back to you within 1 business day.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </Layout>
  );
}
