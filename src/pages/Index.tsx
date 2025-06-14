
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, Loader2, Wand2 } from 'lucide-react';
import { SentimentChart } from '@/components/SentimentChart';
import { ReviewList } from '@/components/ReviewList';

// Type definition for the sentiment analysis pipeline
type SentimentPipeline = (text: string | string[], options?: any) => Promise<{ label: 'POSITIVE' | 'NEGATIVE', score: number }[]>;

export default function Index() {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<{ label: 'POSITIVE' | 'NEGATIVE', score: number, text: string }[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const classifier = useRef<SentimentPipeline | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const { pipeline } = await import('@huggingface/transformers');
        // Load a quantized version of the model for faster inference and smaller size
        classifier.current = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', {
          quantized: true,
        });
        setModelReady(true);
      } catch (error) {
        console.error("Failed to load model:", error);
      }
    };
    loadModel();
  }, []);

  const handleAnalyze = async () => {
    if (!inputText.trim() || !classifier.current) return;
    setIsAnalyzing(true);
    setResults([]);

    const reviews = inputText.split('\n').filter(line => line.trim().length > 0);
    if (reviews.length === 0) {
      setIsAnalyzing(false);
      return;
    }

    const analysisResults = await classifier.current(reviews);

    const combinedResults = reviews.map((reviewText, index) => ({
      ...analysisResults[index],
      text: reviewText,
    }));

    setResults(combinedResults);
    setIsAnalyzing(false);
  };
  
  const positiveReviews = results.filter(r => r.label === 'POSITIVE');
  const negativeReviews = results.filter(r => r.label === 'NEGATIVE');

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl flex items-center justify-center gap-2">
          <Wand2 className="w-10 h-10 text-primary" />
          Review Insight Seeker
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Paste product reviews below to instantly analyze sentiment and summarize feedback.
        </p>
      </header>

      <main className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Enter Product Reviews</CardTitle>
            <CardDescription>Place each review on a new line for best results.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="e.g.&#10;I love this product! It's amazing.&#10;This was a waste of money."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={8}
              className="resize-y"
            />
            <Button onClick={handleAnalyze} disabled={!modelReady || isAnalyzing || !inputText.trim()} className="w-full">
              {isAnalyzing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : !modelReady ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isAnalyzing ? 'Analyzing...' : !modelReady ? 'Model Loading...' : 'Analyze Reviews'}
            </Button>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <div className="mt-8 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <SentimentChart data={results} />
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
              <ReviewList 
                title="Positive Reviews"
                reviews={positiveReviews}
                icon={<ThumbsUp className="text-green-500" />}
                variant="positive"
              />
              <ReviewList 
                title="Negative Reviews"
                reviews={negativeReviews}
                icon={<ThumbsDown className="text-red-500" />}
                variant="negative"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
