export default function ActivityCard({ activity }) {
    if (!activity) return null

    const handleClick = () => {
        const query = encodeURIComponent(activity.title)
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
    }

    return (
        <div
            onClick={handleClick}
            className="flex gap-4 rounded-xl border border-black/5 p-3 cursor-pointer hover:border-black/15 hover:bg-black/[0.02] transition"
        >
            <img
                src={activity.imageUrl}
                alt={activity.title}
                className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
            />
            <div className="min-w-0">
                <div className="font-semibold text-sm">{activity.title}</div>
                <p className="text-xs text-black/50 mt-1 leading-relaxed">{activity.description}</p>
                <div className="text-xs text-black/60 mt-2">🎟️ {activity.ticketInfo}</div>
                <div className="text-xs text-coral mt-1.5 font-medium">📍 View on map</div>
            </div>
        </div>
    )
}