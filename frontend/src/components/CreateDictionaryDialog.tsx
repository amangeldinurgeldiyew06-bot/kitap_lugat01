import { useState } from 'react';
import { useCreateDictionary } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

interface CreateDictionaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateDictionaryDialog({ open, onOpenChange }: CreateDictionaryDialogProps) {
  const [name, setName] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const createDictionary = useCreateDictionary();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sourceLanguage.trim() || !targetLanguage.trim()) return;

    try {
      await createDictionary.mutateAsync({
        name: name.trim(),
        sourceLanguage: sourceLanguage.trim(),
        targetLanguage: targetLanguage.trim(),
      });
      toast.success(t('dict.create.success'));
      setName('');
      setSourceLanguage('');
      setTargetLanguage('');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || t('dict.create.error'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('dict.create.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dict-name">{t('dict.create.nameLabel')}</Label>
            <Input
              id="dict-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('dict.create.namePlaceholder')}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source-lang">{t('dict.create.sourceLabel')}</Label>
            <Input
              id="source-lang"
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
              placeholder={t('dict.create.sourcePlaceholder')}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target-lang">{t('dict.create.targetLabel')}</Label>
            <Input
              id="target-lang"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              placeholder={t('dict.create.targetPlaceholder')}
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              {t('dict.create.cancel')}
            </Button>
            <Button type="submit" disabled={createDictionary.isPending} className="flex-1">
              {createDictionary.isPending ? t('dict.create.submitting') : t('dict.create.submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
