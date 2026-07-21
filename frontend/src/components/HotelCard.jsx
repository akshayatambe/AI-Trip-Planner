export default function HotelCard({ hotel }) {
    const handleClick = () => {
        const query = encodeURIComponent(`${hotel.name}, ${hotel.address}`)
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
    }

    return (
        <div
            onClick={handleClick}
            className="rounded-xl overflow-hidden border border-black/5 cursor-pointer hover:border-black/15 transition"
        >
            <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-36 object-cover" />
            <div className="p-3">
                <div className="font-semibold text-sm">{hotel.name}</div>
                <div className="text-xs text-black/50 mt-1 flex items-start gap-1">
                    <span>📍</span>
                    <span>{hotel.address}</span>
                </div>
                <div className="text-xs text-black/60 mt-1">💵 {hotel.pricePerNight}</div>
                <div className="text-xs text-black/60 mt-0.5">⭐ {hotel.rating} stars</div>
                <div className="text-xs text-coral mt-1.5 font-medium">View on map</div>
            </div>
        </div>
    )
}