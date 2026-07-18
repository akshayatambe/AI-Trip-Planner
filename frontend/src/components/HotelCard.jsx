export default function HotelCard({ hotel }) {
  return (
    <div className="rounded-xl overflow-hidden border border-black/5">
      <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-36 object-cover" />
      <div className="p-3">
        <div className="font-semibold text-sm">{hotel.name}</div>
        <div className="text-xs text-black/50 mt-1 flex items-start gap-1">
          <span>📍</span>
          <span>{hotel.address}</span>
        </div>
        <div className="text-xs text-black/60 mt-1">💵 {hotel.pricePerNight}</div>
        <div className="text-xs text-black/60 mt-0.5">⭐ {hotel.rating} stars</div>
      </div>
    </div>
  )
}
