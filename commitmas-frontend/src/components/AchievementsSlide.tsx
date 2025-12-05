import { WrappedData } from '../types';

interface Props {
  data: WrappedData;
}

export default function AchievementsSlide({ data }: Props) {
  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold text-white mb-2">Your Achievements</h2>
      <p className="text-green-200 mb-10 text-lg">Badges you've earned this year</p>
      
      {data.achievements.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
          {data.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 transform hover:scale-105 transition-all duration-300"
            >
              <div className="text-5xl mb-3">{achievement.icon}</div>
              <div className="text-white font-bold text-lg mb-1">{achievement.name}</div>
              <div className="text-green-300 text-sm">{achievement.description}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
          <div className="text-5xl mb-4">🌱</div>
          <div className="text-white font-bold text-lg mb-2">Just Getting Started</div>
          <div className="text-green-300 text-sm">
            Keep coding and you'll unlock achievements next year!
          </div>
        </div>
      )}
    </div>
  );
}
