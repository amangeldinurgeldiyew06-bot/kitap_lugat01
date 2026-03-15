import { useState, useEffect } from 'react';
import { useGetQuizQuestion, useMarkWordAsUnknown, useRemoveWordFromUnknown } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import type { QuizQuestion } from '../backend';

interface QuizProps {
  dictionaryName: string;
  mode: 'general' | 'unknown' | 'favorite';
  onExit: () => void;
}

export default function Quiz({ dictionaryName, mode, onExit }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [showResults, setShowResults] = useState(false);
  
  const getQuestion = useGetQuizQuestion();
  const markUnknown = useMarkWordAsUnknown();
  const removeUnknown = useRemoveWordFromUnknown();
  const { t } = useLanguage();

  const loadQuestion = async () => {
    try {
      const question = await getQuestion.mutateAsync({ dictionaryName, mode });
      if (question) {
        setCurrentQuestion(question);
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        toast.info(t('quiz.noQuestions'));
        onExit();
      }
    } catch (error: any) {
      toast.error(error.message || t('common.error'));
      onExit();
    }
  };

  useEffect(() => {
    loadQuestion();
  }, []);

  const handleAnswerSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = async () => {
    if (selectedAnswer === null || !currentQuestion) return;

    setIsAnswered(true);
    const isCorrect = selectedAnswer === Number(currentQuestion.correctAnswerIndex);

    if (isCorrect) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      if (mode === 'unknown') {
        try {
          await removeUnknown.mutateAsync({ dictionaryName, word: currentQuestion.question });
        } catch (error) {
          console.error('Failed to remove from unknown:', error);
        }
      }
    } else {
      setScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      if (mode === 'general' || mode === 'favorite') {
        try {
          await markUnknown.mutateAsync({ dictionaryName, word: currentQuestion.question });
        } catch (error) {
          console.error('Failed to mark as unknown:', error);
        }
      }
    }
  };

  const handleNext = () => {
    loadQuestion();
  };

  const handleFinish = () => {
    setShowResults(true);
  };

  if (showResults) {
    const total = score.correct + score.incorrect;
    const percentage = total > 0 ? Math.round((score.correct / total) * 100) : 0;

    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">{t('quiz.results.title')}</CardTitle>
            <CardDescription className="text-lg">{t('quiz.results.score')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="mb-4 text-6xl font-bold text-primary">{percentage}%</div>
              <div className="flex justify-center gap-8 text-lg">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>{score.correct} {t('quiz.results.correct')}</span>
                </div>
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <XCircle className="h-5 w-5" />
                  <span>{score.incorrect} {t('quiz.results.incorrect')}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onExit} className="flex-1">
                {t('quiz.results.backToDictionary')}
              </Button>
              <Button onClick={() => { setShowResults(false); setScore({ correct: 0, incorrect: 0 }); loadQuestion(); }} className="flex-1">
                {t('quiz.results.tryAgain')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const isCorrect = isAnswered && selectedAnswer === Number(currentQuestion.correctAnswerIndex);
  const isIncorrect = isAnswered && selectedAnswer !== Number(currentQuestion.correctAnswerIndex);

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onExit} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('dict.detail.back')}
      </Button>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>{t('quiz.score')}: {score.correct}/{score.correct + score.incorrect}</span>
            <img 
              src="/assets/generated/quiz-icon.dim_64x64.png" 
              alt="Quiz" 
              className="h-8 w-8"
            />
          </div>
          <CardTitle className="text-2xl">{t('quiz.question')}</CardTitle>
          <CardDescription className="text-3xl font-bold text-foreground pt-2">
            {currentQuestion.question}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {currentQuestion.options.map(([word, translation], index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === Number(currentQuestion.correctAnswerIndex);
              
              let buttonVariant: 'outline' | 'default' | 'secondary' = 'outline';
              let className = '';
              
              if (isAnswered) {
                if (isCorrectAnswer) {
                  className = 'border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300';
                } else if (isSelected) {
                  className = 'border-red-500 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300';
                }
              } else if (isSelected) {
                buttonVariant = 'default';
              }

              return (
                <Button
                  key={index}
                  variant={buttonVariant}
                  className={`h-auto justify-start p-4 text-left ${className}`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={isAnswered}
                >
                  <div className="flex items-center gap-3 w-full">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 font-semibold">
                      {String.fromCharCode(97 + index)}
                    </span>
                    <span className="flex-1 text-lg">{translation}</span>
                    {isAnswered && isCorrectAnswer && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    {isAnswered && isSelected && !isCorrectAnswer && <XCircle className="h-5 w-5 text-red-600" />}
                  </div>
                </Button>
              );
            })}
          </div>

          {isAnswered && (
            <div className={`rounded-lg p-4 ${isCorrect ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-700 dark:text-green-300">{t('quiz.correct')}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-red-700 dark:text-red-300">{t('quiz.incorrect')}</span>
                  </>
                )}
              </div>
              {isIncorrect && (
                <p className="text-sm text-muted-foreground">
                  {t('quiz.correctAnswer')} <span className="font-semibold">{currentQuestion.options[Number(currentQuestion.correctAnswerIndex)][1]}</span>
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {!isAnswered ? (
              <Button 
                onClick={handleSubmit} 
                disabled={selectedAnswer === null}
                className="flex-1"
              >
                {t('quiz.submit')}
              </Button>
            ) : (
              <>
                <Button onClick={handleNext} className="flex-1">
                  {t('quiz.next')}
                </Button>
                <Button onClick={handleFinish} variant="outline" className="flex-1">
                  {t('quiz.finish')}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
