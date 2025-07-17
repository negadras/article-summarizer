import {FC, useEffect, useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {BarChart, Clock, FileText} from "lucide-react";
import {UserStats as UserStatsType} from "@/types/api";
import {userStatsService} from "@/lib/userStatsService";

/**
 * UserStats component displays usage statistics for the authenticated user
 */
const UserStats: FC = () => {
  const [userStats, setUserStats] = useState<UserStatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setIsLoading(true);
        const stats = await userStatsService.getUserStats();
        setUserStats(stats);
        setError(null);
      } catch (err) {
        setError("Failed to load user statistics");
        console.error("Error fetching user statistics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }

    return `${remainingMinutes}m`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4" id="user-stats-heading">Your Stats</h3>

          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 mr-4"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !userStats) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4" id="user-stats-heading">Your Stats</h3>
          <p className="text-gray-500 text-center py-4">Unable to load statistics.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4" id="user-stats-heading">Your Stats</h3>

        <div
          className="space-y-4"
          role="region"
          aria-labelledby="user-stats-heading"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4" aria-hidden="true">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500" id="total-summaries-label">Total Summaries</p>
              <p className="font-semibold text-gray-900" aria-labelledby="total-summaries-label">{userStats.totalSummaries}</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4" aria-hidden="true">
              <BarChart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500" id="words-saved-label">Words Saved</p>
              <p className="font-semibold text-gray-900" aria-labelledby="words-saved-label">{userStats.wordsSaved.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4" aria-hidden="true">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500" id="time-saved-label">Time Saved</p>
              <p className="font-semibold text-gray-900" aria-labelledby="time-saved-label">{formatTime(userStats.timeSaved)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStats;
