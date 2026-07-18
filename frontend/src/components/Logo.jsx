export default function Logo({ withWordmark = false, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="17" cy="17" r="16" stroke="#141414" strokeWidth="1.5" fill="white" />
        <path d="M17 3 A14 14 0 0 1 17 31" fill="#FFE1D9" opacity="0.5" />
        <circle cx="14" cy="13" r="5" fill="#FF5A36" />
        <path d="M4 22 Q17 12 30 22" stroke="#141414" strokeWidth="1.5" fill="none" />
        <path d="M2 26 Q17 17 32 26" stroke="#141414" strokeWidth="1.2" fill="none" opacity="0.6" />
      </svg>
      {withWordmark && (
        <span className="font-display font-semibold text-lg tracking-tight">Wayfarer AI</span>
      )}
    </div>
  )
}
