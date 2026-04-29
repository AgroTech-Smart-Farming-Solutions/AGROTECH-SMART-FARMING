import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Loader2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClayCard, ClayButton } from '@/components/ui/ClayCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LedgerEntry {
  id: string;
  name: string;
  category: string;
  amount: number;
  type: 'expense' | 'income';
  date: string;
}

const KisanKhata: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [newEntry, setNewEntry] = useState<{ name: string; category: string; amount: string; type: 'expense' | 'income' }>({ name: '', category: 'Seeds', amount: '', type: 'expense' });
  const [isLoadingLedger, setIsLoadingLedger] = useState(true);

  useEffect(() => {
    const fetchLedger = async () => {
      if (!user) { setIsLoadingLedger(false); return; }
      try {
        setIsLoadingLedger(true);
        const { data, error } = await supabase.from('ledger_entries').select('*').eq('user_id', user.id).order('date', { ascending: false });
        if (error) throw error;
        setLedgerEntries(data || []);
      } catch (err) {
        console.error('Error fetching ledger:', err);
        toast.error('Failed to load ledger entries');
      } finally {
        setIsLoadingLedger(false);
      }
    };
    fetchLedger();
  }, [user]);

  const addLedgerEntry = async () => {
    if (!user) { toast.error('Please login to add entries'); return; }
    if (newEntry.name && newEntry.amount) {
      const entryData = { user_id: user.id, name: newEntry.name, category: newEntry.category, amount: parseFloat(newEntry.amount), type: newEntry.type, date: new Date().toISOString().split('T')[0] };
      try {
        const { data, error } = await supabase.from('ledger_entries').insert([entryData]).select().single();
        if (error) throw error;
        setLedgerEntries([data, ...ledgerEntries]);
        setNewEntry({ name: '', category: 'Seeds', amount: '', type: 'expense' });
        toast.success('Entry added successfully');
      } catch (err) {
        console.error('Error adding entry:', err);
        toast.error('Failed to add ledger entry');
      }
    }
  };

  const deleteLedgerEntry = async (id: string) => {
    try {
      const { error } = await supabase.from('ledger_entries').delete().eq('id', id);
      if (error) throw error;
      setLedgerEntries(ledgerEntries.filter(e => e.id !== id));
      toast.success('Entry deleted');
    } catch (err) { console.error('Error deleting entry:', err); toast.error('Failed to delete entry'); }
  };

  const totalIncome = ledgerEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + Number(e.amount), 0);
  const totalExpense = ledgerEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + Number(e.amount), 0);
  const netProfit = totalIncome - totalExpense;

  const downloadLedgerPDF = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    doc.setFontSize(20); doc.setTextColor(40, 167, 69); doc.text(language === 'hi' ? 'किसान खाता रिपोर्ट' : 'Kisan Khata Report', 14, 22);
    doc.setFontSize(10); doc.setTextColor(100); doc.text(`Date: ${date}`, 14, 30);
    autoTable(doc, {
      startY: 40,
      head: [[language === 'hi' ? 'विवरण' : 'Summary', language === 'hi' ? 'राशि' : 'Amount']],
      body: [
        [language === 'hi' ? 'कुल आय' : 'Total Income', `INR ${totalIncome}`],
        [language === 'hi' ? 'कुल खर्च' : 'Total Expense', `INR ${totalExpense}`],
        [language === 'hi' ? 'शुद्ध लाभ' : 'Net Profit', `INR ${netProfit}`],
      ],
      theme: 'striped', headStyles: { fillColor: [40, 167, 69] }
    });
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [[ language === 'hi' ? 'तारीख' : 'Date', language === 'hi' ? 'नाम' : 'Name', language === 'hi' ? 'श्रेणी' : 'Category', language === 'hi' ? 'प्रकार' : 'Type', language === 'hi' ? 'राशि' : 'Amount' ]],
      body: ledgerEntries.map(entry => [ entry.date, entry.name, entry.category, entry.type === 'income' ? (language === 'hi' ? 'आय' : 'Income') : (language === 'hi' ? 'खर्च' : 'Expense'), `Rs. ${entry.amount}` ]),
      headStyles: { fillColor: [50, 50, 50] }
    });
    doc.save(`Kisan_Khata_${date}.pdf`);
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">{t('ledger') || 'Kisan Khata'}</h1>
          <p className="text-xs text-muted-foreground">Manage your farming finances</p>
        </div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <ClayCard className="text-center p-4">
              <p className="text-xs text-muted-foreground">{t('income')}</p>
              <p className="text-lg font-bold text-primary">₹{totalIncome.toLocaleString()}</p>
            </ClayCard>
            <ClayCard className="text-center p-4">
              <p className="text-xs text-muted-foreground">{t('expense')}</p>
              <p className="text-lg font-bold text-destructive">₹{totalExpense.toLocaleString()}</p>
            </ClayCard>
            <ClayCard className="text-center p-4">
              <p className="text-xs text-muted-foreground">{t('netProfit')}</p>
              <p className={`text-lg font-bold ${netProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>₹{netProfit.toLocaleString()}</p>
            </ClayCard>
          </div>

          <ClayCard>
            <h3 className="font-bold mb-4">{t('addExpense')}</h3>
            <div className="space-y-3">
              <Input placeholder="Name" value={newEntry.name} onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })} className="clay-inset border-0" />
              <div className="flex gap-2">
                <Select value={newEntry.category} onValueChange={(v) => setNewEntry({ ...newEntry, category: v })}>
                  <SelectTrigger className="clay-inset border-0 flex-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Seeds">{t('seeds') || 'Seeds'}</SelectItem>
                    <SelectItem value="Fertilizer">{t('fertilizer') || 'Fertilizer'}</SelectItem>
                    <SelectItem value="Labor">{t('labor') || 'Labor'}</SelectItem>
                    <SelectItem value="Sale">Sale</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newEntry.type} onValueChange={(v) => setNewEntry({ ...newEntry, type: v as 'expense' | 'income' })}>
                  <SelectTrigger className="clay-inset border-0 w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">{t('expense')}</SelectItem>
                    <SelectItem value="income">{t('income')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Input type="number" placeholder="Amount (₹)" value={newEntry.amount} onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })} className="clay-inset border-0 flex-1" />
                <ClayButton onClick={addLedgerEntry} variant="primary"><Plus size={18} /></ClayButton>
              </div>
            </div>
          </ClayCard>

          <ClayCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">{language === 'hi' ? 'हालिया लेनदेन' : 'Recent Entries'}</h3>
              {ledgerEntries.length > 0 && (
                <button onClick={downloadLedgerPDF} className="flex items-center gap-2 text-xs font-medium text-primary hover:bg-primary/10 px-3 py-1.5 rounded-xl transition-colors">
                  <Download size={14} /> {language === 'hi' ? 'डाउनलोड PDF' : 'Download PDF'}
                </button>
              )}
            </div>
            <div className="space-y-3">
              {isLoadingLedger ? (
                <div className="flex justify-center py-4"><Loader2 className="animate-spin text-primary" size={24} /></div>
              ) : ledgerEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">{t('noData') || 'No entries found'}</p>
              ) : (
                ledgerEntries.map((entry) => (
                  <motion.div key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between p-3 clay-inset rounded-xl">
                    <div>
                      <p className="font-medium text-sm">{entry.name}</p>
                      <p className="text-xs text-muted-foreground">{entry.category} • {entry.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${entry.type === 'income' ? 'text-primary' : 'text-destructive'}`}>
                        {entry.type === 'income' ? '+' : '-'}₹{entry.amount}
                      </span>
                      <button onClick={() => deleteLedgerEntry(entry.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </ClayCard>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
};

export default KisanKhata;