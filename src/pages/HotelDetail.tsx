import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Star, MapPin, Users, CalendarIcon, ArrowLeft } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

const HotelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language, currency } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<Tables<'hotels'> | null>(null);
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      const { data } = await supabase.from('hotels').select('*').eq('id', id).single();
      if (data) setHotel(data);
    };
    fetch();
  }, [id]);

  if (!hotel) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">{t('common.loading')}</div>;

  const name = language === 'np' && hotel.name_np ? hotel.name_np : hotel.name;
  const loc = language === 'np' && hotel.location_np ? hotel.location_np : hotel.location;
  const desc = language === 'np' && hotel.description_np ? hotel.description_np : hotel.description;
  const price = language === 'np' ? hotel.price_per_night_npr : hotel.price_per_night_usd;
  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const total = nights * price;

  const handleBook = async () => {
    if (!user) { navigate('/login'); return; }
    if (!checkIn || !checkOut || nights <= 0) { toast.error('Please select valid dates'); return; }
    
    setLoading(true);
    const { data, error } = await supabase.from('bookings').insert({
      user_id: user.id,
      hotel_id: hotel.id,
      check_in: format(checkIn, 'yyyy-MM-dd'),
      check_out: format(checkOut, 'yyyy-MM-dd'),
      guests,
      total_amount: total,
      currency: currency.code,
    }).select().single();

    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Booking created!');
    navigate(`/payment/${data.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1 h-4 w-4" /> {t('common.back')}
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Images */}
            <div className="mb-6 grid gap-2 sm:grid-cols-2">
              {hotel.images?.map((img, i) => (
                <img key={i} src={img} alt={name} className="h-64 w-full rounded-lg object-cover" />
              ))}
            </div>

            <h1 className="mb-2 text-3xl font-bold text-foreground">{name}</h1>
            <div className="mb-4 flex items-center gap-3 text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{loc}</span>
              <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-warning text-warning" />{hotel.rating}</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" />{hotel.max_guests} {t('hotel.guests')}</span>
            </div>

            <p className="mb-6 text-muted-foreground">{desc}</p>

            <h3 className="mb-3 font-semibold text-foreground">{t('hotel.amenities')}</h3>
            <div className="flex flex-wrap gap-2">
              {hotel.amenities?.map((a) => (
                <Badge key={a} variant="secondary">{a}</Badge>
              ))}
            </div>
          </div>

          {/* Booking Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-baseline gap-2">
                <span className="text-2xl">{currency.symbol}{price.toLocaleString()}</span>
                <span className="text-sm font-normal text-muted-foreground">/{t('hotel.perNight')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t('booking.checkIn')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left", !checkIn && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkIn ? format(checkIn, 'PPP') : t('booking.checkIn')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={checkIn} onSelect={setCheckIn}
                      disabled={(date) => date < new Date()}
                      className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>{t('booking.checkOut')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left", !checkOut && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkOut ? format(checkOut, 'PPP') : t('booking.checkOut')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={checkOut} onSelect={setCheckOut}
                      disabled={(date) => date < (checkIn || new Date())}
                      className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>{t('booking.guests')}</Label>
                <Input type="number" min={1} max={hotel.max_guests || 4} value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value) || 1)} />
              </div>

              {nights > 0 && (
                <div className="rounded-md bg-secondary p-3 text-sm">
                  <div className="flex justify-between">
                    <span>{currency.symbol}{price.toLocaleString()} × {nights} {t('booking.nights')}</span>
                    <span className="font-semibold">{currency.symbol}{total.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <Button className="w-full" onClick={handleBook} disabled={loading || nights <= 0}>
                {loading ? t('common.loading') : t('hotel.book')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;
