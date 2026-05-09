import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { rateLimit } from "express-rate-limit";

// ── US address validation ─────────────────────────────────────────────────────
const US_STATE_CODES_SET = new Set(["AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"]);
function validateAddressInput(body: any): string | null {
  if (!body.street?.trim()) return "Street address is required";
  if (!body.city?.trim()) return "City is required";
  if (!body.state?.trim()) return "State is required";
  if (!US_STATE_CODES_SET.has((body.state as string).toUpperCase().trim())) return "Invalid US state code";
  if (!body.zip?.trim()) return "ZIP code is required";
  if (!/^\d{5}(-\d{4})?$/.test((body.zip as string).trim())) return "Invalid ZIP code format (e.g. 12345 or 12345-6789)";
  return null;
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: { error: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});


// ── Email helper ─────────────────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string) {
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.RESEND_API_KEY}` },
      body: JSON.stringify({ from: "NovariPartners <noreply@novaripartnersllc.com>", to, subject, html }),
    });
  } catch {}
}

function welcomeEmailHtml(firstName: string) {
  return `<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px;color:#111;">
    <h2 style="font-family:Georgia,serif;color:#111;">Welcome to NovariPartners, ${firstName || ""}!</h2>
    <p style="color:#555;font-size:15px;line-height:1.6;">Your account has been created successfully. You can now track your orders, save shipping addresses, and contact our team directly from your account dashboard.</p>
    <a href="https://novaripartners.com/account" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#b45309;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">View My Account</a>
    <p style="color:#aaa;font-size:12px;margin-top:28px;border-top:1px solid #eee;padding-top:16px;">NOVARI PARTNERS LLC — 30 N Gould St Ste R, Sheridan, WY 82801<br>Questions? <a href="mailto:contact@novaripartnersllc.com" style="color:#b45309;">contact@novaripartnersllc.com</a></p>
  </div>`;
}

function resetEmailHtml(resetUrl: string) {
  return `<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px;color:#111;">
    <h2 style="font-family:Georgia,serif;">Reset Your Password</h2>
    <p style="color:#555;font-size:15px;line-height:1.6;">We received a request to reset your password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
    <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#b45309;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Reset Password</a>
    <p style="color:#888;font-size:13px;">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
    <p style="color:#aaa;font-size:12px;margin-top:28px;border-top:1px solid #eee;padding-top:16px;">NOVARI PARTNERS LLC — 30 N Gould St Ste R, Sheridan, WY 82801</p>
  </div>`;
}

const router = Router();
const SALT_ROUNDS = 12;

function getUserSecret(): string {
  return (process.env.JWT_SECRET || 'fallback_secret') + '_user';
}
function signToken(userId: number, email: string): string {
  return jwt.sign({ userId, email, type: 'user' }, getUserSecret(), { expiresIn: '30d' });
}

async function verifyUserToken(req: any, res: Response, next: NextFunction) {
  const auth = req.headers['authorization'] as string;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' });
  try {
    const payload = jwt.verify(auth.slice(7), getUserSecret()) as any;
    if (payload.type !== 'user') throw new Error('Invalid token type');
    req.userId = payload.userId;
    req.userEmail = payload.email;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// POST /api/auth/register
router.post('/auth/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    const existing = await db.execute(sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}`);
    if ((existing.rows as any[]).length > 0) return res.status(409).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await db.execute(sql`
      INSERT INTO users (email, password_hash, first_name, last_name, phone)
      VALUES (${email.toLowerCase()}, ${hash}, ${firstName||null}, ${lastName||null}, ${phone||null})
      RETURNING id, email, first_name, last_name, phone, created_at
    `);
    const user = (result.rows as any[])[0];
    const token = signToken(user.id, user.email);
    sendEmail(user.email, "Welcome to NovariPartners!", welcomeEmailHtml(user.first_name || "")).catch(() => {});
    return res.json({ token, user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, phone: user.phone } });
  } catch { return res.status(500).json({ error: 'Registration failed' }); }
});

// POST /api/auth/login
router.post('/auth/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const result = await db.execute(sql`SELECT * FROM users WHERE email = ${email.toLowerCase()}`);
    const user = (result.rows as any[])[0];
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
    const token = signToken(user.id, user.email);
    sendEmail(user.email, "Welcome to NovariPartners!", welcomeEmailHtml(user.first_name || "")).catch(() => {});
    return res.json({ token, user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, phone: user.phone } });
  } catch { return res.status(500).json({ error: 'Login failed' }); }
});

// GET /api/auth/me
router.get('/auth/me', verifyUserToken, async (req: any, res: Response) => {
  try {
    const result = await db.execute(sql`SELECT id, email, first_name, last_name, phone, created_at FROM users WHERE id = ${req.userId}`);
    const user = (result.rows as any[])[0];
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, phone: user.phone, createdAt: user.created_at });
  } catch { return res.status(500).json({ error: 'Failed to fetch profile' }); }
});

// PUT /api/auth/me
router.put('/auth/me', verifyUserToken, async (req: any, res: Response) => {
  try {
    const { firstName, lastName, phone } = req.body;
    await db.execute(sql`UPDATE users SET first_name=${firstName||null}, last_name=${lastName||null}, phone=${phone||null}, updated_at=NOW() WHERE id=${req.userId}`);
    return res.json({ success: true });
  } catch { return res.status(500).json({ error: 'Update failed' }); }
});

// GET /api/user/orders
router.get('/user/orders', verifyUserToken, async (req: any, res: Response) => {
  try {
    const result = await db.execute(sql`
      SELECT id, customer_name, customer_email, amount_cents, currency, status, created_at
      FROM orders WHERE user_id = ${req.userId} ORDER BY created_at DESC LIMIT 50
    `);
    return res.json(result.rows);
  } catch { return res.status(500).json({ error: 'Failed to fetch orders' }); }
});

// GET /api/user/addresses
router.get('/user/addresses', verifyUserToken, async (req: any, res: Response) => {
  try {
    const result = await db.execute(sql`SELECT * FROM addresses WHERE user_id = ${req.userId} ORDER BY is_default DESC, created_at DESC`);
    return res.json(result.rows);
  } catch { return res.status(500).json({ error: 'Failed to fetch addresses' }); }
});

// POST /api/user/addresses
router.post('/user/addresses', verifyUserToken, async (req: any, res: Response) => {
  try {
    const { label, firstName, lastName, street, city, state, zip, country, isDefault } = req.body;
    const addrErr = validateAddressInput(req.body);
    if (addrErr) return res.status(400).json({ error: addrErr });
    if (isDefault) await db.execute(sql`UPDATE addresses SET is_default=false WHERE user_id=${req.userId}`);
    const result = await db.execute(sql`
      INSERT INTO addresses (user_id, label, first_name, last_name, street, city, state, zip, country, is_default)
      VALUES (${req.userId}, ${label||'Home'}, ${firstName||null}, ${lastName||null}, ${street.trim()}, ${city.trim()}, ${state.toUpperCase().trim()}, ${zip.trim()}, ${'United States'}, ${isDefault||false})
      RETURNING *
    `);
    return res.json((result.rows as any[])[0]);
  } catch { return res.status(500).json({ error: 'Failed to save address' }); }
});

// PUT /api/user/addresses/:id
router.put('/user/addresses/:id', verifyUserToken, async (req: any, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { label, firstName, lastName, street, city, state, zip, country, isDefault } = req.body;
    const addrErr = validateAddressInput(req.body);
    if (addrErr) return res.status(400).json({ error: addrErr });
    if (isDefault) await db.execute(sql`UPDATE addresses SET is_default=false WHERE user_id=${req.userId}`);
    await db.execute(sql`
      UPDATE addresses SET label=${label||'Home'}, first_name=${firstName||null}, last_name=${lastName||null},
      street=${street.trim()}, city=${city.trim()}, state=${state.toUpperCase().trim()}, zip=${zip.trim()}, country=${'United States'}, is_default=${isDefault||false}
      WHERE id=${id} AND user_id=${req.userId}
    `);
    return res.json({ success: true });
  } catch { return res.status(500).json({ error: 'Failed to update address' }); }
});

// DELETE /api/user/addresses/:id
router.delete('/user/addresses/:id', verifyUserToken, async (req: any, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await db.execute(sql`DELETE FROM addresses WHERE id=${id} AND user_id=${req.userId}`);
    return res.json({ success: true });
  } catch { return res.status(500).json({ error: 'Failed to delete address' }); }
});

// POST /api/user/messages (no auth required)
router.post('/user/messages', async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'Name, email and message required' });
    let userId: number | null = null;
    const auth = req.headers['authorization'] as string;
    if (auth?.startsWith('Bearer ')) {
      try { const p = jwt.verify(auth.slice(7), getUserSecret()) as any; if (p.type === 'user') userId = p.userId; } catch {}
    }
    await db.execute(sql`INSERT INTO user_messages (user_id, email, name, subject, message) VALUES (${userId}, ${email}, ${name}, ${subject||null}, ${message})`);
    return res.json({ success: true });
  } catch { return res.status(500).json({ error: 'Failed to send message' }); }
});


// POST /api/auth/forgot-password
router.post('/auth/forgot-password', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const result = await db.execute(sql`SELECT id, email, first_name FROM users WHERE email = ${email.toLowerCase()}`);
    const user = (result.rows as any[])[0];
    // Always return success to prevent email enumeration
    if (!user) return res.json({ success: true });
    // Create reset token (JWT valid 1h)
    const resetToken = jwt.sign({ userId: user.id, type: 'reset' }, getUserSecret(), { expiresIn: '1h' });
    const resetUrl = `https://novaripartners.com/account/reset-password?token=${encodeURIComponent(resetToken)}`;
    await sendEmail(user.email, "Reset your NovariPartners password", resetEmailHtml(resetUrl));
    return res.json({ success: true });
  } catch { return res.status(500).json({ error: 'Failed to send reset email' }); }
});

// POST /api/auth/reset-password
router.post('/auth/reset-password', authLimiter, async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password required' });
    if (newPassword.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    let payload: any;
    try { payload = jwt.verify(token, getUserSecret()); } catch { return res.status(400).json({ error: 'Invalid or expired reset link' }); }
    if (payload.type !== 'reset') return res.status(400).json({ error: 'Invalid token' });
    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db.execute(sql`UPDATE users SET password_hash=${hash}, updated_at=NOW() WHERE id=${payload.userId}`);
    return res.json({ success: true });
  } catch { return res.status(500).json({ error: 'Failed to reset password' }); }
});

// GET /api/admin/messages
router.get('/admin/messages', async (req: Request, res: Response) => {
  try {
    const auth = req.headers['authorization'] as string;
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    jwt.verify(auth.slice(7), process.env.JWT_SECRET || '');
    const result = await db.execute(sql`SELECT * FROM user_messages ORDER BY created_at DESC LIMIT 100`);
    return res.json(result.rows);
  } catch { return res.status(401).json({ error: 'Unauthorized' }); }
});

// PUT /api/admin/messages/:id/read
router.put('/admin/messages/:id/read', async (req: Request, res: Response) => {
  try {
    const auth = req.headers['authorization'] as string;
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    jwt.verify(auth.slice(7), process.env.JWT_SECRET || '');
    await db.execute(sql`UPDATE user_messages SET read=true WHERE id=${parseInt(req.params.id)}`);
    return res.json({ success: true });
  } catch { return res.status(401).json({ error: 'Unauthorized' }); }
});

export default router;
