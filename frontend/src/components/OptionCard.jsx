export default function OptionCard({ emoji, title, subtitle, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-xl border p-5 transition ${
        selected ? 'border-ink ring-1 ring-ink' : 'border-black/10 hover:border-black/30'
      }`}
    >
      <div className="text-2xl mb-6">{emoji}</div>
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-black/50 mt-1">{subtitle}</div>
    </button>
  )
}
