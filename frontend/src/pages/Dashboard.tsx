import { useState } from 'react';
import { useGetAllDictionaries } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, BookOpen, Brain } from 'lucide-react';
import CreateDictionaryDialog from '../components/CreateDictionaryDialog';
import DictionaryDetail from '../components/DictionaryDetail';
import { useLanguage } from '../contexts/LanguageContext';

export default function Dashboard() {
  const { data: dictionaries, isLoading } = useGetAllDictionaries();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDictionary, setSelectedDictionary] = useState<string | null>(null);
  const { t } = useLanguage();

  if (selectedDictionary) {
    return (
      <DictionaryDetail 
        dictionaryName={selectedDictionary} 
        onBack={() => setSelectedDictionary(null)} 
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('dashboard.createNew')}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        </div>
      ) : dictionaries && dictionaries.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dictionaries.map((dict) => (
            <Card 
              key={dict.name} 
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
              onClick={() => setSelectedDictionary(dict.name)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {dict.name}
                </CardTitle>
                <CardDescription>
                  {dict.sourceLanguage} → {dict.targetLanguage}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{dict.wordPairs.length} {t('dashboard.wordPairs')}</span>
                  </div>
                  {dict.unknownWords.length > 0 && (
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                      <Brain className="h-4 w-4" />
                      <span>{dict.unknownWords.length} {t('dashboard.unknownWords')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <img 
              src="/assets/generated/dictionary-icon.dim_64x64.png" 
              alt="Dictionary" 
              className="mb-4 h-16 w-16 opacity-50"
            />
            <h3 className="mb-2 text-lg font-semibold">{t('dashboard.noDictionaries')}</h3>
            <p className="mb-4 text-sm text-muted-foreground">{t('dashboard.noDictionariesDesc')}</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('dashboard.createNew')}
            </Button>
          </CardContent>
        </Card>
      )}

      <CreateDictionaryDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  );
}
