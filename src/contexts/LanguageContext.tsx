import React, { createContext, useContext, useState, useCallback } from 'react';

type Language = 'en' | 'np';
type Currency = { code: string; symbol: string };

interface LanguageContextType {
  language: Language;
  currency: Currency;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const currencies: Record<Language, Currency> = {
  en: { code: 'USD', symbol: '$' },
  np: { code: 'NPR', symbol: 'Rs' },
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.hotels': 'Hotels',
    'nav.bookings': 'My Bookings',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    'nav.admin': 'Admin',
    'nav.profile': 'Profile',
    'hero.title': 'Discover Nepal\'s Finest Hotels',
    'hero.subtitle': 'Book your perfect stay with the best hotels across Nepal',
    'hero.search': 'Search Hotels',
    'search.location': 'Location',
    'search.minPrice': 'Min Price',
    'search.maxPrice': 'Max Price',
    'search.search': 'Search',
    'search.clear': 'Clear',
    'hotel.perNight': 'per night',
    'hotel.guests': 'guests',
    'hotel.rooms': 'rooms available',
    'hotel.book': 'Book Now',
    'hotel.details': 'View Details',
    'hotel.featured': 'Featured',
    'hotel.amenities': 'Amenities',
    'booking.checkIn': 'Check-in',
    'booking.checkOut': 'Check-out',
    'booking.guests': 'Guests',
    'booking.total': 'Total',
    'booking.nights': 'nights',
    'booking.confirm': 'Confirm Booking',
    'booking.status': 'Status',
    'booking.myBookings': 'My Bookings',
    'booking.noBookings': 'No bookings yet',
    'payment.title': 'Payment',
    'payment.full': 'Full Payment',
    'payment.advance': 'Advance Payment (50%)',
    'payment.pay': 'Pay with Khalti',
    'payment.amount': 'Amount',
    'payment.processing': 'Processing...',
    'invoice.title': 'Invoice',
    'invoice.download': 'Download PDF',
    'invoice.print': 'Print',
    'invoice.number': 'Invoice #',
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.fullName': 'Full Name',
    'auth.phone': 'Phone Number',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.resetPassword': 'Reset Password',
    'auth.sendReset': 'Send Reset Link',
    'auth.newPassword': 'New Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.noAccount': 'Don\'t have an account?',
    'auth.hasAccount': 'Already have an account?',
    'auth.adminLogin': 'Admin Login',
    'admin.dashboard': 'Admin Dashboard',
    'admin.users': 'Users',
    'admin.bookings': 'Bookings',
    'admin.payments': 'Payments',
    'admin.hotels': 'Hotels',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.back': 'Back',
  },
  np: {
    'nav.home': 'गृहपृष्ठ',
    'nav.hotels': 'होटलहरू',
    'nav.bookings': 'मेरा बुकिङहरू',
    'nav.login': 'लगइन',
    'nav.register': 'दर्ता',
    'nav.logout': 'लगआउट',
    'nav.admin': 'एडमिन',
    'nav.profile': 'प्रोफाइल',
    'hero.title': 'नेपालका उत्कृष्ट होटलहरू पत्ता लगाउनुहोस्',
    'hero.subtitle': 'नेपालभरका उत्तम होटलहरूसँग आफ्नो उत्तम बसाइ बुक गर्नुहोस्',
    'hero.search': 'होटल खोज्नुहोस्',
    'search.location': 'स्थान',
    'search.minPrice': 'न्यूनतम मूल्य',
    'search.maxPrice': 'अधिकतम मूल्य',
    'search.search': 'खोज्नुहोस्',
    'search.clear': 'खाली गर्नुहोस्',
    'hotel.perNight': 'प्रति रात',
    'hotel.guests': 'पाहुनाहरू',
    'hotel.rooms': 'कोठा उपलब्ध',
    'hotel.book': 'अहिले बुक गर्नुहोस्',
    'hotel.details': 'विवरण हेर्नुहोस्',
    'hotel.featured': 'विशेष',
    'hotel.amenities': 'सुविधाहरू',
    'booking.checkIn': 'चेक-इन',
    'booking.checkOut': 'चेक-आउट',
    'booking.guests': 'पाहुनाहरू',
    'booking.total': 'जम्मा',
    'booking.nights': 'रातहरू',
    'booking.confirm': 'बुकिङ पुष्टि गर्नुहोस्',
    'booking.status': 'स्थिति',
    'booking.myBookings': 'मेरा बुकिङहरू',
    'booking.noBookings': 'अहिलेसम्म कुनै बुकिङ छैन',
    'payment.title': 'भुक्तानी',
    'payment.full': 'पूर्ण भुक्तानी',
    'payment.advance': 'अग्रिम भुक्तानी (५०%)',
    'payment.pay': 'खल्तीबाट भुक्तानी गर्नुहोस्',
    'payment.amount': 'रकम',
    'payment.processing': 'प्रशोधन भइरहेको छ...',
    'invoice.title': 'बिजक',
    'invoice.download': 'PDF डाउनलोड गर्नुहोस्',
    'invoice.print': 'प्रिन्ट गर्नुहोस्',
    'invoice.number': 'बिजक #',
    'auth.login': 'लगइन',
    'auth.register': 'दर्ता',
    'auth.email': 'इमेल',
    'auth.password': 'पासवर्ड',
    'auth.fullName': 'पूरा नाम',
    'auth.phone': 'फोन नम्बर',
    'auth.forgotPassword': 'पासवर्ड बिर्सनुभयो?',
    'auth.resetPassword': 'पासवर्ड रिसेट गर्नुहोस्',
    'auth.sendReset': 'रिसेट लिंक पठाउनुहोस्',
    'auth.newPassword': 'नयाँ पासवर्ड',
    'auth.confirmPassword': 'पासवर्ड पुष्टि गर्नुहोस्',
    'auth.noAccount': 'खाता छैन?',
    'auth.hasAccount': 'पहिले नै खाता छ?',
    'auth.adminLogin': 'एडमिन लगइन',
    'admin.dashboard': 'एडमिन ड्यासबोर्ड',
    'admin.users': 'प्रयोगकर्ताहरू',
    'admin.bookings': 'बुकिङहरू',
    'admin.payments': 'भुक्तानीहरू',
    'admin.hotels': 'होटलहरू',
    'common.loading': 'लोड हुँदैछ...',
    'common.error': 'त्रुटि भयो',
    'common.success': 'सफल',
    'common.cancel': 'रद्द गर्नुहोस्',
    'common.save': 'सुरक्षित गर्नुहोस्',
    'common.delete': 'मेटाउनुहोस्',
    'common.edit': 'सम्पादन गर्नुहोस्',
    'common.back': 'पछाडि',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: string) => {
    return translations[language][key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, currency: currencies[language], setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
