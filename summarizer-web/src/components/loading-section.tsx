import { Card, CardContent } from "@/components/ui/card";

export default function LoadingSection() {
  return (
    <Card className="mb-8">
      <CardContent className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <h3 className="text-lg font-medium text-gray-900">Processing Article</h3>
          <p className="text-gray-600">Article content is being analyzed and generating a summary...</p>
          <div className="w-full bg-gray-200 rounded-full h-2 max-w-md">
            <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '65%' }}></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
