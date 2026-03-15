import { useState } from 'react';
import { useBulkImportWordPairs } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dictionaryName: string;
}

export default function BulkImportDialog({ open, onOpenChange, dictionaryName }: BulkImportDialogProps) {
  const [input, setInput] = useState('');
  const bulkImport = useBulkImportWordPairs();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      await bulkImport.mutateAsync({
        dictionaryName,
        input: input.trim(),
      });
      toast.success(t('bulk.import.success'));
      setInput('');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || t('bulk.import.error'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('bulk.import.title')}</DialogTitle>
          <DialogDescription>{t('bulk.import.description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bulk-input">{t('bulk.import.label')}</Label>
            <Textarea
              id="bulk-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('bulk.import.placeholder')}
              rows={10}
              required
              className="font-mono text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              {t('bulk.import.cancel')}
            </Button>
            <Button type="submit" disabled={bulkImport.isPending} className="flex-1">
              {bulkImport.isPending ? t('bulk.import.submitting') : t('bulk.import.submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
