import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, Loader2, Wand2, Sparkles, Trash2, ListChecks, Download } from 'lucide-react';
import { SentimentChart } from '@/components/SentimentChart';
import { ReviewList } from '@/components/ReviewList';
import type { TextClassificationPipeline } from '@huggingface/transformers';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from '@/components/ThemeToggle';
import { useToast } from "@/hooks/use-toast";

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
  "Love the sleek design and lightweight feel.",
  "It’s comfortable to wear all day and looks great with any outfit.",
  "Battery life is amazing and lasts almost a week.",
  "I don't have to worry about charging it every night.",
  "Step counter doesn’t seem accurate.",
  "It adds extra steps even when I’m sitting.",
  "Easy to pair with my phone.",
  "Notifications for messages and calls show up instantly.",
  "Heart rate monitor gives random spikes.",
  "Not very reliable during workouts.",
  "Great value for money.",
  "Functions like an expensive smartwatch but costs much less.",
  "Display is bright and sharp.",
  "Works well even under direct sunlight.",
  "UI is smooth but lags occasionally.",
  "Especially noticeable when switching between features.",
  "Strap feels a bit low in quality.",
  "Might need to replace it after a few months.",
  "Sleep tracking is surprisingly accurate.",
  "It even shows light and deep sleep phases.",
  "Needs more watch face options.",
  "The current selection feels limited and repetitive.",
  "Doesn’t support third-party apps.",
  "I wish I could reply to messages directly.",
  "Build quality is impressive.",
  "Doesn’t feel like a budget watch at all.",
  "Timer and stopwatch features are useful.",
  "Great for gym sessions and cooking.",
  "Gets scratched easily.",
  "Would recommend using a screen guard.",
  "Excellent for daily health tracking.",
  "Tracks steps, heart rate, and calories well.",
  "Weather updates are often delayed.",
  "Not reliable for real-time information.",
  "Touchscreen is very responsive.",
  "No delay when navigating through menus.",
  "Alarm vibration is too weak.",
  "I often miss my morning wake-up alert.",
  "Syncs perfectly with the mobile app.",
  "All data is backed up and easy to view.",
  "Call notifications are inconsistent.",
  "Sometimes it doesn’t alert me at all.",
  "Music control is very convenient.",
  "I can skip tracks without picking up my phone.",
  "Looks premium and stylish.",
  "Many friends thought it was an Apple Watch!",
  "Sports mode options are limited.",
  "Would be great to have swimming or yoga modes.",
  "Gifted by a friend and I love it.",
  "I now use it every single day.",
  "Charger cable is short and flimsy.",
  "Needs to be handled with care.",
  "Perfect for first-time smartwatch users.",
  "It covers all the basic features I need.",
  "Raise-to-wake doesn’t work every time.",
  "Sometimes I have to tap the screen manually.",
  "Motivates me to meet fitness goals.",
  "The app gives daily health insights and reminders.",
  "Can’t reply to messages.",
  "Only displays notifications, not interactive.",
  "Vibration alerts are gentle.",
  "They’re not disruptive during meetings.",
  "No in-built speaker or mic.",
  "So you can't take calls through the watch.",
  "Works well for running and walking.",
  "Activity tracking is mostly accurate.",
  "Disconnected once but reconnected on its own.",
  "Not a major issue for me.",
  "Interface is clean and simple.",
  "Easy for anyone to learn and use.",
  "Feels premium despite low price.",
  "You’re getting a lot for what you pay.",
  "No always-on display option.",
  "A bit annoying when checking time quickly.",
  "Charcoal grey color looks amazing.",
  "Matches both formal and casual wear.",
  "Syncing takes a while sometimes.",
  "Especially when updating firmware.",
  "Sleep monitor gives helpful insights.",
  "I’ve been able to improve my bedtime routine.",
  "Customer support was helpful.",
  "They resolved my app login issue quickly.",
  "Strap became loose after a month.",
  "Had to tighten it more often.",
  "Water resistant as claimed.",
  "No issues while washing hands or light rain.",
  "Charges quickly in under 2 hours.",
  "Battery backup is strong for daily use.",
  "UI could allow more customization.",
  "Would like to hide unused features.",
  "No built-in GPS.",
  "Needs phone nearby for accurate tracking.",
  "Tracks stress levels fairly well.",
  "A nice feature to check throughout the day.",
  "Screen turns off too fast.",
  "Needs adjustable display timeout setting.",
  "Received compliments from colleagues.",
  "Everyone was surprised by how good it looks.",
  "Using it for two months now.",
  "No major issues – works smoothly and reliably.",
];

export default function Index() {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<{ label: 'POSITIVE' | 'NEGATIVE', score: number, text: string }[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const classifier = useRef<TextClassificationPipeline | null>(null);
  const { toast } = useToast();

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
    const count = Math.floor(Math.random() * 10) + 51; // 51 to 60 reviews
    const selectedReviews = shuffled.slice(0, count);
    setInputText(selectedReviews.join('\n'));
    toast({
      title: "Examples Loaded",
      description: `Loaded ${count} example reviews.`,
    });
  };

  const handleClear = () => {
    setInputText('');
    setResults([]);
    toast({
      title: "Cleared",
      description: "Input text and analysis results have been cleared.",
    });
  };

  const handleExport = () => {
    if (results.length === 0) return;

    const headers = ["text", "label", "score"];
    const csvContent = [
      headers.join(","),
      ...results.map(r => {
        const text = `"${r.text.replace(/"/g, '""')}"`;
        return [text, r.label, r.score].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "review_analysis_export.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    toast({
      title: "Export Successful",
      description: "Your review analysis has been exported as a CSV file.",
    });
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle>Analysis Summary</CardTitle>
                  <Button variant="outline" onClick={handleExport} size="sm">
                    <Download />
                    Export as CSV
                  </Button>
                </div>
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
