import { WrappedData } from '../types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  data: WrappedData;
}

export default function ActivityPatternSlide({ data }: Props) {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const dailyData = data.patterns.dailyActivity.map((count, index) => ({
    day: dayNames[index],
    commits: count,
  }));

  const hourlyData = data.patterns.hourlyActivity.map((count, index) => ({
    hour: `${index}:00`,
    commits: count,
  }));

  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold text-white mb-2">Your Rhythm</h2>
      <p className="text-green-200 mb-8 text-lg">When you were most productive</p>
      
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <h3 className="text-green-300 text-sm mb-4">Activity by Day</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={dailyData}>
              <XAxis dataKey="day" tick={{ fill: '#86efac', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ backgroundColor: '#064e3b', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#86efac' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="commits" fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <h3 className="text-green-300 text-sm mb-4">Activity by Hour</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={hourlyData.filter((_, i) => i % 3 === 0)}>
              <XAxis dataKey="hour" tick={{ fill: '#86efac', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ backgroundColor: '#064e3b', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#86efac' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="commits" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="text-3xl font-bold text-white">{data.patterns.peakDay}</div>
          <div className="text-green-300 text-sm">Most Active Day</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="text-3xl font-bold text-white">{data.patterns.peakHour}:00</div>
          <div className="text-green-300 text-sm">Peak Hour</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="text-3xl font-bold text-white">{data.patterns.longestStreak}</div>
          <div className="text-green-300 text-sm">Day Streak</div>
        </div>
      </div>
    </div>
  );
}
