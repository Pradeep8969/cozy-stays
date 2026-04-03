import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import HotelCard from '@/components/HotelCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

const Hotels = () => {
  const { t, currency } = useLanguage();
  const [searchParams] = useSearchParams();
  const [hotels, setHotels] = useState<Tables<'hotels'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchHotels = async () => {
    setLoading(true);
    let query = supabase.from('hotels').select('*').order('featured', { ascending: false });
    
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    if (minPrice) {
      const field = currency.code === 'NPR' ? 'price_per_night_npr' : 'price_per_night_usd';
      query = query.gte(field, parseFloat(minPrice));
    }
    if (maxPrice) {
      const field = currency.code === 'NPR' ? 'price_per_night_npr' : 'price_per_night_usd';
      query = query.lte(field, parseFloat(maxPrice));
    }

    const { data } = await query;
    if (data) setHotels(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-foreground">{t('nav.hotels')}</h1>
        
        {/* Search/Filter */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Input
            placeholder={t('search.location')}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="max-w-xs"
          />
          <Input
            type="number"
            placeholder={`${t('search.minPrice')} (${currency.symbol})`}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="max-w-[160px]"
          />
          <Input
            type="number"
            placeholder={`${t('search.maxPrice')} (${currency.symbol})`}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="max-w-[160px]"
          />
          <Button onClick={fetchHotels}>
            <Search className="mr-1 h-4 w-4" />
            {t('search.search')}
          </Button>
          <Button variant="outline" onClick={() => { setLocation(''); setMinPrice(''); setMaxPrice(''); fetchHotels(); }}>
            {t('search.clear')}
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground">{t('common.loading')}</p>
        ) : hotels.length === 0 ? (
          <p className="text-muted-foreground">No hotels found</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Hotels;
