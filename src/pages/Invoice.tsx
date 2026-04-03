import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import { format } from 'date-fns';

const Invoice = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const { t, currency } = useLanguage();
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    if (!invoiceId) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('invoices')
        .select('*, profiles!invoices_user_id_fkey(full_name, email, phone)')
        .eq('id', invoiceId)
        .single();
      if (data) setInvoice(data);
    };
    fetch();
  }, [invoiceId]);

  if (!invoice) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">{t('common.loading')}</div>;

  const details = invoice.details as any;
  const sym = invoice.currency === 'NPR' ? 'Rs' : '$';

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-lg print:shadow-none" id="invoice">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t('invoice.title')}</CardTitle>
              <p className="text-sm text-muted-foreground">{t('invoice.number')}{invoice.invoice_number}</p>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-1 h-4 w-4" /> {t('invoice.print')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-secondary p-4 text-sm">
              <p className="font-semibold text-foreground">{invoice.profiles?.full_name}</p>
              <p className="text-muted-foreground">{invoice.profiles?.email}</p>
              {invoice.profiles?.phone && <p className="text-muted-foreground">{invoice.profiles?.phone}</p>}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hotel</span>
                <span className="font-medium text-foreground">{details?.hotel_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('booking.checkIn')}</span>
                <span className="text-foreground">{details?.check_in ? format(new Date(details.check_in), 'MMM d, yyyy') : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('booking.checkOut')}</span>
                <span className="text-foreground">{details?.check_out ? format(new Date(details.check_out), 'MMM d, yyyy') : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('booking.guests')}</span>
                <span className="text-foreground">{details?.guests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Type</span>
                <span className="text-foreground capitalize">{details?.payment_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-xs text-foreground">{details?.transaction_id}</span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-foreground">{t('booking.total')}</span>
                <span className="text-foreground">{sym}{invoice.amount.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              {format(new Date(invoice.created_at), 'MMMM d, yyyy')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Invoice;
