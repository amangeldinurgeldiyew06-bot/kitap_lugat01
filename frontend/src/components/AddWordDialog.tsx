import { useState } from 'react';
import { useAddWordPair } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

interface AddWordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dictionaryName: string;
}

export default function AddWordDialog({ open, onOpenChange, dictionaryName }: AddWordDialogProps) {
  const [sourceWord, setSourceWord] = useState('');
  const [translation, setTranslation] = useState('');
  const addWord = useAddWordPair();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceWord.trim() || !translation.trim()) return;

    try {
      await addWord.mutateAsync({
        dictionaryName,
        sourceWord: sourceWord.trim(),
        translation: translation.trim(),
      });
      toast.success(t('word.add.success'));
      setSourceWord('');
      setTranslation('');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || t('word.add.error'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('word.add.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source-word">{t('word.add.sourceLabel')}</Label>
            <Input
              id="source-word"
              value={sourceWord}
              onChange={(e) => setSourceWord(e.target.value)}
              placeholder={t('word.add.sourcePlaceholder')}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="translation">{t('word.add.translationLabel')}</Label>
            <Input
              id="translation"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              placeholder={t('word.add.translationPlaceholder')}
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              {t('word.add.cancel')}
            </Button>
            <Button type="submit" disabled={addWord.isPending} className="flex-1">
              {addWord.isPending ? t('word.add.submitting') : t('word.add.submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
