import { WrappedData } from '../types';

interface Props {
  data: WrappedData;
}

export default function EmojisSlide({ data }: Props) {
  const topEmoji = data.social.topEmojis[0];

  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold text-white mb-2">Your Vibe</h2>
      <p className="text-green-200 mb-10 text-lg">How you expressed yourself</p>
      
      {topEmoji ? (
        <>
          <div className="mb-8">
            <p className="text-green-300 text-lg mb-4">Your favorite emoji was</p>
            <div className="text-8xl mb-4">{topEmoji.emoji}</div>
            <p className="text-green-200">
              Used {topEmoji.count} times
            </p>
          </div>
          
          {data.social.topEmojis.length > 1 && (
            <div className="flex justify-center gap-6 mb-10">
              {data.social.topEmojis.slice(1, 6).map((emoji, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-4xl mb-2">{emoji.emoji}</div>
                  <div className="text-green-300 text-sm">{emoji.count}x</div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="mb-8">
          <p className="text-green-300 text-lg mb-4">No emojis found this year</p>
          <p className="text-green-200 text-sm">
            Maybe next year you'll express yourself more!
          </p>
        </div>
      )}
      
      {data.social.memorableComments.length > 0 && (
        <div className="max-w-2xl mx-auto">
          <h3 className="text-green-300 text-sm mb-4">Your Longest Comment</h3>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left">
            <p className="text-white text-sm italic">
              "{data.social.memorableComments[0].preview}"
            </p>
            <p className="text-green-400 text-xs mt-2">
              {data.social.memorableComments[0].length} characters
            </p>
          </div>
        </div>
      )}
      
      <p className="text-green-400 mt-8 text-sm opacity-70">
        You left {data.social.totalComments} comments this year
      </p>
    </div>
  );
}
