import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe, LogOut, User, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="text-xl font-bold text-primary">
          StayNepal
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/hotels">
            <Button variant="ghost" size="sm">{t('nav.hotels')}</Button>
          </Link>

          {user && (
            <Link to="/bookings">
              <Button variant="ghost" size="sm">{t('nav.bookings')}</Button>
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <Shield className="mr-1 h-4 w-4" />
                {t('nav.admin')}
              </Button>
            </Link>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'np' : 'en')}
          >
            <Globe className="mr-1 h-4 w-4" />
            {language === 'en' ? 'नेपाली' : 'English'}
          </Button>

          {user ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-1 h-4 w-4" />
              {t('nav.logout')}
            </Button>
          ) : (
            <div className="flex gap-1">
              <Link to="/login">
                <Button variant="ghost" size="sm">{t('nav.login')}</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">{t('nav.register')}</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
