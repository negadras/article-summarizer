import {FC} from "react";
import {useAuth} from "@/hooks/use-auth";
import QuickActions from "./QuickActions";
import RecentSummaries from "./RecentSummaries";
import SavedSummaries from "./SavedSummaries";
import UserStats from "./UserStats";
import {Button} from "@/components/ui/button";

interface UserDashboardProps {
  onStartSummarize: () => void;
}

/**
 * UserDashboard component displays the personalized dashboard for authenticated users
 * It includes quick actions, recent summaries, saved summaries, and user stats
 */
const UserDashboard: FC<UserDashboardProps> = ({ onStartSummarize }) => {
  const { user } = useAuth();


  return (
    <div className="flex flex-col gap-8">
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 border border-primary/10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center">
          <div className="mr-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">{user?.username?.[0]?.toUpperCase() || 'U'}</span>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Welcome back, {user?.username || 'User'}!
            </h2>
            <p className="text-gray-600">
              Ready to summarize more content? Your personalized dashboard awaits.
            </p>
          </div>
        </div>
      </section>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
        <QuickActions onStartSummarize={onStartSummarize} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <RecentSummaries />
        </div>
        <div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <UserStats />
          </div>
          <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-450">
            <SavedSummaries />
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <Button onClick={onStartSummarize} size="lg">
          Start New Summarization
        </Button>
      </div>
    </div>
  );
};

export default UserDashboard;
