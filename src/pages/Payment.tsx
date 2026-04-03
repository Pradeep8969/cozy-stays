import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';

const Payment = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useAuth();
  const { t, currency } = useLanguage();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [paymentType, setPaymentType] = useState<'full' | 'advance'>('full');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*, hotels(name, name_np)')
        .eq('id', bookingId)
        .single();
      if (data) setBooking(data);
    };
    fetch();
  }, [bookingId]);

  if (!booking) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">{t('common.loading')}</div>;

  const amount = paymentType === 'full' ? booking.total_amount : booking.total_amount * 0.5;

  const handlePayment = async () => {
    if (!user) return;
    setLoading(true);

    // Simulate Khalti payment (in production, integrate Khalti SDK)
    const transactionId = `KH-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { data: payment, error: payErr } = await supabase.from('payments').insert({
      booking_id: booking.id,
      user_id: user.id,
      amount,
      currency: booking.currency,
      payment_type: paymentType,
      status: 'completed',
      transaction_id: transactionId,
      payment_method: 'khalti',
    }).select().single();

    if (payErr) { toast.error(payErr.message); setLoading(false); return; }

    // Update booking status
    await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', booking.id);

    // Generate invoice if amount >= 50 USD or 5000 NPR
    const threshold = booking.currency === 'NPR' ? 5000 : 50;
    if (amount >= threshold && payment) {
      const invoiceNumber = `INV-${format(new Date(), 'yyyyMMdd')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      await supabase.from('invoices').insert({
        booking_id: booking.id,
        payment_id: payment.id,
        user_id: user.id,
        invoice_number: invoiceNumber,
        amount,
        currency: booking.currency,
        details: {
          hotel_name: booking.hotels?.name,
          check_in: booking.check_in,
          check_out: booking.check_out,
          guests: booking.guests,
          payment_type: paymentType,
          transaction_id: transactionId,
        },
      });
    }

    toast.success('Payment successful!');
    setLoading(false);
    navigate('/bookings');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('payment.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-md bg-secondary p-4 text-sm">
              <p className="font-semibold text-foreground">{booking.hotels?.name}</p>
              <p className="text-muted-foreground">
                {format(new Date(booking.check_in), 'MMM d')} – {format(new Date(booking.check_out), 'MMM d, yyyy')}
              </p>
              <p className="mt-1 text-foreground">
                {t('booking.total')}: {currency.symbol}{booking.total_amount.toLocaleString()}
              </p>
            </div>

            <RadioGroup value={paymentType} onValueChange={(v) => setPaymentType(v as 'full' | 'advance')}>
              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full" className="flex-1 cursor-pointer">
                  <div>{t('payment.full')}</div>
                  <div className="text-sm text-muted-foreground">{currency.symbol}{booking.total_amount.toLocaleString()}</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="advance" id="advance" />
                <Label htmlFor="advance" className="flex-1 cursor-pointer">
                  <div>{t('payment.advance')}</div>
                  <div className="text-sm text-muted-foreground">{currency.symbol}{(booking.total_amount * 0.5).toLocaleString()}</div>
                </Label>
              </div>
            </RadioGroup>

            <div className="rounded-md bg-primary/10 p-3 text-center">
              <p className="text-sm text-muted-foreground">{t('payment.amount')}</p>
              <p className="text-2xl font-bold text-foreground">{currency.symbol}{amount.toLocaleString()}</p>
            </div>

            <Button className="w-full" onClick={handlePayment} disabled={loading}>
              {loading ? t('payment.processing') : t('payment.pay')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payment;
