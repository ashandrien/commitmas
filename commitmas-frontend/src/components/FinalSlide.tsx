import { WrappedData } from '../types';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  data: WrappedData;
}

export default function FinalSlide({ data }: Props) {
  const handleShare = async () => {
    const text = `My ${data.year} GitHub Wrapped:\n` +
      `${data.stats.totalCommits} commits\n` +
      `${data.stats.prsOpened} PRs\n` +
      `${data.patterns.longestStreak} day streak\n` +
      `Top language: ${Object.keys(data.repos.languages)[0] || 'N/A'}\n\n` +
      `Check out your own at commitmas.app!`;
    
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-5xl font-bold text-white mb-4">Merry Commitmas!</h2>
      <p className="text-green-200 mb-8 text-xl">
        Here's to an even better {data.year + 1}
      </p>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto mb-8">
        <img
          src={data.user.avatar}
          alt={data.user.username}
          className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-green-400"
        />
        <div className="text-white font-bold text-xl mb-4">
          @{data.user.username}
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{data.stats.totalCommits}</div>
            <div className="text-green-300 text-xs">Commits</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{data.stats.prsOpened}</div>
            <div className="text-green-300 text-xs">PRs</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{data.patterns.longestStreak}</div>
            <div className="text-green-300 text-xs">Day Streak</div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center gap-4">
        <Button
          onClick={handleShare}
          className="bg-white text-green-900 hover:bg-green-100 rounded-full px-6"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>
      
      <p className="text-green-400 mt-8 text-sm opacity-70">
        Made with love for developers everywhere
      </p>
    </div>
  );
}
