import { ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PracticeHistoryWidgetProps {
  onExpand: () => void;
}

export function PracticeHistoryWidget({ onExpand }: PracticeHistoryWidgetProps) {
  const sessions = [
    { id: 1, overall: 91, date: "Today", change: 9 },
    { id: 2, overall: 82, date: "Yesterday", change: -3 },
    { id: 3, overall: 85, date: "2 days ago", change: 0 }
  ];

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-400";
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Recent Practice</h3>
        <button
          onClick={onExpand}
          className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium text-sm"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100 hover:border-purple-300 transition-colors cursor-pointer"
            onClick={onExpand}
          >
            <div>
              <div className="font-bold text-gray-900">Session #{session.id}</div>
              <div className="text-sm text-gray-600">{session.date}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-bold text-2xl text-purple-600">{session.overall}</div>
                <div className="text-xs text-gray-600">Overall</div>
              </div>
              {session.change !== 0 && (
                <div className={`flex items-center gap-1 ${getChangeColor(session.change)}`}>
                  {getTrendIcon(session.change)}
                  <span className="text-sm font-bold">{Math.abs(session.change)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
