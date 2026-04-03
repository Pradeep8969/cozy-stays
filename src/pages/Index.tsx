import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import HotelCard from '@/components/HotelCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

const Index = () => {
  const { t, language, currency } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredHotels, setFeaturedHotels] = useState<Tables<'hotels'>[]>([]);
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from('hotels')
        .select('*')
        .eq('featured', true)
        .limit(4);
      if (data) setFeaturedHotels(data);
    };
    fetchFeatured();
  }, []);

  const handleSearch = () => {
    navigate(`/hotels?location=${encodeURIComponent(searchLocation)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary px-4 py-20 text-center">
        <h1 className="mb-4 text-4xl font-bold text-primary-foreground">
          {t('hero.title')}
        </h1>
        <p className="mb-8 text-lg text-primary-foreground/80">
          {t('hero.subtitle')}
        </p>
        <div className="mx-auto flex max-w-md gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('search.location')}
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="bg-card pl-9"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} className="bg-card text-foreground hover:bg-accent">
            <Search className="mr-1 h-4 w-4" />
            {t('hero.search')}
          </Button>
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {t('hotel.featured')}
          </h2>
          <Button variant="outline" onClick={() => navigate('/hotels')}>
            {t('nav.hotels')} →
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredHotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
