import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  pending: 'bg-warning text-warning-foreground',
  confirmed: 'bg-success text-success-foreground',
  cancelled: 'bg-destructive text-destructive-foreground',
  completed: 'bg-primary text-primary-foreground',
};

const Bookings = () => {
  const { user } = useAuth();
  const { t, currency } = useLanguage();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*, hotels(name, name_np, location, images)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setBookings(data);
      setLoading(false);
    };
    fetch();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-foreground">{t('booking.myBookings')}</h1>
        {loading ? (
          <p className="text-muted-foreground">{t('common.loading')}</p>
        ) : bookings.length === 0 ? (
          <p className="text-muted-foreground">{t('booking.noBookings')}</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <Card key={b.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <img
                    src={b.hotels?.images?.[0] || '/placeholder.svg'}
                    alt={b.hotels?.name}
                    className="h-20 w-28 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{b.hotels?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(b.check_in), 'MMM d')} – {format(new Date(b.check_out), 'MMM d, yyyy')} · {b.guests} {t('booking.guests')}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {currency.symbol}{b.total_amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={statusColors[b.status] || ''}>{b.status}</Badge>
                    {b.status === 'pending' && (
                      <Link to={`/payment/${b.id}`}>
                        <Button size="sm">{t('payment.pay')}</Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
