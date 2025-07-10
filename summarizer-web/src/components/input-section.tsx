import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Keyboard, Link as LinkIcon, Sparkles, Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { submitTextSchema, submitUrlSchema, type SummarizationResponse } from "@/types/api";
import { cn } from "@/lib/utils";

interface InputSectionProps {
  onLoading: (loading: boolean) => void;
  onResult: (result: SummarizationResponse) => void;
  onError: (error: string) => void;
}

export default function InputSection({ onLoading, onResult, onError }: InputSectionProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'url'>('text');

  const textForm = useForm({
    resolver: zodResolver(submitTextSchema),
    defaultValues: {
      content: "",
      title: ""
    }
  });

  const urlForm = useForm({
    resolver: zodResolver(submitUrlSchema),
    defaultValues: {
      url: ""
    }
  });

  const textMutation = useMutation({
    mutationFn: async (data: { content: string; title?: string }) => {
      const response = await apiRequest("POST", "/api/summarize/text", data);
      return response.json() as Promise<SummarizationResponse>;
    },
    onMutate: () => {
      onLoading(true);
      onError("");
    },
    onSuccess: (data) => {
      onLoading(false);
      onResult(data);
    },
    onError: (error: Error) => {
      onLoading(false);
      onError(error.message);
    }
  });

  const urlMutation = useMutation({
    mutationFn: async (data: { url: string }) => {
      const response = await apiRequest("POST", "/api/summarize/url", data);
      return response.json() as Promise<SummarizationResponse>;
    },
    onMutate: () => {
      onLoading(true);
      onError("");
    },
    onSuccess: (data) => {
      onLoading(false);
      onResult(data);
    },
    onError: (error: Error) => {
      onLoading(false);
      onError(error.message);
    }
  });

  const handleTextSubmit = textForm.handleSubmit((data) => {
    textMutation.mutate(data);
  });

  const handleUrlSubmit = urlForm.handleSubmit((data) => {
    urlMutation.mutate(data);
  });

  const articleText = textForm.watch("content");
  const wordCount = articleText ? articleText.trim().split(/\s+/).length : 0;

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('text')}
            className={cn(
              "px-4 py-2 font-medium focus:outline-none flex items-center space-x-2",
              activeTab === 'text'
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Keyboard className="w-4 h-4" />
            <span>Paste Text</span>
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={cn(
              "px-4 py-2 font-medium focus:outline-none flex items-center space-x-2 ml-6",
              activeTab === 'url'
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <LinkIcon className="w-4 h-4" />
            <span>From URL</span>
          </button>
        </div>

        {activeTab === 'text' && (
          <Form {...textForm}>
            <form onSubmit={handleTextSubmit} className="space-y-4">
              <FormField
                control={textForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Article Title (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter article title..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={textForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Article Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your article content here... (minimum 100 words)"
                        className="h-64 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {wordCount} words
                </span>
                <Button
                  type="submit"
                  disabled={textMutation.isPending}
                  className="flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Summary</span>
                </Button>
              </div>
            </form>
          </Form>
        )}

        {activeTab === 'url' && (
          <Form {...urlForm}>
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <FormField
                control={urlForm.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Article URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/article"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={urlMutation.isPending}
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Extract & Summarize</span>
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
