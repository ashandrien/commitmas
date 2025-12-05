import { WrappedData } from '../types';

interface Props {
  data: WrappedData;
}

export default function WelcomeSlide({ data }: Props) {
  return (
    <div className="text-center">
      <img
        src={data.user.avatar}
        alt={data.user.username}
        className="w-32 h-32 rounded-full mx-auto mb-8 border-4 border-green-400 shadow-2xl"
      />
      <h1 className="text-5xl font-bold text-white mb-4">
        {data.user.name || data.user.username}'s
      </h1>
      <h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-400 mb-6">
        {data.year} Wrapped
      </h2>
      <p className="text-xl text-green-200 opacity-80">
        Let's look back at your year in code
      </p>
    </div>
  );
}
