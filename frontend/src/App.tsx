import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfileSetupModal from './components/ProfileSetupModal';
import Dashboard from './pages/Dashboard';
import { LanguageProvider } from './contexts/LanguageContext';

export default function App() {
  const { identity, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            {loginStatus === 'initializing' ? (
              <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                <div className="text-center">
                  <img 
                    src="/assets/generated/kitap-logo-new-transparent.dim_200x200.png" 
                    alt="Kitap" 
                    className="mx-auto mb-6 h-24 w-auto object-contain animate-pulse"
                  />
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              </div>
            ) : !isAuthenticated ? (
              <div className="container mx-auto px-4 py-16">
                <div className="mx-auto max-w-2xl text-center">
                  <img 
                    src="/assets/generated/kitap-logo-new-transparent.dim_200x200.png" 
                    alt="Kitap" 
                    className="mx-auto mb-8 h-32 w-auto object-contain"
                  />
                  <h1 className="mb-4 text-4xl font-bold">Welcome to Kitap</h1>
                  <p className="mb-8 text-lg text-muted-foreground">
                    Your multilingual word memorization tool. Create custom dictionaries for any language pair, track unknown words, and master new vocabulary through interactive quizzes.
                  </p>
                  <p className="text-muted-foreground">
                    Please log in to get started.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {showProfileSetup && <ProfileSetupModal />}
                <Dashboard />
              </>
            )}
          </main>
          <Footer />
          <Toaster />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
