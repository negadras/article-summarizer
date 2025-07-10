import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorSectionProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorSection({ message, onRetry }: ErrorSectionProps) {
  return (
    <Card className="mb-8 border-red-200 bg-red-50">
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-medium text-red-800 mb-2">Processing Error</h3>
            <p className="text-red-700 mb-4">{message}</p>
            <Button
              onClick={onRetry}
              variant="destructive"
              size="sm"
            >
              Try Again
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
