import ActivityCard from './ActivityCard.jsx'

export default function DaySection({ day }) {
  return (
    <div className="mb-10">
      <h3 className="text-lg font-semibold mb-3">Day {day.dayNumber}</h3>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="text-xs font-medium text-coral mb-2">
            Morning ({day.morning?.startTime} - {day.morning?.endTime})
          </div>
          <ActivityCard activity={day.morning} />
        </div>
        <div>
          <div className="text-xs font-medium text-coral mb-2">
            Afternoon ({day.afternoon?.startTime} - {day.afternoon?.endTime})
          </div>
          <ActivityCard activity={day.afternoon} />
        </div>
      </div>

      {day.evening && (
        <div className="mt-4 md:w-1/2 md:pr-2">
          <div className="text-xs font-medium text-coral mb-2">
            Evening ({day.evening.startTime} - {day.evening.endTime})
          </div>
          <ActivityCard activity={day.evening} />
        </div>
      )}
    </div>
  )
}
