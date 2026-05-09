import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { fetchWithAuth, logout, getStoredUser, setStoredUser, isLoggedIn } from "@/lib/user-auth";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Package, MapPin, MessageSquare, LogOut, User, Plus, Trash2, Edit2, Check, Loader2, ChevronRight, Star } from "lucide-react";
import { USAddressFields, type AddressData } from "@/components/us-address-fields";
import { US_STATE_CODES, validateZip } from "@/lib/us-address-data";

type Section = "overview" | "orders" | "addresses" | "contact";

export default function AccountPage() {
  const [, setLocation] = useLocation();
  const [section, setSection] = useState<Section>("overview");
  const [user, setUser] = useState<any>(getStoredUser());
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingAddr, setLoadingAddr] = useState(false);
  const [msgSent, setMsgSent] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgForm, setMsgForm] = useState({ name: user ? `${user.firstName||""} ${user.lastName||""}`.trim() : "", email: user?.email||"", subject: "", message: "" });
  const [addrForm, setAddrForm] = useState({ label:"Home", firstName:"", lastName:"", street:"", city:"", state:"", zip:"", country:"United States", isDefault:false });
  const [addrErrors, setAddrErrors] = useState<Record<string,string>>({});

  function validateAddrForm() {
    const e: Record<string,string> = {};
    if (!addrForm.street.trim()) e.address = "Street address is required";
    if (!addrForm.city.trim()) e.city = "City is required";
    if (!addrForm.state.trim()) e.state = "State is required";
    else if (!US_STATE_CODES.has(addrForm.state)) e.state = "Select a valid US state";
    if (!addrForm.zip.trim()) e.zip = "ZIP is required";
    else if (!validateZip(addrForm.zip)) e.zip = "Invalid ZIP format";
    return e;
  }
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddr, setEditingAddr] = useState<number|null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) { setLocation("/account/auth"); return; }
    fetchWithAuth("/api/auth/me").then(r => r.json()).then(u => { setUser(u); setStoredUser(u); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (section === "orders" && orders.length === 0) {
      setLoadingOrders(true);
      fetchWithAuth("/api/user/orders").then(r => r.json()).then(setOrders).catch(() => {}).finally(() => setLoadingOrders(false));
    }
    if (section === "addresses") {
      setLoadingAddr(true);
      fetchWithAuth("/api/user/addresses").then(r => r.json()).then(setAddresses).catch(() => {}).finally(() => setLoadingAddr(false));
    }
  }, [section]);

  const handleLogout = () => {
    logout();
    window.dispatchEvent(new Event("user-auth-changed"));
    setLocation("/");
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateAddrForm();
    if (Object.keys(errs).length > 0) { setAddrErrors(errs); return; }
    setAddrErrors({});
    try {
      if (editingAddr !== null) {
        await fetchWithAuth(`/api/user/addresses/${editingAddr}`, { method: "PUT", body: JSON.stringify(addrForm) });
      } else {
        await fetchWithAuth("/api/user/addresses", { method: "POST", body: JSON.stringify(addrForm) });
      }
      setLoadingAddr(true);
      fetchWithAuth("/api/user/addresses").then(r => r.json()).then(setAddresses).finally(() => setLoadingAddr(false));
      setShowAddrForm(false); setEditingAddr(null);
      setAddrForm({ label:"Home", firstName:"", lastName:"", street:"", city:"", state:"", zip:"", country:"United States", isDefault:false });
    } catch {}
  };

  const handleDeleteAddr = async (id: number) => {
    if (!confirm("Delete this address?")) return;
    await fetchWithAuth(`/api/user/addresses/${id}`, { method: "DELETE" });
    setAddresses(a => a.filter(x => x.id !== id));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsgLoading(true);
    try {
      await fetchWithAuth("/api/user/messages", { method: "POST", body: JSON.stringify(msgForm) });
      setMsgSent(true);
    } catch {} finally { setMsgLoading(false); }
  };

  const navItems: { key: Section; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: User },
    { key: "orders", label: "My Orders", icon: Package },
    { key: "addresses", label: "Addresses", icon: MapPin },
    { key: "contact", label: "Contact Us", icon: MessageSquare },
  ];

  const displayName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email : "Account";

  return (
    <Layout>
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex gap-6">

            {/* Sidebar */}
            <div className="w-64 flex-shrink-0 hidden md:block">
              <div className="bg-card border border-border rounded-2xl p-4 sticky top-24">
                <div className="px-2 pb-4 mb-4 border-b border-border">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-semibold text-foreground text-sm">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <nav className="space-y-1">
                  {navItems.map(({ key, label, icon: Icon }) => (
                    <button key={key} onClick={() => setSection(key)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${section === key ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                      <Icon className="w-4 h-4" /> {label}
                    </button>
                  ))}
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors mt-2">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </nav>
              </div>
            </div>

            {/* Mobile nav */}
            <div className="md:hidden w-full mb-4">
              <div className="bg-card border border-border rounded-xl p-3 flex gap-2 overflow-x-auto">
                {navItems.map(({ key, label, icon: Icon }) => (
                  <button key={key} onClick={() => setSection(key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors ${section === key ? "bg-primary text-white font-bold" : "bg-muted text-muted-foreground"}`}>
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </button>
                ))}
                <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs bg-red-50 text-red-500 whitespace-nowrap">
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">

              {/* OVERVIEW */}
              {section === "overview" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-serif font-bold text-foreground">Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {navItems.slice(1).map(({ key, label, icon: Icon }) => (
                      <button key={key} onClick={() => setSection(key)}
                        className="bg-card border border-border rounded-2xl p-5 text-left hover:border-primary/40 hover:shadow-md transition-all group">
                        <Icon className="w-6 h-6 text-primary mb-3" />
                        <p className="font-semibold text-foreground">{label}</p>
                        <div className="flex items-center gap-1 text-xs text-primary mt-1 group-hover:gap-2 transition-all">
                          <span>View</span><ChevronRight className="w-3 h-3" />
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h3 className="font-semibold text-foreground mb-3">Account Details</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p><span className="text-foreground font-medium">Name:</span> {displayName || "—"}</p>
                      <p><span className="text-foreground font-medium">Email:</span> {user?.email}</p>
                      <p><span className="text-foreground font-medium">Phone:</span> {user?.phone || "—"}</p>
                      <p><span className="text-foreground font-medium">Member since:</span> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" }) : "—"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ORDERS */}
              {section === "orders" && (
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-4">My Orders</h2>
                  {loadingOrders ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                  ) : orders.length === 0 ? (
                    <div className="bg-card border border-border rounded-2xl p-10 text-center">
                      <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-foreground font-medium">No orders yet</p>
                      <p className="text-sm text-muted-foreground mt-1">Your orders will appear here once you make a purchase.</p>
                      <Button onClick={() => setLocation("/catalog")} className="mt-4 bg-primary text-white hover:bg-primary/90">Browse Catalog</Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map(o => (
                        <div key={o.id} className="bg-card border border-border rounded-2xl p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-mono text-sm font-bold text-foreground">#{o.id?.slice(0,12)}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{new Date(o.created_at).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" })}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono font-bold text-foreground">${(o.amount_cents / 100).toFixed(2)}</p>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${o.status === "paid" ? "bg-green-100 text-green-700" : o.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}`}>
                                {o.status?.toUpperCase()}
                              </span>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ADDRESSES */}
              {section === "addresses" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-serif font-bold text-foreground">Addresses</h2>
                    <Button onClick={() => { setShowAddrForm(true); setEditingAddr(null); setAddrForm({ label:"Home", firstName:"", lastName:"", street:"", city:"", state:"", zip:"", country:"United States", isDefault:false }); }}
                      className="bg-primary text-white hover:bg-primary/90 h-9 px-4 text-sm rounded-xl">
                      <Plus className="w-4 h-4 mr-1" /> Add Address
                    </Button>
                  </div>

                  {showAddrForm && (
                    <div className="bg-card border border-primary/30 rounded-2xl p-5 mb-4">
                      <h3 className="font-semibold text-foreground mb-4">{editingAddr !== null ? "Edit Address" : "New Address"}</h3>
                      <form onSubmit={handleSaveAddress} className="space-y-3">
                        <input value={addrForm.label} onChange={e => setAddrForm(p=>({...p,label:e.target.value}))} placeholder="Label (Home, Work...)"
                          className="w-full h-10 px-3 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <div className="grid grid-cols-2 gap-3">
                          <input value={addrForm.firstName} onChange={e => setAddrForm(p=>({...p,firstName:e.target.value}))} placeholder="First Name"
                            className="h-10 px-3 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                          <input value={addrForm.lastName} onChange={e => setAddrForm(p=>({...p,lastName:e.target.value}))} placeholder="Last Name"
                            className="h-10 px-3 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                        <USAddressFields
                          value={{ address: addrForm.street, address2: "", city: addrForm.city, state: addrForm.state, zip: addrForm.zip, country: addrForm.country }}
                          onChange={(v: AddressData) => setAddrForm(p => ({ ...p, street: v.address, city: v.city, state: v.state, zip: v.zip, country: v.country }))}
                          errors={addrErrors}
                          showAddress2={false}
                        />
                        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                          <input type="checkbox" checked={addrForm.isDefault} onChange={e => setAddrForm(p=>({...p,isDefault:e.target.checked}))} className="rounded" />
                          Set as default address
                        </label>
                        <div className="flex gap-2">
                          <Button type="submit" className="bg-primary text-white hover:bg-primary/90 h-9 px-4 text-sm rounded-xl">Save</Button>
                          <Button type="button" variant="outline" onClick={() => setShowAddrForm(false)} className="h-9 px-4 text-sm rounded-xl">Cancel</Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {loadingAddr ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                  ) : addresses.length === 0 ? (
                    <div className="bg-card border border-border rounded-2xl p-10 text-center">
                      <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-foreground font-medium">No addresses saved</p>
                      <p className="text-sm text-muted-foreground mt-1">Add a shipping address for faster checkout.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map(a => (
                        <div key={a.id} className="bg-card border border-border rounded-2xl p-4 flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-foreground text-sm">{a.label}</p>
                              {a.is_default && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5"><Check className="w-3 h-3" /> Default</span>}
                            </div>
                            <p className="text-sm text-muted-foreground">{[a.first_name, a.last_name].filter(Boolean).join(" ")}</p>
                            <p className="text-sm text-muted-foreground">{a.street}</p>
                            <p className="text-sm text-muted-foreground">{a.city}, {a.state} {a.zip}</p>
                            <p className="text-sm text-muted-foreground">{a.country}</p>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => { setEditingAddr(a.id); setAddrForm({ label:a.label, firstName:a.first_name||"", lastName:a.last_name||"", street:a.street, city:a.city, state:a.state, zip:a.zip, country:a.country, isDefault:a.is_default }); setShowAddrForm(true); }}
                              className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteAddr(a.id)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* CONTACT */}
              {section === "contact" && (
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Contact Us</h2>
                  {msgSent ? (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                      <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-foreground font-semibold text-lg">Message sent!</p>
                      <p className="text-sm text-muted-foreground mt-1">We'll get back to you within 24 hours.</p>
                      <Button onClick={() => { setMsgSent(false); setMsgForm(p => ({...p, subject:"", message:""})); }} variant="outline" className="mt-4 rounded-xl">Send another</Button>
                    </div>
                  ) : (
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <p className="text-sm text-muted-foreground mb-5">Have a question about your order or our products? We're here to help.</p>
                      <form onSubmit={handleSendMessage} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Name *</label>
                            <input required value={msgForm.name} onChange={e => setMsgForm(p=>({...p,name:e.target.value}))}
                              className="w-full h-10 px-3 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Email *</label>
                            <input type="email" required value={msgForm.email} onChange={e => setMsgForm(p=>({...p,email:e.target.value}))}
                              className="w-full h-10 px-3 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Subject</label>
                          <input value={msgForm.subject} onChange={e => setMsgForm(p=>({...p,subject:e.target.value}))}
                            className="w-full h-10 px-3 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="Order inquiry, product question..." />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Message *</label>
                          <textarea required value={msgForm.message} onChange={e => setMsgForm(p=>({...p,message:e.target.value}))} rows={5}
                            className="w-full px-3 py-2.5 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                            placeholder="Write your message here..." />
                        </div>
                        <Button type="submit" disabled={msgLoading} className="bg-primary text-white hover:bg-primary/90 h-11 px-6 font-bold rounded-xl">
                          {msgLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Send Message
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
