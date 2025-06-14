import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, Loader2, Wand2, Sparkles, Trash2, ListChecks } from 'lucide-react';
import { SentimentChart } from '@/components/SentimentChart';
import { ReviewList } from '@/components/ReviewList';
import type { TextClassificationPipeline } from '@huggingface/transformers';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from '@/components/ThemeToggle';

const allExampleReviews = [
  "I absolutely love this product! The quality is outstanding and it exceeded my expectations.",
  "The customer service was fantastic, they were so helpful and responsive.",
  "This is a complete waste of money. It broke after just one week.",
  "I'm very disappointed with my purchase. It doesn't work as advertised.",
  "An average product. It does the job but nothing special about it.",
  "Shipping was incredibly fast, it arrived two days earlier than expected!",
  "The product arrived damaged. Very poor packaging.",
  "Works like a charm! I would definitely recommend this to anyone.",
  "It's okay, but not worth the price. You can find better alternatives.",
  "The manual is very confusing. I had a hard time setting it up.",
  "Five stars! Best purchase I've made all year.",
  "The battery life is terrible. It dies after only a couple of hours.",
  "What a great deal! The quality for this price is unbelievable.",
  "I had an issue with my order and the support team resolved it within minutes. Excellent service!",
  "The color is not the same as shown in the picture. I'm returning it.",
  "It's a bit smaller than I expected, but it works well.",
];

export default function Index() {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<{ label: 'POSITIVE' | 'NEGATIVE', score: number, text: string }[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const classifier = useRef<TextClassificationPipeline | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const { pipeline } = await import('@huggingface/transformers');
        // To bypass a TypeScript error with overly complex union types from the pipeline function,
        // we assign the result to a variable of type 'any' before assigning it to the ref.
        const myPipeline: any = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
        classifier.current = myPipeline;
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

    // We cast the result to our specific type, as we know this model returns 'POSITIVE' or 'NEGATIVE'.
    setResults(combinedResults as { label: 'POSITIVE' | 'NEGATIVE', score: number, text: string }[]);
    setIsAnalyzing(false);
  };
  
  const handleLoadExamples = () => {
    const shuffled = [...allExampleReviews].sort(() => 0.5 - Math.random());
    const count = Math.floor(Math.random() * 2) + 4; // 4 or 5 reviews
    const selectedReviews = shuffled.slice(0, count);
    setInputText(selectedReviews.join('\n'));
  };

  const handleClear = () => {
    setInputText('');
    setResults([]);
  };

  const positiveReviews = results.filter(r => r.label === 'POSITIVE');
  const negativeReviews = results.filter(r => r.label === 'NEGATIVE');

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="relative text-center mb-8">
        <div className="absolute top-0 right-0">
          <ThemeToggle />
        </div>
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
            <div className="flex justify-between items-center">
              <CardDescription>Place each review on a new line for best results.</CardDescription>
              <Button variant="link" onClick={handleLoadExamples} className="p-0 h-auto text-primary">
                <Sparkles className="mr-2 h-4 w-4" />
                Load examples
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="e.g.&#10;I love this product! It's amazing.&#10;This was a waste of money."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={8}
              className="resize-y"
            />
            <div className="flex flex-row gap-2">
              <Button onClick={handleAnalyze} disabled={!modelReady || isAnalyzing || !inputText.trim()} className="flex-grow">
                {isAnalyzing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : !modelReady ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isAnalyzing ? 'Analyzing...' : !modelReady ? 'Model Loading...' : 'Analyze Reviews'}
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    onClick={handleClear} 
                    disabled={isAnalyzing || (!inputText.trim() && results.length === 0)}
                    className="sm:w-auto"
                    aria-label="Clear input and results"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear input and results</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <div className="mt-8 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                      <ListChecks className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{results.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Positive Reviews</CardTitle>
                      <ThumbsUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-500">{positiveReviews.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Negative Reviews</CardTitle>
                      <ThumbsDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-500">{negativeReviews.length}</div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

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
