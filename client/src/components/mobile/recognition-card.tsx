import { MoreHorizontal, Sparkles } from "lucide-react";
import { BADGE_IMAGE, isMe, type RecognitionFeedItem } from "@/lib/mobile-data";
import { getAccount } from "@/lib/account";

export function RecognitionCard({ item }: { item: RecognitionFeedItem }) {
  const account = getAccount();
  const recipientIsYou = isMe(item.recipientEmail, account);
  const senderIsYou = isMe(item.senderEmail, account);

  return (
    <article className="bg-white rounded-2xl border border-stone-200/70 shadow-sm overflow-hidden">
      <header className="flex items-center px-4 py-3">
        <img
          src={item.senderAvatar}
          alt=""
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex-1 ml-3 min-w-0">
          <p className="text-sm text-stone-900 truncate">
            <span className="font-semibold">{senderIsYou ? "You" : item.senderName}</span>
            <span className="text-stone-500"> appreciated </span>
            <span className="font-semibold">
              {recipientIsYou ? "You" : item.recipientName}
            </span>
          </p>
        </div>
        <button
          className="p-2 -mr-2 rounded-full hover:bg-stone-100 transition-colors"
          aria-label="More actions"
        >
          <MoreHorizontal className="w-4 h-4 text-stone-500" />
        </button>
      </header>

      <div className="border-t border-stone-100 px-4 py-2.5 flex items-center">
        <img
          src={item.recipientAvatar}
          alt=""
          className="w-8 h-8 rounded-full object-cover"
        />
        <p className="flex-1 ml-3 text-sm text-stone-700 truncate">
          {recipientIsYou ? "You" : item.recipientName}
        </p>
        <span className="text-xs text-stone-400 shrink-0">{item.timeAgo}</span>
      </div>

      <div className="px-4 pt-2 pb-1 flex justify-center">
        <img
          src={BADGE_IMAGE[item.badge]}
          alt={item.badgeLabel}
          className="w-44 h-44 object-contain"
        />
      </div>

      <div className="px-5 pb-5 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="font-mobile font-semibold text-stone-900 text-base">
            {item.badgeLabel}
          </h3>
          {item.points != null && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-1">
              <Sparkles className="w-3 h-3" />
              {item.points} pts
            </span>
          )}
        </div>
        <div className="border-t border-stone-100 my-3" />
        <p className="text-sm text-stone-600 leading-relaxed">{item.message}</p>
      </div>
    </article>
  );
}
