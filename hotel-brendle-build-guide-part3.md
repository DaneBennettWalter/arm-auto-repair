# Hotel Brendle - Complete Build Guide (Part 3)
**Continuation of hotel-brendle-build-guide-part2.md**

---

## Phase 5: Email System (Gmail API)

### Step 1: Set Up Google Workspace & Gmail API

**Prerequisites:**
1. Google Workspace account for brendlehotel.com domain
2. howdy@brendlehotel.com email configured

**Google Cloud Console setup:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "Hotel Brendle Booking System"
3. Enable Gmail API:
   - APIs & Services → Library
   - Search "Gmail API"
   - Enable
4. Create Service Account:
   - IAM & Admin → Service Accounts
   - Create Service Account: "hotel-booking-mailer"
   - Grant role: "Service Account Token Creator"
   - Create key → JSON → Download
5. Enable Domain-Wide Delegation:
   - Edit service account
   - Show Domain-Wide Delegation
   - Enable
   - Copy Client ID
6. Authorize in Google Workspace Admin:
   - admin.google.com → Security → API Controls → Domain-wide Delegation
   - Add Client ID
   - Scopes: `https://www.googleapis.com/auth/gmail.send`

**Alternative (simpler for MVP): Use Resend**

If Gmail API setup is too complex initially, use Resend as temporary solution:

```bash
npm install resend
```

### Step 2: Email Client (Gmail API)

**`lib/gmail.ts`:**

```typescript
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const SENDER_EMAIL = process.env.GMAIL_SENDER_EMAIL || 'howdy@brendlehotel.com';

// Initialize OAuth2 client
const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    // Create email message
    const messageParts = [
      `From: Hotel Brendle <${SENDER_EMAIL}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      html,
    ];

    const message = messageParts.join('\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send via Gmail API
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log('Email sent:', result.data.id);
    return { success: true, messageId: result.data.id };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
```

**Alternative: Resend client (`lib/resend.ts`):**

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Hotel Brendle <howdy@brendlehotel.com>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    console.log('Email sent:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
```

### Step 3: Email Templates

**`lib/email-templates.ts`:**

```typescript
import { HOTEL_INFO } from './constants';
import { formatCurrency, formatDate } from './utils';

interface BookingConfirmationData {
  guest_name: string;
  confirmation_code: string;
  room_number: string;
  check_in: string;
  check_out: string;
  nights: number;
  total_amount: number;
}

export function bookingConfirmationEmail(data: BookingConfirmationData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #4A3728; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #5FB3B3; color: white; padding: 30px 20px; text-center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: white; padding: 30px 20px; }
    .confirmation-code { background: #E8DCC4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
    .confirmation-code .code { font-size: 32px; font-weight: bold; color: #5FB3B3; letter-spacing: 4px; }
    .details { margin: 20px 0; }
    .details table { width: 100%; border-collapse: collapse; }
    .details td { padding: 10px; border-bottom: 1px solid #E8DCC4; }
    .details td:first-child { font-weight: bold; width: 40%; }
    .footer { background: #4A3728; color: white; padding: 20px; text-center; font-size: 14px; }
    .cta-button { display: inline-block; background: #5FB3B3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Hotel Brendle</h1>
      <p>Booking Confirmation</p>
    </div>
    
    <div class="content">
      <h2>Thank you, ${data.guest_name}!</h2>
      <p>Your reservation at Hotel Brendle has been confirmed. We look forward to welcoming you!</p>
      
      <div class="confirmation-code">
        <p style="margin: 0; font-size: 14px; color: #8B7355;">Your Confirmation Code</p>
        <p class="code">${data.confirmation_code}</p>
      </div>
      
      <div class="details">
        <table>
          <tr>
            <td>Room</td>
            <td>Room ${data.room_number}</td>
          </tr>
          <tr>
            <td>Check-in</td>
            <td>${formatDate(new Date(data.check_in))} at ${HOTEL_INFO.checkInTime}</td>
          </tr>
          <tr>
            <td>Check-out</td>
            <td>${formatDate(new Date(data.check_out))} at ${HOTEL_INFO.checkOutTime}</td>
          </tr>
          <tr>
            <td>Nights</td>
            <td>${data.nights}</td>
          </tr>
          <tr>
            <td>Total Paid</td>
            <td><strong>${formatCurrency(data.total_amount)}</strong></td>
          </tr>
        </table>
      </div>
      
      <h3>Check-in Instructions</h3>
      <p>Please arrive during our check-in hours (${HOTEL_INFO.checkInTime}) and present your confirmation code at the front desk.</p>
      
      <h3>Cancellation Policy</h3>
      <p>Cancellations made 48 hours before check-in are eligible for a full refund. Please contact us if you need to modify or cancel your reservation.</p>
      
      <h3>Contact Us</h3>
      <p>
        <strong>Phone:</strong> <a href="tel:${HOTEL_INFO.phone}">${HOTEL_INFO.phone}</a><br>
        <strong>Email:</strong> <a href="mailto:${HOTEL_INFO.email}">${HOTEL_INFO.email}</a><br>
        <strong>Address:</strong> ${HOTEL_INFO.address}
      </p>
      
      <p style="margin-top: 30px;">We look forward to hosting you!</p>
      <p>— The Hotel Brendle Team</p>
    </div>
    
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Hotel Brendle. All rights reserved.</p>
      <p>${HOTEL_INFO.address}</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function adminBookingNotificationEmail(data: BookingConfirmationData & { guest_email: string; guest_phone: string }): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Booking</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #5FB3B3; color: white; padding: 20px; }
    .content { padding: 20px; background: #f9f9f9; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    td { padding: 8px; border-bottom: 1px solid #ddd; }
    td:first-child { font-weight: bold; width: 40%; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>New Booking Received</h2>
    </div>
    <div class="content">
      <p>A new booking has been made for Hotel Brendle.</p>
      <table>
        <tr><td>Confirmation Code</td><td>${data.confirmation_code}</td></tr>
        <tr><td>Guest Name</td><td>${data.guest_name}</td></tr>
        <tr><td>Guest Email</td><td><a href="mailto:${data.guest_email}">${data.guest_email}</a></td></tr>
        <tr><td>Guest Phone</td><td><a href="tel:${data.guest_phone}">${data.guest_phone}</a></td></tr>
        <tr><td>Room</td><td>${data.room_number}</td></tr>
        <tr><td>Check-in</td><td>${formatDate(new Date(data.check_in))}</td></tr>
        <tr><td>Check-out</td><td>${formatDate(new Date(data.check_out))}</td></tr>
        <tr><td>Nights</td><td>${data.nights}</td></tr>
        <tr><td>Total Amount</td><td>${formatCurrency(data.total_amount)}</td></tr>
      </table>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/bookings/${data.confirmation_code}" style="background: #5FB3B3; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 4px;">View in Admin Panel</a></p>
    </div>
  </div>
</body>
</html>
  `;
}

export function checkInReminderEmail(data: BookingConfirmationData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Check-in Reminder</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #4A3728; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #5FB3B3; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Check-in Tomorrow!</h2>
    </div>
    <div class="content">
      <p>Hi ${data.guest_name},</p>
      <p>Just a friendly reminder that your check-in at Hotel Brendle is tomorrow!</p>
      <p><strong>Check-in:</strong> ${formatDate(new Date(data.check_in))} at ${HOTEL_INFO.checkInTime}</p>
      <p><strong>Room:</strong> ${data.room_number}</p>
      <p><strong>Confirmation Code:</strong> ${data.confirmation_code}</p>
      <p>Please present your confirmation code at the front desk when you arrive.</p>
      <p>If you have any questions or need to make changes, please don't hesitate to contact us at ${HOTEL_INFO.phone}.</p>
      <p>Safe travels!</p>
      <p>— Hotel Brendle</p>
    </div>
  </div>
</body>
</html>
  `;
}
```

### Step 4: Send Confirmation Email After Payment

**Update webhook handler in `app/api/webhooks/stripe/route.ts`:**

```typescript
// Add import at top
import { sendEmail } from '@/lib/gmail'; // or '@/lib/resend'
import { bookingConfirmationEmail, adminBookingNotificationEmail } from '@/lib/email-templates';

// Update handlePaymentSuccess function:
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata.booking_id;

  if (!bookingId) {
    console.error('No booking_id in payment intent metadata');
    return;
  }

  try {
    // Update booking status
    const { data: booking, error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({
        payment_status: 'paid',
        stripe_payment_intent_id: paymentIntent.id,
        stripe_charge_id: paymentIntent.latest_charge as string,
        paid_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select(`
        *,
        rooms (room_number)
      `)
      .single();

    if (updateError || !booking) {
      console.error('Error updating booking after payment:', updateError);
      return;
    }

    console.log(`Booking ${bookingId} marked as paid`);

    // Send confirmation email to guest
    const guestEmailResult = await sendEmail({
      to: booking.guest_email,
      subject: `Booking Confirmation - ${booking.confirmation_code}`,
      html: bookingConfirmationEmail({
        guest_name: booking.guest_name,
        confirmation_code: booking.confirmation_code,
        room_number: booking.rooms.room_number,
        check_in: booking.check_in,
        check_out: booking.check_out,
        nights: booking.nights,
        total_amount: booking.total_amount,
      }),
    });

    if (guestEmailResult.success) {
      // Mark confirmation as sent
      await supabaseAdmin
        .from('bookings')
        .update({
          confirmation_sent: true,
          confirmation_sent_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      console.log('Confirmation email sent to guest');
    }

    // Send notification to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'dane@brendlehotel.com',
      subject: `New Booking: ${booking.confirmation_code}`,
      html: adminBookingNotificationEmail({
        guest_name: booking.guest_name,
        guest_email: booking.guest_email,
        guest_phone: booking.guest_phone,
        confirmation_code: booking.confirmation_code,
        room_number: booking.rooms.room_number,
        check_in: booking.check_in,
        check_out: booking.check_out,
        nights: booking.nights,
        total_amount: booking.total_amount,
      }),
    });

    console.log('Admin notification sent');
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}
```

### Step 5: Contact Form Email Handler

**`app/api/contact/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/gmail'; // or '@/lib/resend'
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = contactSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400 }
      );
    }

    const { name, email, phone, message } = validation.data;

    // Send to admin
    const result = await sendEmail({
      to: process.env.ADMIN_EMAIL || 'dane@brendlehotel.com',
      subject: `Contact Form: ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Step 6: Commit Email System

```bash
git add .
git commit -m "Email system: Gmail API/Resend integration, templates, confirmations"
git push
```

---

## Phase 6: Admin Dashboard

### Step 1: Admin Authentication

**`lib/auth.ts`:**

```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { supabaseAdmin } from './supabase';

const JWT_SECRET = process.env.JWT_SECRET!;
const TOKEN_NAME = 'admin_token';

export interface AdminSession {
  id: number;
  email: string;
  name: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(admin: AdminSession): string {
  return jwt.sign(admin, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AdminSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminSession;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;

  if (!token) return null;

  return verifyToken(token);
}

export async function requireAdmin(request: NextRequest): Promise<AdminSession> {
  const token = request.cookies.get(TOKEN_NAME)?.value;

  if (!token) {
    throw new Error('Unauthorized');
  }

  const session = verifyToken(token);

  if (!session) {
    throw new Error('Invalid session');
  }

  return session;
}

export async function loginAdmin(email: string, password: string): Promise<{ token: string; admin: AdminSession } | null> {
  const { data: admin, error } = await supabaseAdmin
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .eq('is_active', true)
    .single();

  if (error || !admin) {
    return null;
  }

  const passwordValid = await verifyPassword(password, admin.password_hash);

  if (!passwordValid) {
    return null;
  }

  // Update last login
  await supabaseAdmin
    .from('admin_users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', admin.id);

  const session: AdminSession = {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  };

  const token = generateToken(session);

  return { token, admin: session };
}

export async function logoutAdmin() {
  const cookieStore = cookies();
  cookieStore.delete(TOKEN_NAME);
}
```

### Step 2: Admin Login Page

**`app/admin/login/page.tsx`:**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Redirect to admin dashboard
      router.push('/admin/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-desert flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <h1 className="font-heading text-3xl font-bold text-center mb-6">
            Admin Login
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="p-3 bg-rust/10 border border-rust rounded-lg text-rust text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-turquoise hover:bg-turquoise-dark"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

**`app/api/admin/login/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { loginAdmin } from '@/lib/auth';
import { adminLoginSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = adminLoginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;
    const result = await loginAdmin(email, password);

    if (!result) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Set cookie
    const response = NextResponse.json({ success: true, admin: result.admin });
    response.cookies.set('admin_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Step 3: Admin Layout with Navigation

**`app/admin/layout.tsx`:**

```typescript
import { redirect } from 'next/navigation';
import { getAdminSession, logoutAdmin } from '@/lib/auth';
import AdminNav from '@/components/layout/AdminNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // Redirect to login if not authenticated
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav session={session} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
```

**`components/layout/AdminNav.tsx`:**

```typescript
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { AdminSession } from '@/lib/auth';

export default function AdminNav({ session }: { session: AdminSession }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/bookings', label: 'Bookings' },
    { href: '/admin/rooms', label: 'Rooms' },
    { href: '/admin/settings', label: 'Settings' },
  ];

  return (
    <nav className="bg-clay text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/admin/dashboard" className="font-heading text-2xl font-bold">
            Hotel Brendle Admin
          </Link>

          <div className="hidden md:flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded transition-colors ${
                  pathname === item.href
                    ? 'bg-turquoise text-white'
                    : 'hover:bg-clay/80'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm">{session.name}</span>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-clay"
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
```

### Step 4: Admin Dashboard (Stats Overview)

**`app/admin/dashboard/page.tsx`:**

```typescript
import { Card, CardContent } from '@/components/ui/card';
import { supabaseAdmin } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

export const metadata = {
  title: 'Dashboard | Hotel Brendle Admin',
};

export default async function AdminDashboardPage() {
  // Fetch stats
  const [
    { count: totalRooms },
    { count: availableRooms },
    { count: upcomingBookings },
    { count: currentGuests },
    { data: recentBookings },
  ] = await Promise.all([
    supabaseAdmin.from('rooms').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('rooms').select('*', { count: 'exact', head: true }).eq('status', 'available'),
    supabaseAdmin.from('bookings').select('*', { count: 'exact', head: true })
      .eq('booking_status', 'confirmed')
      .gte('check_in', new Date().toISOString().split('T')[0]),
    supabaseAdmin.from('bookings').select('*', { count: 'exact', head: true })
      .eq('booking_status', 'checked_in'),
    supabaseAdmin.from('bookings').select(`
      *,
      rooms (room_number)
    `).order('created_at', { ascending: false }).limit(5),
  ]);

  // Calculate revenue (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: revenueData } = await supabaseAdmin
    .from('bookings')
    .select('total_amount')
    .eq('payment_status', 'paid')
    .gte('created_at', thirtyDaysAgo.toISOString());

  const monthlyRevenue = revenueData?.reduce((sum, booking) => sum + booking.total_amount, 0) || 0;

  const stats = [
    { label: 'Total Rooms', value: totalRooms || 0, icon: '🏠' },
    { label: 'Available', value: availableRooms || 0, icon: '✓' },
    { label: 'Upcoming Bookings', value: upcomingBookings || 0, icon: '📅' },
    { label: 'Current Guests', value: currentGuests || 0, icon: '👥' },
    { label: 'Revenue (30d)', value: formatCurrency(monthlyRevenue), icon: '💰' },
  ];

  return (
    <div>
      <h1 className="font-heading text-4xl font-bold text-clay mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="text-3xl font-bold text-clay">{stat.value}</p>
              <p className="text-sm text-earth">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardContent className="p-6">
          <h2 className="font-heading text-2xl font-bold mb-4">Recent Bookings</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-earth/20">
                  <th className="text-left py-2">Code</th>
                  <th className="text-left py-2">Guest</th>
                  <th className="text-left py-2">Room</th>
                  <th className="text-left py-2">Check-in</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings?.map((booking: any) => (
                  <tr key={booking.id} className="border-b border-earth/10">
                    <td className="py-3 font-mono text-sm">{booking.confirmation_code}</td>
                    <td className="py-3">{booking.guest_name}</td>
                    <td className="py-3">{booking.rooms.room_number}</td>
                    <td className="py-3">{new Date(booking.check_in).toLocaleDateString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        booking.payment_status === 'paid' ? 'bg-sage/20 text-sage' : 'bg-sunset/20 text-sunset'
                      }`}>
                        {booking.payment_status}
                      </span>
                    </td>
                    <td className="py-3 text-right">{formatCurrency(booking.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Step 5: Bookings Management Page

**`app/admin/bookings/page.tsx`:**

```typescript
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/utils';

export const metadata = {
  title: 'Bookings | Hotel Brendle Admin',
};

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  let query = supabaseAdmin
    .from('bookings')
    .select(`
      *,
      rooms (room_number)
    `)
    .order('check_in', { ascending: false });

  if (searchParams.status) {
    query = query.eq('booking_status', searchParams.status);
  }

  const { data: bookings, error } = await query;

  if (error) {
    console.error('Error fetching bookings:', error);
    return <div>Error loading bookings</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-heading text-4xl font-bold text-clay">Bookings</h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6">
        {['all', 'confirmed', 'checked_in', 'checked_out', 'cancelled'].map((status) => (
          <Link
            key={status}
            href={`/admin/bookings${status !== 'all' ? `?status=${status}` : ''}`}
          >
            <Button
              variant={(!searchParams.status && status === 'all') || searchParams.status === status ? 'default' : 'outline'}
              className={(!searchParams.status && status === 'all') || searchParams.status === status ? 'bg-turquoise' : ''}
            >
              {status.replace('_', ' ').toUpperCase()}
            </Button>
          </Link>
        ))}
      </div>

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-earth/20">
                  <th className="text-left py-3">Code</th>
                  <th className="text-left py-3">Guest</th>
                  <th className="text-left py-3">Room</th>
                  <th className="text-left py-3">Check-in</th>
                  <th className="text-left py-3">Check-out</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-left py-3">Payment</th>
                  <th className="text-right py-3">Amount</th>
                  <th className="text-right py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking: any) => (
                  <tr key={booking.id} className="border-b border-earth/10 hover:bg-desert/30">
                    <td className="py-4">
                      <Link href={`/admin/bookings/${booking.id}`} className="font-mono text-sm text-turquoise hover:underline">
                        {booking.confirmation_code}
                      </Link>
                    </td>
                    <td className="py-4">
                      <div>
                        <p className="font-semibold">{booking.guest_name}</p>
                        <p className="text-xs text-earth">{booking.guest_email}</p>
                      </div>
                    </td>
                    <td className="py-4">{booking.rooms.room_number}</td>
                    <td className="py-4">{formatDate(new Date(booking.check_in))}</td>
                    <td className="py-4">{formatDate(new Date(booking.check_out))}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        booking.booking_status === 'confirmed' ? 'bg-turquoise/20 text-turquoise-dark' :
                        booking.booking_status === 'checked_in' ? 'bg-sage/20 text-sage' :
                        booking.booking_status === 'checked_out' ? 'bg-earth/20 text-earth' :
                        'bg-rust/20 text-rust'
                      }`}>
                        {booking.booking_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        booking.payment_status === 'paid' ? 'bg-sage/20 text-sage' :
                        booking.payment_status === 'pending' ? 'bg-sunset/20 text-sunset' :
                        'bg-rust/20 text-rust'
                      }`}>
                        {booking.payment_status}
                      </span>
                    </td>
                    <td className="py-4 text-right font-semibold">
                      {formatCurrency(booking.total_amount)}
                    </td>
                    <td className="py-4 text-right">
                      <Link href={`/admin/bookings/${booking.id}`}>
                        <Button size="sm" variant="outline">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {bookings.length === 0 && (
              <p className="text-center text-earth py-8">No bookings found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Step 6: Commit Admin Dashboard

```bash
git add .
git commit -m "Admin dashboard: auth, stats, bookings list, navigation"
git push
```

---

_(Continuing with Testing, Deployment, and remaining sections in a final summary document...)_

**Next sections needed:**
- Phase 7: Testing & QA
- Phase 8: Deployment to Vercel
- Phase 9: DNS Configuration
- Phase 10: Post-Launch Monitoring
- Security Checklist
- Performance Optimization
- SEO & Analytics Setup
- Maintenance Procedures

Would you like me to create a final Part 4 with these remaining critical sections?
