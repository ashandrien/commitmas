import { WrappedData } from '../types';
import { GitCommit, GitPullRequest, CircleDot, Eye } from 'lucide-react';

interface Props {
  data: WrappedData;
}

export default function StatsOverviewSlide({ data }: Props) {
  const stats = [
    {
      icon: GitCommit,
      value: data.stats.totalCommits,
      label: 'Commits',
      color: 'from-green-400 to-emerald-500',
    },
    {
      icon: GitPullRequest,
      value: data.stats.prsOpened,
      label: 'Pull Requests',
      color: 'from-blue-400 to-cyan-500',
    },
    {
      icon: CircleDot,
      value: data.stats.issuesOpened,
      label: 'Issues Opened',
      color: 'from-purple-400 to-pink-500',
    },
    {
      icon: Eye,
      value: data.stats.reviewsGiven,
      label: 'Reviews Given',
      color: 'from-orange-400 to-yellow-500',
    },
  ];

  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold text-white mb-2">Your Numbers</h2>
      <p className="text-green-200 mb-12 text-lg">Here's what you accomplished in {data.year}</p>
      
      <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 transform hover:scale-105 transition-all duration-300"
          >
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4`}>
              <stat.icon className="w-7 h-7 text-white" />
            </div>
            <div className="text-4xl font-black text-white mb-1">
              {stat.value.toLocaleString()}
            </div>
            <div className="text-green-300 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
