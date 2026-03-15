import { useState } from 'react';
import { useRemoveWordPair, useToggleFavoriteWord } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import EditWordDialog from './EditWordDialog';
import { useLanguage } from '../contexts/LanguageContext';

interface WordListProps {
  dictionaryName: string;
  wordPairs: Array<[string, string]>;
  favoriteWords: string[];
  mode: 'all' | 'unknown' | 'favorites';
}

export default function WordList({ dictionaryName, wordPairs, favoriteWords, mode }: WordListProps) {
  const [editingWord, setEditingWord] = useState<[string, string] | null>(null);
  const [deletingWord, setDeletingWord] = useState<string | null>(null);
  const removeWord = useRemoveWordPair();
  const toggleFavorite = useToggleFavoriteWord();
  const { t } = useLanguage();

  const handleDelete = async () => {
    if (!deletingWord) return;

    try {
      await removeWord.mutateAsync({ dictionaryName, sourceWord: deletingWord });
      toast.success(t('word.delete.success'));
      setDeletingWord(null);
    } catch (error: any) {
      toast.error(error.message || t('word.delete.error'));
    }
  };

  const handleToggleFavorite = async (word: string) => {
    try {
      await toggleFavorite.mutateAsync({ dictionaryName, word });
      toast.success(t('word.favorite.success'));
    } catch (error: any) {
      toast.error(error.message || t('word.favorite.error'));
    }
  };

  if (wordPairs.length === 0) {
    const emptyStateConfig = {
      all: {
        icon: "/assets/generated/dictionary-icon.dim_64x64.png",
        alt: "Dictionary",
        title: t('dict.detail.noWords'),
        description: t('dict.detail.noWordsDesc'),
      },
      unknown: {
        icon: "/assets/generated/learning-icon.dim_64x64.png",
        alt: "Learning",
        title: t('dict.detail.noUnknown'),
        description: t('dict.detail.noUnknownDesc'),
      },
      favorites: {
        icon: "/assets/generated/learning-icon.dim_64x64.png",
        alt: "Favorites",
        title: t('dict.detail.noFavorites'),
        description: t('dict.detail.noFavoritesDesc'),
      },
    };

    const config = emptyStateConfig[mode];

    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <img 
            src={config.icon}
            alt={config.alt}
            className="mb-4 h-16 w-16 opacity-50"
          />
          <h3 className="mb-2 text-lg font-semibold">
            {config.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {config.description}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>{t('dict.detail.sourceWord')}</TableHead>
                <TableHead>{t('dict.detail.translation')}</TableHead>
                <TableHead className="text-right">{t('dict.detail.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wordPairs.map(([word, translation]) => {
                const isFavorite = favoriteWords.includes(word);
                return (
                  <TableRow key={word}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleFavorite(word)}
                        disabled={toggleFavorite.isPending}
                        className="h-8 w-8"
                      >
                        <Star 
                          className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                        />
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{word}</TableCell>
                    <TableCell>{translation}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingWord([word, translation])}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingWord(word)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingWord && (
        <EditWordDialog
          open={!!editingWord}
          onOpenChange={(open) => !open && setEditingWord(null)}
          dictionaryName={dictionaryName}
          originalWord={editingWord[0]}
          originalTranslation={editingWord[1]}
        />
      )}

      <AlertDialog open={!!deletingWord} onOpenChange={(open) => !open && setDeletingWord(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('word.delete.confirm')}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('dict.create.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={removeWord.isPending}>
              {t('dict.detail.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
