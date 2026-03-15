import { useState, useEffect } from 'react';
import { useUpdateWordPair } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

interface EditWordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dictionaryName: string;
  originalWord: string;
  originalTranslation: string;
}

export default function EditWordDialog({ 
  open, 
  onOpenChange, 
  dictionaryName, 
  originalWord, 
  originalTranslation 
}: EditWordDialogProps) {
  const [sourceWord, setSourceWord] = useState(originalWord);
  const [translation, setTranslation] = useState(originalTranslation);
  const updateWord = useUpdateWordPair();
  const { t } = useLanguage();

  useEffect(() => {
    setSourceWord(originalWord);
    setTranslation(originalTranslation);
  }, [originalWord, originalTranslation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceWord.trim() || !translation.trim()) return;

    try {
      await updateWord.mutateAsync({
        dictionaryName,
        originalWord,
        newWord: sourceWord.trim(),
        newTranslation: translation.trim(),
      });
      toast.success(t('word.edit.success'));
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || t('word.edit.error'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('word.edit.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-source-word">{t('word.add.sourceLabel')}</Label>
            <Input
              id="edit-source-word"
              value={sourceWord}
              onChange={(e) => setSourceWord(e.target.value)}
              placeholder={t('word.add.sourcePlaceholder')}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-translation">{t('word.add.translationLabel')}</Label>
            <Input
              id="edit-translation"
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
            <Button type="submit" disabled={updateWord.isPending} className="flex-1">
              {updateWord.isPending ? t('word.edit.submitting') : t('word.edit.submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
