import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Users } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

interface HotelCardProps {
  hotel: Tables<'hotels'>;
}

const HotelCard = ({ hotel }: HotelCardProps) => {
  const { language, currency, t } = useLanguage();
  const navigate = useNavigate();

  const name = language === 'np' && hotel.name_np ? hotel.name_np : hotel.name;
  const location = language === 'np' && hotel.location_np ? hotel.location_np : hotel.location;
  const price = language === 'np' ? hotel.price_per_night_npr : hotel.price_per_night_usd;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative h-48 overflow-hidden">
        <img
          src={hotel.images?.[0] || '/placeholder.svg'}
          alt={name}
          className="h-full w-full object-cover"
        />
        {hotel.featured && (
          <Badge className="absolute left-2 top-2 bg-primary">
            {t('hotel.featured')}
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-foreground">{name}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-warning text-warning" />
            {hotel.rating}
          </div>
        </div>
        <div className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {location}
        </div>
        <div className="mb-1 flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-3 w-3" />
          {hotel.max_guests} {t('hotel.guests')} · {hotel.available_rooms} {t('hotel.rooms')}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-foreground">
              {currency.symbol}{price.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground"> /{t('hotel.perNight')}</span>
          </div>
          <Button size="sm" onClick={() => navigate(`/hotels/${hotel.id}`)}>
            {t('hotel.details')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HotelCard;
