# Hotel Brendle - Complete Build Guide (Part 2)
**Continuation of hotel-brendle-complete-build-guide.md**

---

## Phase 3 (Continued): Booking System Core Components

### Step 3: Availability Calendar Component

**`components/booking/AvailabilityCalendar.tsx`:**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { addDays, isBefore, startOfDay } from 'date-fns';
import 'react-day-picker/dist/style.css';
import { BOOKING_RULES } from '@/lib/constants';

interface AvailabilityCalendarProps {
  checkIn: Date | null;
  checkOut: Date | null;
  onCheckInChange: (date: Date | null) => void;
  onCheckOutChange: (date: Date | null) => void;
}

export default function AvailabilityCalendar({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
}: AvailabilityCalendarProps) {
  const [selectingCheckOut, setSelectingCheckOut] = useState(false);
  
  const today = startOfDay(new Date());
  const maxDate = addDays(today, BOOKING_RULES.advanceBookingDays);
  
  // Disable dates in the past
  const disabledDays = [
    { before: BOOKING_RULES.sameDayBooking ? today : addDays(today, 1) },
    { after: maxDate },
  ];

  const handleDayClick = (date: Date) => {
    if (!selectingCheckOut) {
      // First click: set check-in
      onCheckInChange(date);
      onCheckOutChange(null);
      setSelectingCheckOut(true);
    } else {
      // Second click: set check-out
      if (checkIn && isBefore(checkIn, date)) {
        onCheckOutChange(date);
        setSelectingCheckOut(false);
      }
    }
  };

  const selectedRange = checkIn && checkOut ? { from: checkIn, to: checkOut } : undefined;

  return (
    <div>
      <div className="mb-4 text-sm text-earth">
        {!selectingCheckOut ? (
          <p>Select your <strong>check-in</strong> date</p>
        ) : (
          <p>Select your <strong>check-out</strong> date</p>
        )}
      </div>
      
      <DayPicker
        mode="range"
        selected={selectedRange}
        onDayClick={handleDayClick}
        disabled={disabledDays}
        modifiersClassNames={{
          selected: 'bg-turquoise text-white',
          today: 'text-turquoise font-bold',
        }}
        className="border border-earth/20 rounded-lg p-4"
      />

      {checkIn && checkOut && (
        <div className="mt-4 p-4 bg-turquoise-light/20 rounded-lg">
          <p className="text-sm text-clay">
            <strong>Check-in:</strong> {checkIn.toLocaleDateString()} at 3:00 PM
          </p>
          <p className="text-sm text-clay">
            <strong>Check-out:</strong> {checkOut.toLocaleDateString()} at 11:00 AM
          </p>
          <p className="text-sm text-turquoise-dark font-semibold mt-2">
            {Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))} nights
          </p>
        </div>
      )}
    </div>
  );
}
```

### Step 4: Room Selector Component

**`components/booking/RoomSelector.tsx`:**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, calculateNights } from '@/lib/utils';
import type { Room } from '@/types';

interface RoomSelectorProps {
  checkIn: Date;
  checkOut: Date;
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
}

export default function RoomSelector({
  checkIn,
  checkOut,
  selectedRoom,
  onSelectRoom,
}: RoomSelectorProps) {
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/bookings/check-availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            check_in: checkIn.toISOString().split('T')[0],
            check_out: checkOut.toISOString().split('T')[0],
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to fetch availability');
        }

        const data = await res.json();
        setAvailableRooms(data.rooms);
      } catch (err) {
        setError('Unable to load available rooms. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [checkIn, checkOut]);

  const nights = calculateNights(checkIn, checkOut);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-earth">Loading available rooms...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-rust">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (availableRooms.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-earth">No rooms available for these dates. Please try different dates.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold mb-4">Available Rooms</h2>
      <div className="space-y-4">
        {availableRooms.map((room) => {
          const totalCost = room.rate_per_night * nights;
          const isSelected = selectedRoom?.id === room.id;

          return (
            <Card
              key={room.id}
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-turquoise' : 'hover:shadow-md'
              }`}
              onClick={() => onSelectRoom(room)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-heading text-lg font-bold">
                      Room {room.room_number}
                    </h3>
                    <p className="text-sm text-earth mb-2 capitalize">{room.room_type}</p>
                    <p className="text-xs text-earth line-clamp-2">{room.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {room.amenities.slice(0, 3).map((amenity) => (
                        <span
                          key={amenity}
                          className="px-2 py-0.5 bg-turquoise-light/20 text-turquoise-dark text-xs rounded"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm text-earth">{formatCurrency(room.rate_per_night)}/night</p>
                    <p className="text-xl font-bold text-turquoise">{formatCurrency(totalCost)}</p>
                    <p className="text-xs text-earth">{nights} nights</p>
                  </div>
                </div>
                <Button
                  className={`w-full mt-4 ${
                    isSelected
                      ? 'bg-turquoise-dark hover:bg-turquoise-dark'
                      : 'bg-turquoise hover:bg-turquoise-dark'
                  }`}
                >
                  {isSelected ? 'Selected ✓' : 'Select This Room'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
```

### Step 5: Guest Info Form Component

**`components/booking/GuestInfoForm.tsx`:**

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CreateBookingData } from '@/types';

const guestInfoSchema = z.object({
  guest_name: z.string().min(2, 'Name must be at least 2 characters'),
  guest_email: z.string().email('Invalid email address'),
  guest_phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  guest_count: z.number().min(1).max(10),
  special_requests: z.string().optional(),
});

type GuestInfoFormData = z.infer<typeof guestInfoSchema>;

interface GuestInfoFormProps {
  checkIn: Date;
  checkOut: Date;
  roomId: number;
  onSubmit: (data: Partial<CreateBookingData>) => void;
  onBack: () => void;
}

export default function GuestInfoForm({
  checkIn,
  checkOut,
  roomId,
  onSubmit,
  onBack,
}: GuestInfoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestInfoFormData>({
    resolver: zodResolver(guestInfoSchema),
    defaultValues: {
      guest_count: 1,
    },
  });

  const onFormSubmit = (data: GuestInfoFormData) => {
    onSubmit({
      room_id: roomId,
      check_in: checkIn.toISOString().split('T')[0],
      check_out: checkOut.toISOString().split('T')[0],
      ...data,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div>
        <label htmlFor="guest_name" className="block text-sm font-semibold text-clay mb-2">
          Full Name *
        </label>
        <Input
          id="guest_name"
          type="text"
          {...register('guest_name')}
          className={errors.guest_name ? 'border-rust' : ''}
        />
        {errors.guest_name && (
          <p className="text-rust text-sm mt-1">{errors.guest_name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="guest_email" className="block text-sm font-semibold text-clay mb-2">
          Email Address *
        </label>
        <Input
          id="guest_email"
          type="email"
          {...register('guest_email')}
          className={errors.guest_email ? 'border-rust' : ''}
        />
        {errors.guest_email && (
          <p className="text-rust text-sm mt-1">{errors.guest_email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="guest_phone" className="block text-sm font-semibold text-clay mb-2">
          Phone Number *
        </label>
        <Input
          id="guest_phone"
          type="tel"
          placeholder="(361) 555-0100"
          {...register('guest_phone')}
          className={errors.guest_phone ? 'border-rust' : ''}
        />
        {errors.guest_phone && (
          <p className="text-rust text-sm mt-1">{errors.guest_phone.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="guest_count" className="block text-sm font-semibold text-clay mb-2">
          Number of Guests *
        </label>
        <Input
          id="guest_count"
          type="number"
          min="1"
          max="10"
          {...register('guest_count', { valueAsNumber: true })}
          className={errors.guest_count ? 'border-rust' : ''}
        />
        {errors.guest_count && (
          <p className="text-rust text-sm mt-1">{errors.guest_count.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="special_requests" className="block text-sm font-semibold text-clay mb-2">
          Special Requests (Optional)
        </label>
        <textarea
          id="special_requests"
          rows={4}
          {...register('special_requests')}
          className="w-full px-4 py-3 border border-earth/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise focus:border-transparent"
          placeholder="Any special requirements or requests?"
        />
      </div>

      <div className="flex space-x-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-turquoise hover:bg-turquoise-dark"
        >
          Continue to Payment
        </Button>
      </div>
    </form>
  );
}
```

### Step 6: Booking Summary Component

**`components/booking/BookingSummary.tsx`:**

```typescript
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, calculateNights, formatDate } from '@/lib/utils';
import { HOTEL_INFO } from '@/lib/constants';
import type { Room } from '@/types';

interface BookingSummaryProps {
  checkIn: Date;
  checkOut: Date;
  room: Room;
}

export default function BookingSummary({ checkIn, checkOut, room }: BookingSummaryProps) {
  const nights = calculateNights(checkIn, checkOut);
  const subtotal = room.rate_per_night * nights;
  const tax = subtotal * 0.0825; // 8.25% Texas sales tax
  const total = subtotal + tax;

  return (
    <Card className="sticky top-24">
      <CardContent className="p-6">
        <h3 className="font-heading text-2xl font-bold mb-4">Booking Summary</h3>

        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-earth">Room</p>
            <p className="font-semibold">Room {room.room_number}</p>
            <p className="text-sm text-earth capitalize">{room.room_type}</p>
          </div>

          <div>
            <p className="text-sm text-earth">Check-in</p>
            <p className="font-semibold">{formatDate(checkIn)}</p>
            <p className="text-sm text-earth">{HOTEL_INFO.checkInTime}</p>
          </div>

          <div>
            <p className="text-sm text-earth">Check-out</p>
            <p className="font-semibold">{formatDate(checkOut)}</p>
            <p className="text-sm text-earth">{HOTEL_INFO.checkOutTime}</p>
          </div>
        </div>

        <div className="border-t border-earth/20 pt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-earth">
              {formatCurrency(room.rate_per_night)} × {nights} nights
            </span>
            <span className="font-semibold">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-earth">Taxes & fees</span>
            <span className="font-semibold">{formatCurrency(tax)}</span>
          </div>
          <div className="border-t border-earth/20 pt-2 flex justify-between text-lg">
            <span className="font-bold">Total</span>
            <span className="font-bold text-turquoise">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-turquoise-light/10 rounded-lg">
          <p className="text-xs text-earth">
            Full payment required at booking. Cancellations made 48 hours before check-in are eligible for a full refund.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Step 7: Check Availability API Route

**`app/api/bookings/check-availability/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { check_in, check_out } = await request.json();

    if (!check_in || !check_out) {
      return NextResponse.json(
        { error: 'check_in and check_out dates are required' },
        { status: 400 }
      );
    }

    // Fetch all available rooms
    const { data: allRooms, error: roomsError } = await supabaseAdmin
      .from('rooms')
      .select('*')
      .eq('status', 'available')
      .order('room_number');

    if (roomsError) {
      console.error('Error fetching rooms:', roomsError);
      return NextResponse.json(
        { error: 'Failed to fetch rooms' },
        { status: 500 }
      );
    }

    // Fetch bookings that overlap with the requested dates
    const { data: overlappingBookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('room_id')
      .not('booking_status', 'in', '("cancelled","no_show")')
      .or(`check_in.lte.${check_out},check_out.gte.${check_in}`);

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return NextResponse.json(
        { error: 'Failed to check availability' },
        { status: 500 }
      );
    }

    // Filter out rooms that have overlapping bookings
    const bookedRoomIds = new Set(overlappingBookings.map((b) => b.room_id));
    const availableRooms = allRooms.filter((room) => !bookedRoomIds.has(room.id));

    return NextResponse.json({ rooms: availableRooms });
  } catch (error) {
    console.error('Availability check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Step 8: Validation Schemas

**`lib/validations.ts`:**

```typescript
import { z } from 'zod';

export const createBookingSchema = z.object({
  room_id: z.number().int().positive(),
  guest_name: z.string().min(2, 'Name must be at least 2 characters'),
  guest_email: z.string().email('Invalid email address'),
  guest_phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  check_in: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  check_out: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  guest_count: z.number().int().min(1).max(10),
  special_requests: z.string().optional(),
});

export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const updateBookingSchema = z.object({
  booking_status: z.enum(['confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show']).optional(),
  payment_status: z.enum(['pending', 'processing', 'paid', 'failed', 'refunded']).optional(),
  admin_notes: z.string().optional(),
  cancellation_reason: z.string().optional(),
});

export const updateRoomSchema = z.object({
  room_type: z.enum(['standard', 'deluxe', 'suite']).optional(),
  rate_per_night: z.number().positive().optional(),
  rate_per_week: z.number().positive().optional(),
  description: z.string().optional(),
  max_occupancy: z.number().int().positive().optional(),
  status: z.enum(['available', 'unavailable', 'maintenance']).optional(),
  amenities: z.array(z.string()).optional(),
  image_urls: z.array(z.string().url()).optional(),
});
```

### Step 9: Commit Booking Core

```bash
git add .
git commit -m "Booking system core: calendar, room selector, guest form, availability API"
git push
```

---

## Phase 4: Payment Integration (Stripe)

### Step 1: Stripe Webhook Handler

**`app/api/webhooks/stripe/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
      break;

    case 'charge.refunded':
      await handleRefund(event.data.object as Stripe.Charge);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata.booking_id;

  if (!bookingId) {
    console.error('No booking_id in payment intent metadata');
    return;
  }

  try {
    const { error } = await supabaseAdmin
      .from('bookings')
      .update({
        payment_status: 'paid',
        stripe_payment_intent_id: paymentIntent.id,
        stripe_charge_id: paymentIntent.latest_charge as string,
        paid_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (error) {
      console.error('Error updating booking after payment:', error);
    } else {
      console.log(`Booking ${bookingId} marked as paid`);
      // TODO: Send confirmation email here
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata.booking_id;

  if (!bookingId) {
    console.error('No booking_id in payment intent metadata');
    return;
  }

  try {
    const { error } = await supabaseAdmin
      .from('bookings')
      .update({
        payment_status: 'failed',
      })
      .eq('id', bookingId);

    if (error) {
      console.error('Error updating booking after payment failure:', error);
    } else {
      console.log(`Booking ${bookingId} marked as failed`);
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handleRefund(charge: Stripe.Charge) {
  try {
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('stripe_charge_id', charge.id)
      .single();

    if (fetchError || !booking) {
      console.error('Booking not found for refund:', charge.id);
      return;
    }

    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({
        payment_status: charge.refunded ? 'refunded' : 'partially_refunded',
      })
      .eq('id', booking.id);

    if (updateError) {
      console.error('Error updating booking after refund:', updateError);
    } else {
      console.log(`Booking ${booking.id} marked as refunded`);
    }
  } catch (error) {
    console.error('Error handling refund:', error);
  }
}
```

### Step 2: Create Booking API Route

**`app/api/bookings/create/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { createBookingSchema } from '@/lib/validations';
import { generateConfirmationCode, calculateNights } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = createBookingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const bookingData = validation.data;

    // Fetch room details
    const { data: room, error: roomError } = await supabaseAdmin
      .from('rooms')
      .select('*')
      .eq('id', bookingData.room_id)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check if room is available for these dates
    const { data: conflictingBookings, error: conflictError } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('room_id', bookingData.room_id)
      .not('booking_status', 'in', '("cancelled","no_show")')
      .or(
        `check_in.lte.${bookingData.check_out},check_out.gte.${bookingData.check_in}`
      );

    if (conflictError) {
      console.error('Error checking availability:', conflictError);
      return NextResponse.json(
        { error: 'Failed to check availability' },
        { status: 500 }
      );
    }

    if (conflictingBookings.length > 0) {
      return NextResponse.json(
        { error: 'Room not available for these dates' },
        { status: 409 }
      );
    }

    // Calculate pricing
    const checkInDate = new Date(bookingData.check_in);
    const checkOutDate = new Date(bookingData.check_out);
    const nights = calculateNights(checkInDate, checkOutDate);
    const subtotal = room.rate_per_night * nights;
    const tax = subtotal * 0.0825; // Texas sales tax
    const totalAmount = Math.round((subtotal + tax) * 100) / 100;

    // Generate confirmation code
    const confirmationCode = generateConfirmationCode();

    // Create booking record (payment pending)
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        confirmation_code: confirmationCode,
        room_id: bookingData.room_id,
        guest_name: bookingData.guest_name,
        guest_email: bookingData.guest_email,
        guest_phone: bookingData.guest_phone,
        check_in: bookingData.check_in,
        check_out: bookingData.check_out,
        nights,
        room_rate: room.rate_per_night,
        total_amount: totalAmount,
        guest_count: bookingData.guest_count,
        special_requests: bookingData.special_requests,
        payment_status: 'pending',
        booking_status: 'confirmed',
      })
      .select()
      .single();

    if (bookingError || !booking) {
      console.error('Error creating booking:', bookingError);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Amount in cents
      currency: 'usd',
      metadata: {
        booking_id: booking.id.toString(),
        confirmation_code: confirmationCode,
        guest_email: bookingData.guest_email,
        room_number: room.room_number,
      },
      description: `Hotel Brendle - Room ${room.room_number} - ${bookingData.guest_name}`,
      receipt_email: bookingData.guest_email,
    });

    // Update booking with payment intent ID
    await supabaseAdmin
      .from('bookings')
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        payment_status: 'processing',
      })
      .eq('id', booking.id);

    return NextResponse.json({
      booking_id: booking.id,
      confirmation_code: confirmationCode,
      payment_intent_client_secret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Step 3: Payment Component (Stripe Elements)

**Install Stripe React:**

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

**`components/booking/StripePaymentForm.tsx`:**

```typescript
'use client';

import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';

interface StripePaymentFormProps {
  bookingId: number;
  confirmationCode: string;
  onSuccess: () => void;
}

export default function StripePaymentForm({
  bookingId,
  confirmationCode,
  onSuccess,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/confirmation/${confirmationCode}`,
        },
      });

      if (submitError) {
        setError(submitError.message || 'Payment failed');
        setProcessing(false);
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setError('An unexpected error occurred');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {error && (
        <div className="p-4 bg-rust/10 border border-rust rounded-lg">
          <p className="text-rust text-sm">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-turquoise hover:bg-turquoise-dark"
        disabled={!stripe || processing}
      >
        {processing ? 'Processing...' : 'Complete Booking'}
      </Button>

      <p className="text-xs text-earth text-center">
        Your payment is secure and encrypted. By completing this booking, you agree to our cancellation policy.
      </p>
    </form>
  );
}
```

**Update booking page to integrate payment (update Step 3 in `app/book/page.tsx`):**

```typescript
// Add imports at top:
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '@/components/booking/StripePaymentForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Inside BookPage component, add state for payment:
const [clientSecret, setClientSecret] = useState<string | null>(null);
const [bookingId, setBookingId] = useState<number | null>(null);
const [confirmationCode, setConfirmationCode] = useState<string | null>(null);

// Replace Step 3 placeholder with:
{step === 3 && checkIn && checkOut && selectedRoom && bookingData && (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    <div className="md:col-span-2">
      <Card>
        <CardContent className="p-6">
          <h2 className="font-heading text-2xl font-bold mb-4">Payment</h2>
          
          {!clientSecret ? (
            <Button
              className="w-full bg-turquoise hover:bg-turquoise-dark"
              onClick={async () => {
                try {
                  const res = await fetch('/api/bookings/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookingData),
                  });

                  if (!res.ok) {
                    throw new Error('Failed to create booking');
                  }

                  const data = await res.json();
                  setClientSecret(data.payment_intent_client_secret);
                  setBookingId(data.booking_id);
                  setConfirmationCode(data.confirmation_code);
                } catch (error) {
                  console.error('Booking error:', error);
                  alert('Failed to create booking. Please try again.');
                }
              }}
            >
              Proceed to Payment
            </Button>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripePaymentForm
                bookingId={bookingId!}
                confirmationCode={confirmationCode!}
                onSuccess={() => {
                  window.location.href = `/confirmation/${confirmationCode}`;
                }}
              />
            </Elements>
          )}
        </CardContent>
      </Card>
    </div>

    <div>
      <BookingSummary
        checkIn={checkIn}
        checkOut={checkOut}
        room={selectedRoom}
      />
    </div>
  </div>
)}
```

### Step 4: Confirmation Page

**`app/confirmation/[code]/page.tsx`:**

```typescript
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/utils';
import { HOTEL_INFO } from '@/lib/constants';

export async function generateMetadata({ params }: { params: { code: string } }) {
  return {
    title: `Booking Confirmation ${params.code} | Hotel Brendle`,
    description: 'Your booking confirmation',
  };
}

export default async function ConfirmationPage({ params }: { params: { code: string } }) {
  const { code } = params;

  // Fetch booking
  const { data: booking, error } = await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      rooms (*)
    `)
    .eq('confirmation_code', code)
    .single();

  if (error || !booking) {
    notFound();
  }

  const room = booking.rooms as any;

  return (
    <div className="py-16 bg-white min-h-screen">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-sage rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-heading text-4xl font-bold text-clay mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-earth">
            Your reservation has been confirmed. We've sent a confirmation email to {booking.guest_email}.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-earth mb-1">Confirmation Code</p>
                <p className="text-2xl font-bold text-turquoise">{booking.confirmation_code}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-earth mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-clay">{formatCurrency(booking.total_amount)}</p>
              </div>
            </div>

            <div className="border-t border-earth/20 pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-earth">Guest Name</p>
                  <p className="font-semibold">{booking.guest_name}</p>
                </div>
                <div>
                  <p className="text-sm text-earth">Room</p>
                  <p className="font-semibold">Room {room.room_number}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-earth">Check-in</p>
                  <p className="font-semibold">{formatDate(new Date(booking.check_in))}</p>
                  <p className="text-sm text-earth">{HOTEL_INFO.checkInTime}</p>
                </div>
                <div>
                  <p className="text-sm text-earth">Check-out</p>
                  <p className="font-semibold">{formatDate(new Date(booking.check_out))}</p>
                  <p className="text-sm text-earth">{HOTEL_INFO.checkOutTime}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-earth">Nights</p>
                <p className="font-semibold">{booking.nights}</p>
              </div>

              {booking.special_requests && (
                <div>
                  <p className="text-sm text-earth">Special Requests</p>
                  <p className="font-semibold">{booking.special_requests}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="font-heading text-xl font-bold mb-4">Hotel Information</h2>
            <div className="space-y-2">
              <p><strong>Address:</strong> {HOTEL_INFO.address}</p>
              <p><strong>Phone:</strong> <a href={`tel:${HOTEL_INFO.phone}`} className="text-turquoise hover:underline">{HOTEL_INFO.phone}</a></p>
              <p><strong>Email:</strong> <a href={`mailto:${HOTEL_INFO.email}`} className="text-turquoise hover:underline">{HOTEL_INFO.email}</a></p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/">
            <Button variant="outline" className="border-2 border-turquoise text-turquoise hover:bg-turquoise hover:text-white">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### Step 5: Set Up Stripe Webhook (Production)

**After deploying to Vercel:**

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://brendlehg.com/api/webhooks/stripe`
4. Events to send:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy the webhook signing secret → add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

**For local testing:**

```bash
# Install Stripe CLI
brew install stripe/stripe-brew/stripe  # macOS
# OR download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local dev server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Use the webhook signing secret shown in terminal
```

### Step 6: Commit Payment Integration

```bash
git add .
git commit -m "Payment integration: Stripe Elements, webhooks, confirmation page"
git push
```

---

_(Continuing in Part 3 with Email System, Admin Dashboard, Testing, Deployment...)_
