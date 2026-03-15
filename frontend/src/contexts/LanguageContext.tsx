import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'tk';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'app.title': 'Kitap',
    'header.login': 'Login',
    'header.logout': 'Logout',
    'header.loggingIn': 'Logging in...',
    
    // Welcome
    'welcome.title': 'Welcome to Kitap',
    'welcome.subtitle': 'Your multilingual word memorization tool. Create custom dictionaries for any language pair, track unknown words, and master new vocabulary through interactive quizzes.',
    'welcome.loginPrompt': 'Please log in to get started.',
    
    // Profile Setup
    'profile.setup.title': 'Welcome!',
    'profile.setup.description': 'Please enter your name to get started.',
    'profile.setup.nameLabel': 'Your Name',
    'profile.setup.namePlaceholder': 'Enter your name',
    'profile.setup.submit': 'Continue',
    'profile.setup.submitting': 'Saving...',
    'profile.setup.success': 'Profile created successfully!',
    'profile.setup.error': 'Failed to create profile',
    
    // Dashboard
    'dashboard.title': 'My Dictionaries',
    'dashboard.createNew': 'Create New Dictionary',
    'dashboard.noDictionaries': 'No dictionaries yet',
    'dashboard.noDictionariesDesc': 'Create your first dictionary to start learning!',
    'dashboard.wordPairs': 'word pairs',
    'dashboard.unknownWords': 'unknown',
    'dashboard.favoriteWords': 'favorites',
    
    // Dictionary Form
    'dict.create.title': 'Create New Dictionary',
    'dict.create.nameLabel': 'Dictionary Name',
    'dict.create.namePlaceholder': 'e.g., English-Turkmen',
    'dict.create.sourceLabel': 'Source Language',
    'dict.create.sourcePlaceholder': 'e.g., English',
    'dict.create.targetLabel': 'Target Language',
    'dict.create.targetPlaceholder': 'e.g., Turkmen',
    'dict.create.submit': 'Create Dictionary',
    'dict.create.submitting': 'Creating...',
    'dict.create.cancel': 'Cancel',
    'dict.create.success': 'Dictionary created successfully!',
    'dict.create.error': 'Failed to create dictionary',
    
    // Dictionary Detail
    'dict.detail.allWords': 'All Words',
    'dict.detail.unknownWords': 'Unknown Words',
    'dict.detail.favoriteWords': 'Favorites',
    'dict.detail.addWord': 'Add Word',
    'dict.detail.bulkImport': 'Bulk Import',
    'dict.detail.startQuiz': 'Start Quiz',
    'dict.detail.startUnknownQuiz': 'Quiz Unknown Words',
    'dict.detail.startFavoriteQuiz': 'Quiz Favorites',
    'dict.detail.noWords': 'No words yet',
    'dict.detail.noWordsDesc': 'Add your first word pair to get started!',
    'dict.detail.noUnknown': 'No unknown words',
    'dict.detail.noUnknownDesc': 'Great job! You know all the words.',
    'dict.detail.noFavorites': 'No favorite words',
    'dict.detail.noFavoritesDesc': 'Mark words as favorites to see them here.',
    'dict.detail.sourceWord': 'Source Word',
    'dict.detail.translation': 'Translation',
    'dict.detail.actions': 'Actions',
    'dict.detail.edit': 'Edit',
    'dict.detail.delete': 'Delete',
    'dict.detail.back': 'Back to Dictionaries',
    
    // Word Form
    'word.add.title': 'Add New Word',
    'word.add.sourceLabel': 'Source Word',
    'word.add.sourcePlaceholder': 'Enter word',
    'word.add.translationLabel': 'Translation',
    'word.add.translationPlaceholder': 'Enter translation',
    'word.add.submit': 'Add Word',
    'word.add.submitting': 'Adding...',
    'word.add.cancel': 'Cancel',
    'word.add.success': 'Word added successfully!',
    'word.add.error': 'Failed to add word',
    
    'word.edit.title': 'Edit Word',
    'word.edit.submit': 'Save Changes',
    'word.edit.submitting': 'Saving...',
    'word.edit.success': 'Word updated successfully!',
    'word.edit.error': 'Failed to update word',
    
    'word.delete.confirm': 'Are you sure you want to delete this word?',
    'word.delete.success': 'Word deleted successfully!',
    'word.delete.error': 'Failed to delete word',
    
    'word.favorite.success': 'Favorite status updated!',
    'word.favorite.error': 'Failed to update favorite status',
    
    // Bulk Import
    'bulk.import.title': 'Bulk Import Word Pairs',
    'bulk.import.description': 'Paste word pairs in the format "Word-Translation", one per line.',
    'bulk.import.label': 'Word Pairs',
    'bulk.import.placeholder': 'Man-Adam\nWoman-Aýal\nHouse-Öý',
    'bulk.import.submit': 'Import Words',
    'bulk.import.submitting': 'Importing...',
    'bulk.import.cancel': 'Cancel',
    'bulk.import.success': 'Words imported successfully!',
    'bulk.import.error': 'Failed to import words',
    
    // Quiz
    'quiz.title': 'Quiz',
    'quiz.question': 'What is the translation of:',
    'quiz.submit': 'Submit Answer',
    'quiz.next': 'Next Question',
    'quiz.finish': 'Finish Quiz',
    'quiz.correct': 'Correct!',
    'quiz.incorrect': 'Incorrect',
    'quiz.correctAnswer': 'The correct answer was:',
    'quiz.score': 'Score',
    'quiz.noQuestions': 'No questions available',
    'quiz.noQuestionsDesc': 'Add more words to start a quiz.',
    'quiz.results.title': 'Quiz Complete!',
    'quiz.results.score': 'Your Score',
    'quiz.results.correct': 'Correct',
    'quiz.results.incorrect': 'Incorrect',
    'quiz.results.backToDictionary': 'Back to Dictionary',
    'quiz.results.tryAgain': 'Try Again',
    
    // Footer
    'footer.builtWith': 'Built with',
    'footer.using': 'using',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.close': 'Close',
  },
  tk: {
    // Header
    'app.title': 'Kitap',
    'header.login': 'Giriş',
    'header.logout': 'Çykyş',
    'header.loggingIn': 'Giriş edilýär...',
    
    // Welcome
    'welcome.title': 'Kitap-a hoş geldiňiz',
    'welcome.subtitle': 'Köp dilli söz ýatlamak guraly. Islendik dil jübüti üçin özboluşly sözlükler dörediň, näbelli sözleri yzarlaň we interaktiw synaglar arkaly täze sözleri öwreniň.',
    'welcome.loginPrompt': 'Başlamak üçin giriň.',
    
    // Profile Setup
    'profile.setup.title': 'Hoş geldiňiz!',
    'profile.setup.description': 'Başlamak üçin adyňyzy giriziň.',
    'profile.setup.nameLabel': 'Adyňyz',
    'profile.setup.namePlaceholder': 'Adyňyzy giriziň',
    'profile.setup.submit': 'Dowam et',
    'profile.setup.submitting': 'Ýatda saklanýar...',
    'profile.setup.success': 'Profil üstünlikli döredildi!',
    'profile.setup.error': 'Profil döredilmedi',
    
    // Dashboard
    'dashboard.title': 'Meniň sözlüklerim',
    'dashboard.createNew': 'Täze sözlük dörediň',
    'dashboard.noDictionaries': 'Entek sözlük ýok',
    'dashboard.noDictionariesDesc': 'Öwrenmäge başlamak üçin ilkinji sözlügiňizi dörediň!',
    'dashboard.wordPairs': 'söz jübüti',
    'dashboard.unknownWords': 'näbelli',
    'dashboard.favoriteWords': 'halanlar',
    
    // Dictionary Form
    'dict.create.title': 'Täze sözlük dörediň',
    'dict.create.nameLabel': 'Sözlügiň ady',
    'dict.create.namePlaceholder': 'mysal: Iňlis-Türkmen',
    'dict.create.sourceLabel': 'Çeşme dili',
    'dict.create.sourcePlaceholder': 'mysal: Iňlis',
    'dict.create.targetLabel': 'Maksat dili',
    'dict.create.targetPlaceholder': 'mysal: Türkmen',
    'dict.create.submit': 'Sözlük dörediň',
    'dict.create.submitting': 'Döredilýär...',
    'dict.create.cancel': 'Ýatyr',
    'dict.create.success': 'Sözlük üstünlikli döredildi!',
    'dict.create.error': 'Sözlük döredilmedi',
    
    // Dictionary Detail
    'dict.detail.allWords': 'Ähli sözler',
    'dict.detail.unknownWords': 'Näbelli sözler',
    'dict.detail.favoriteWords': 'Halanlar',
    'dict.detail.addWord': 'Söz goş',
    'dict.detail.bulkImport': 'Köpçülikleýin import',
    'dict.detail.startQuiz': 'Synag başla',
    'dict.detail.startUnknownQuiz': 'Näbelli sözleri synag et',
    'dict.detail.startFavoriteQuiz': 'Halanlary synag et',
    'dict.detail.noWords': 'Entek söz ýok',
    'dict.detail.noWordsDesc': 'Başlamak üçin ilkinji söz jübütiňizi goşuň!',
    'dict.detail.noUnknown': 'Näbelli söz ýok',
    'dict.detail.noUnknownDesc': 'Ajaýyp! Ähli sözleri bilýärsiňiz.',
    'dict.detail.noFavorites': 'Halan söz ýok',
    'dict.detail.noFavoritesDesc': 'Sözleri halan hökmünde belläň.',
    'dict.detail.sourceWord': 'Çeşme söz',
    'dict.detail.translation': 'Terjime',
    'dict.detail.actions': 'Hereketler',
    'dict.detail.edit': 'Üýtget',
    'dict.detail.delete': 'Poz',
    'dict.detail.back': 'Sözlüklere dolan',
    
    // Word Form
    'word.add.title': 'Täze söz goş',
    'word.add.sourceLabel': 'Çeşme söz',
    'word.add.sourcePlaceholder': 'Söz giriziň',
    'word.add.translationLabel': 'Terjime',
    'word.add.translationPlaceholder': 'Terjime giriziň',
    'word.add.submit': 'Söz goş',
    'word.add.submitting': 'Goşulýar...',
    'word.add.cancel': 'Ýatyr',
    'word.add.success': 'Söz üstünlikli goşuldy!',
    'word.add.error': 'Söz goşulmady',
    
    'word.edit.title': 'Sözi üýtget',
    'word.edit.submit': 'Üýtgetmeleri ýatda sakla',
    'word.edit.submitting': 'Ýatda saklanýar...',
    'word.edit.success': 'Söz üstünlikli täzelendi!',
    'word.edit.error': 'Söz täzelenmedi',
    
    'word.delete.confirm': 'Bu sözi pozmak isleýärsiňizmi?',
    'word.delete.success': 'Söz üstünlikli pozuldy!',
    'word.delete.error': 'Söz pozulmady',
    
    'word.favorite.success': 'Halan ýagdaýy täzelendi!',
    'word.favorite.error': 'Halan ýagdaýy täzelenmedi',
    
    // Bulk Import
    'bulk.import.title': 'Köpçülikleýin söz jübütlerini import et',
    'bulk.import.description': 'Söz jübütlerini "Söz-Terjime" formatynda, her setirde bir söz goýuň.',
    'bulk.import.label': 'Söz jübütleri',
    'bulk.import.placeholder': 'Man-Adam\nWoman-Aýal\nHouse-Öý',
    'bulk.import.submit': 'Sözleri import et',
    'bulk.import.submitting': 'Import edilýär...',
    'bulk.import.cancel': 'Ýatyr',
    'bulk.import.success': 'Sözler üstünlikli import edildi!',
    'bulk.import.error': 'Sözler import edilmedi',
    
    // Quiz
    'quiz.title': 'Synag',
    'quiz.question': 'Terjimesi näme:',
    'quiz.submit': 'Jogaby iber',
    'quiz.next': 'Indiki sorag',
    'quiz.finish': 'Synagyň tamamla',
    'quiz.correct': 'Dogry!',
    'quiz.incorrect': 'Nädogry',
    'quiz.correctAnswer': 'Dogry jogap:',
    'quiz.score': 'Bal',
    'quiz.noQuestions': 'Sorag ýok',
    'quiz.noQuestionsDesc': 'Synag başlamak üçin has köp söz goşuň.',
    'quiz.results.title': 'Synag tamamlandy!',
    'quiz.results.score': 'Siziň balyňyz',
    'quiz.results.correct': 'Dogry',
    'quiz.results.incorrect': 'Nädogry',
    'quiz.results.backToDictionary': 'Sözlüge dolan',
    'quiz.results.tryAgain': 'Täzeden synanyş',
    
    // Footer
    'footer.builtWith': 'Söýgi bilen',
    'footer.using': 'ulanyp',
    
    // Common
    'common.loading': 'Ýüklenýär...',
    'common.error': 'Ýalňyşlyk',
    'common.close': 'Ýap',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('kitap-language');
    return (stored === 'tk' || stored === 'en') ? stored : 'en';
  });

  useEffect(() => {
    localStorage.setItem('kitap-language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
