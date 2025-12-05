import { WrappedData } from '../types';
import { Star, GitFork } from 'lucide-react';

interface Props {
  data: WrappedData;
}

export default function TopReposSlide({ data }: Props) {
  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold text-white mb-2">Your Top Repos</h2>
      <p className="text-green-200 mb-10 text-lg">Where you spent most of your time</p>
      
      <div className="space-y-4 max-w-2xl mx-auto">
        {data.repos.topRepos.slice(0, 5).map((repo, index) => (
          <div
            key={repo.name}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4 transform hover:scale-102 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-xl">
              {index + 1}
            </div>
            <div className="flex-1 text-left">
              <div className="text-white font-semibold text-lg">{repo.name}</div>
              <div className="text-green-300 text-sm">
                {repo.language || 'No language detected'}
              </div>
            </div>
            <div className="flex items-center gap-4 text-green-200">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span>{repo.stars}</span>
              </div>
              <div className="flex items-center gap-1">
                <GitFork className="w-4 h-4" />
                <span>{repo.forks}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-green-400 mt-8 text-sm opacity-70">
        You worked on {data.repos.totalRepos} repositories this year
      </p>
    </div>
  );
}
