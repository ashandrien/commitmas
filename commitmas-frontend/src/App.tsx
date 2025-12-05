import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Github, ChevronLeft, ChevronRight } from 'lucide-react';
import { WrappedData, User } from './types';
import WelcomeSlide from './components/WelcomeSlide';
import StatsOverviewSlide from './components/StatsOverviewSlide';
import TopReposSlide from './components/TopReposSlide';
import LanguagesSlide from './components/LanguagesSlide';
import ActivityPatternSlide from './components/ActivityPatternSlide';
import EmojisSlide from './components/EmojisSlide';
import AchievementsSlide from './components/AchievementsSlide';
import FinalSlide from './components/FinalSlide';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [wrappedData, setWrappedData] = useState<WrappedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingWrapped, setLoadingWrapped] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const slides = wrappedData ? [
    <WelcomeSlide key="welcome" data={wrappedData} />,
    <StatsOverviewSlide key="stats" data={wrappedData} />,
    <TopReposSlide key="repos" data={wrappedData} />,
    <LanguagesSlide key="languages" data={wrappedData} />,
    <ActivityPatternSlide key="activity" data={wrappedData} />,
    <EmojisSlide key="emojis" data={wrappedData} />,
    <AchievementsSlide key="achievements" data={wrappedData} />,
    <FinalSlide key="final" data={wrappedData} />,
  ] : [];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_URL}/api/user`, {
        credentials: 'include',
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = `${API_URL}/auth/github`;
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      setWrappedData(null);
      setCurrentSlide(0);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const fetchWrapped = async () => {
    setLoadingWrapped(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/wrapped`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setWrappedData(data);
        setCurrentSlide(0);
      } else {
        setError('Failed to fetch your wrapped data. Please try again.');
      }
    } catch (err) {
      console.error('Failed to fetch wrapped:', err);
      setError('Failed to connect to the server. Please try again.');
    } finally {
      setLoadingWrapped(false);
    }
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, slides.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 flex items-center justify-center">
        <Spinner className="w-12 h-12 text-white" />
      </div>
    );
  }

  // Not logged in - show login page
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
            Commitmas
          </h1>
          <p className="text-2xl text-green-200 mb-2">Your Year in Code, Wrapped</p>
          <p className="text-lg text-green-300 mb-12 opacity-80">
            Discover your GitHub highlights from {new Date().getFullYear()}
          </p>
          
          <Button
            onClick={handleLogin}
            size="lg"
            className="bg-white text-green-900 hover:bg-green-100 text-lg px-8 py-6 rounded-full font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <Github className="mr-3 h-6 w-6" />
            Sign in with GitHub
          </Button>
          
          <p className="text-green-400 mt-8 text-sm opacity-70">
            We only access your public repository data
          </p>
        </div>
        
        <div className="absolute bottom-8 text-green-400 text-sm opacity-50">
          Made with love for developers everywhere
        </div>
      </div>
    );
  }

  // Logged in but no wrapped data yet
  if (!wrappedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          <img
            src={user.avatar}
            alt={user.username}
            className="w-24 h-24 rounded-full mx-auto mb-6 border-4 border-green-400 shadow-xl"
          />
          <h1 className="text-4xl font-bold text-white mb-2">
            Hey, {user.displayName || user.username}!
          </h1>
          <p className="text-xl text-green-200 mb-8">
            Ready to see your {new Date().getFullYear()} in code?
          </p>
          
          {error && (
            <div className="bg-red-500/20 border border-red-400 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <Button
            onClick={fetchWrapped}
            disabled={loadingWrapped}
            size="lg"
            className="bg-white text-green-900 hover:bg-green-100 text-lg px-8 py-6 rounded-full font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
          >
            {loadingWrapped ? (
              <>
                <Spinner className="mr-3 h-5 w-5" />
                Generating your Wrapped...
              </>
            ) : (
              'Generate My Wrapped'
            )}
          </Button>
          
          <button
            onClick={handleLogout}
            className="block mx-auto mt-6 text-green-400 hover:text-green-300 text-sm underline"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // Show wrapped slides
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 relative overflow-hidden">
      {/* Slide content */}
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-4xl animate-fade-in">
          {slides[currentSlide]}
        </div>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
        <Button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          variant="outline"
          size="icon"
          className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-white w-6'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
        
        <Button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          variant="outline"
          size="icon"
          className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 text-white/60 hover:text-white text-sm"
      >
        Sign out
      </button>
    </div>
  );
}

export default App
