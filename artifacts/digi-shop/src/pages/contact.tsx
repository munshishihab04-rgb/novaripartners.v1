import { Layout } from "@/components/layout";
import { MapPin, Mail, Clock, Building2, FileText, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orderRef: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Layout>
      <div className="bg-muted/40 border-b border-border py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Contact Us</h1>
          <p className="text-muted-foreground text-base">
            Get in touch with our team. We aim to respond to all enquiries within 1 business day.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground mb-5">Our Details</h2>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary p-2.5 rounded-lg shrink-0 mt-0.5">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground mb-1">Legal Entity</div>
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      DIGITALSOFT DI MUNSHI SHIHAB<br />
                      P.IVA IT04358941203<br />
                      REA BO-588058
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary p-2.5 rounded-lg shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground mb-1">Registered Address</div>
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      Via Aldo Pio Manuzio 24<br />
                      40132 Bologna (BO)<br />
                      Italia
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary p-2.5 rounded-lg shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground mb-1">Email</div>
                    <a href="mailto:support@nexuskeys.com" className="text-sm text-primary hover:underline">
                      support@nexuskeys.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary p-2.5 rounded-lg shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground mb-1">Response Time</div>
                    <div className="text-sm text-muted-foreground">
                      Within 1 business day<br />
                      Mon – Fri, 09:00 – 18:00 CET
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-xl p-5 bg-muted/20">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Useful Links</h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li><a href="/faq" className="text-primary hover:underline">Frequently Asked Questions</a></li>
                <li><a href="/refunds" className="text-primary hover:underline">Refund Policy</a></li>
                <li><a href="/withdrawal" className="text-primary hover:underline">Right of Withdrawal</a></li>
                <li><a href="/terms" className="text-primary hover:underline">Terms and Conditions</a></li>
              </ul>
            </div>

            <div className="border border-border rounded-xl p-5 bg-muted/20">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">ODR Platform</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                EU consumers may use the European Commission's Online Dispute Resolution platform to resolve disputes:{" "}
                <a
                  href="https://ec.europa.eu/consumers/odr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  ec.europa.eu/consumers/odr
                </a>
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-6">Send Us a Message</h2>

              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Message Received</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    Thank you for contacting us. We'll respond to your enquiry at your email address within 1 business day.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="name">
                        Full Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        placeholder="Your full name"
                        className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="email">
                        Email Address <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="your@email.com"
                        className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="orderRef">
                        Order Reference
                      </label>
                      <input
                        id="orderRef"
                        type="text"
                        placeholder="e.g. NK-20250502-0001"
                        className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        value={formData.orderRef}
                        onChange={(e) => setFormData({ ...formData, orderRef: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="subject">
                        Subject <span className="text-destructive">*</span>
                      </label>
                      <select
                        id="subject"
                        required
                        className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      >
                        <option value="">Select a topic...</option>
                        <option value="key-not-working">License key not working</option>
                        <option value="key-not-received">Key not received</option>
                        <option value="refund">Refund request</option>
                        <option value="invoice">Invoice request</option>
                        <option value="compatibility">Compatibility question</option>
                        <option value="other">Other enquiry</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="message">
                      Message <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      placeholder="Please describe your issue or question in as much detail as possible..."
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <div className="text-xs text-muted-foreground leading-relaxed">
                    By submitting this form, you agree to our{" "}
                    <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
                    Your data will be used only to respond to your enquiry.
                  </div>

                  <Button type="submit" className="w-full h-11 font-semibold">
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
