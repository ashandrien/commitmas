import { WrappedData } from '../types';

interface Props {
  data: WrappedData;
}

const languageColors: Record<string, string> = {
  JavaScript: 'bg-yellow-400',
  TypeScript: 'bg-blue-500',
  Python: 'bg-green-500',
  Java: 'bg-orange-500',
  'C++': 'bg-pink-500',
  C: 'bg-gray-500',
  'C#': 'bg-purple-500',
  Go: 'bg-cyan-500',
  Rust: 'bg-orange-600',
  Ruby: 'bg-red-500',
  PHP: 'bg-indigo-500',
  Swift: 'bg-orange-400',
  Kotlin: 'bg-purple-400',
  Scala: 'bg-red-400',
  Shell: 'bg-green-600',
  HTML: 'bg-orange-500',
  CSS: 'bg-blue-400',
  Vue: 'bg-emerald-500',
  Dart: 'bg-blue-600',
};

export default function LanguagesSlide({ data }: Props) {
  const languages = Object.entries(data.repos.languages);
  const topLanguage = languages[0];

  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold text-white mb-2">Your Languages</h2>
      <p className="text-green-200 mb-10 text-lg">The tools of your trade</p>
      
      {topLanguage && (
        <div className="mb-10">
          <p className="text-green-300 text-lg mb-2">Your top language was</p>
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-400">
            {topLanguage[0]}
          </div>
          <p className="text-green-200 mt-2">
            Used in {topLanguage[1]}% of your repositories
          </p>
        </div>
      )}
      
      <div className="max-w-xl mx-auto space-y-3">
        {languages.slice(0, 6).map(([lang, percentage]) => (
          <div key={lang} className="flex items-center gap-4">
            <div className="w-24 text-right text-green-200 text-sm">{lang}</div>
            <div className="flex-1 h-6 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full ${languageColors[lang] || 'bg-green-500'} rounded-full transition-all duration-1000`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="w-12 text-left text-green-300 text-sm">{percentage}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
