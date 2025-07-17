import {FC} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Bookmark, FileText, History, Link} from "lucide-react";

interface QuickActionsProps {
  onStartSummarize: () => void;
}

/**
 * QuickActions component displays important buttons for common user actions
 */
const QuickActions: FC<QuickActionsProps> = ({ onStartSummarize }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4" id="quick-actions-heading">Quick Actions</h3>

        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          role="group"
          aria-labelledby="quick-actions-heading"
        >
          <Button
            variant="outline"
            className="h-auto py-4 px-4 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all"
            aria-label="Summarize Text"
            onClick={onStartSummarize}
          >
            <FileText className="h-5 w-5" aria-hidden="true" />
            <span>Summarize Text</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 px-4 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all"
            aria-label="Summarize URL"
            onClick={onStartSummarize}
          >
            <Link className="h-5 w-5" aria-hidden="true" />
            <span>Summarize URL</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 px-4 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all"
            aria-label="View History"
            onClick={() => window.location.href = "/summaries/all"}
          >
            <History className="h-5 w-5" aria-hidden="true" />
            <span>View History</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 px-4 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all"
            aria-label="View Saved Items"
            onClick={() => window.location.href = "/summaries/saved"}
          >
            <Bookmark className="h-5 w-5" aria-hidden="true" />
            <span>Saved Items</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
