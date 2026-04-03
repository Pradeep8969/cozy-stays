import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Hotel, CreditCard, CalendarCheck } from 'lucide-react';
import { format } from 'date-fns';

const Admin = () => {
  const { t, currency } = useLanguage();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const [p, b, pay, h] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('bookings').select('*, hotels(name)').order('created_at', { ascending: false }),
        supabase.from('payments').select('*').order('created_at', { ascending: false }),
        supabase.from('hotels').select('*').order('created_at', { ascending: false }),
      ]);
      if (p.data) setProfiles(p.data);
      if (b.data) setBookings(b.data);
      if (pay.data) setPayments(pay.data);
      if (h.data) setHotels(h.data);
    };
    fetchAll();
  }, []);

  const stats = [
    { icon: Users, label: t('admin.users'), value: profiles.length },
    { icon: CalendarCheck, label: t('admin.bookings'), value: bookings.length },
    { icon: CreditCard, label: t('admin.payments'), value: payments.length },
    { icon: Hotel, label: t('admin.hotels'), value: hotels.length },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-foreground">{t('admin.dashboard')}</h1>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-4 p-4">
                <s.icon className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">{t('admin.users')}</TabsTrigger>
            <TabsTrigger value="bookings">{t('admin.bookings')}</TabsTrigger>
            <TabsTrigger value="payments">{t('admin.payments')}</TabsTrigger>
            <TabsTrigger value="hotels">{t('admin.hotels')}</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.full_name}</TableCell>
                        <TableCell>{p.email}</TableCell>
                        <TableCell>{p.phone || '-'}</TableCell>
                        <TableCell>{format(new Date(p.created_at), 'MMM d, yyyy')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hotel</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.hotels?.name}</TableCell>
                        <TableCell>{format(new Date(b.check_in), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{format(new Date(b.check_out), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{b.currency === 'NPR' ? 'Rs' : '$'}{b.total_amount.toLocaleString()}</TableCell>
                        <TableCell><Badge variant="outline">{b.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">{p.transaction_id || '-'}</TableCell>
                        <TableCell>{p.currency === 'NPR' ? 'Rs' : '$'}{p.amount.toLocaleString()}</TableCell>
                        <TableCell>{p.payment_type}</TableCell>
                        <TableCell>{p.payment_method}</TableCell>
                        <TableCell><Badge variant="outline">{p.status}</Badge></TableCell>
                        <TableCell>{format(new Date(p.created_at), 'MMM d, yyyy')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hotels">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Price (USD)</TableHead>
                      <TableHead>Price (NPR)</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Rooms</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hotels.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell className="font-medium">{h.name}</TableCell>
                        <TableCell>{h.location}</TableCell>
                        <TableCell>${h.price_per_night_usd}</TableCell>
                        <TableCell>Rs{h.price_per_night_npr}</TableCell>
                        <TableCell>{h.rating}</TableCell>
                        <TableCell>{h.available_rooms}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
