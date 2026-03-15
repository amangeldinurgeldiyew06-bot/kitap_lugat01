import { useState } from 'react';
import { useGetDictionary } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Play, Upload } from 'lucide-react';
import WordList from './WordList';
import AddWordDialog from './AddWordDialog';
import BulkImportDialog from './BulkImportDialog';
import Quiz from './Quiz';
import { useLanguage } from '../contexts/LanguageContext';

interface DictionaryDetailProps {
  dictionaryName: string;
  onBack: () => void;
}

export default function DictionaryDetail({ dictionaryName, onBack }: DictionaryDetailProps) {
  const { data: dictionary, isLoading } = useGetDictionary(dictionaryName);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkImportDialog, setShowBulkImportDialog] = useState(false);
  const [quizMode, setQuizMode] = useState<'general' | 'unknown' | 'favorite' | null>(null);
  const { t } = useLanguage();

  if (quizMode && dictionary) {
    return (
      <Quiz 
        dictionaryName={dictionaryName}
        mode={quizMode}
        onExit={() => setQuizMode(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!dictionary) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('dict.detail.back')}
        </Button>
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">{t('common.error')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('dict.detail.back')}
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl">{dictionary.name}</CardTitle>
          <CardDescription className="text-lg">
            {dictionary.sourceLanguage} → {dictionary.targetLanguage}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('dict.detail.addWord')}
            </Button>
            <Button variant="outline" onClick={() => setShowBulkImportDialog(true)}>
              <Upload className="mr-2 h-4 w-4" />
              {t('dict.detail.bulkImport')}
            </Button>
            {dictionary.wordPairs.length >= 4 && (
              <Button variant="secondary" onClick={() => setQuizMode('general')}>
                <Play className="mr-2 h-4 w-4" />
                {t('dict.detail.startQuiz')}
              </Button>
            )}
            {dictionary.unknownWords.length >= 4 && (
              <Button variant="outline" onClick={() => setQuizMode('unknown')}>
                <Play className="mr-2 h-4 w-4" />
                {t('dict.detail.startUnknownQuiz')}
              </Button>
            )}
            {dictionary.favoriteWords.length >= 4 && (
              <Button variant="outline" onClick={() => setQuizMode('favorite')}>
                <Play className="mr-2 h-4 w-4" />
                {t('dict.detail.startFavoriteQuiz')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="all">
            {t('dict.detail.allWords')} ({dictionary.wordPairs.length})
          </TabsTrigger>
          <TabsTrigger value="unknown">
            {t('dict.detail.unknownWords')} ({dictionary.unknownWords.length})
          </TabsTrigger>
          <TabsTrigger value="favorites">
            {t('dict.detail.favoriteWords')} ({dictionary.favoriteWords.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <WordList 
            dictionaryName={dictionaryName}
            wordPairs={dictionary.wordPairs}
            favoriteWords={dictionary.favoriteWords}
            mode="all"
          />
        </TabsContent>
        <TabsContent value="unknown" className="mt-6">
          <WordList 
            dictionaryName={dictionaryName}
            wordPairs={dictionary.wordPairs.filter(([word]) => dictionary.unknownWords.includes(word))}
            favoriteWords={dictionary.favoriteWords}
            mode="unknown"
          />
        </TabsContent>
        <TabsContent value="favorites" className="mt-6">
          <WordList 
            dictionaryName={dictionaryName}
            wordPairs={dictionary.wordPairs.filter(([word]) => dictionary.favoriteWords.includes(word))}
            favoriteWords={dictionary.favoriteWords}
            mode="favorites"
          />
        </TabsContent>
      </Tabs>

      <AddWordDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        dictionaryName={dictionaryName}
      />
      <BulkImportDialog 
        open={showBulkImportDialog} 
        onOpenChange={setShowBulkImportDialog}
        dictionaryName={dictionaryName}
      />
    </div>
  );
}
