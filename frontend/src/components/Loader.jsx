export default function Loader({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="w-10 h-10 border-2 border-black/10 border-t-coral rounded-full animate-spin" />
      <p className="text-black/50 text-sm">{message}</p>
    </div>
  )
}
