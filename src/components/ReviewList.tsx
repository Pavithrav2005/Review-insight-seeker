
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Review {
  text: string;
  score: number;
}

interface ReviewListProps {
  title: string;
  reviews: Review[];
  icon: React.ReactNode;
  variant: 'positive' | 'negative';
}

const variantClasses = {
  positive: {
    borderColor: 'border-green-500',
    badgeVariant: 'default' as 'default',
    badgeClass: 'bg-green-100 text-green-800',
  },
  negative: {
    borderColor: 'border-red-500',
    badgeVariant: 'destructive' as 'destructive',
    badgeClass: 'bg-red-100 text-red-800',
  },
};

const positiveKeywords = ['love', 'outstanding', 'exceeded', 'fantastic', 'helpful', 'responsive', 'charm', 'recommend', 'five stars', 'best', 'great', 'unbelievable', 'excellent', 'sleek', 'lightweight', 'amazing', 'perfect', 'accurate', 'instantly', 'bright', 'sharp', 'smooth', 'impressive', 'useful', 'premium', 'stylish', 'convenient', 'gentle', 'clean', 'simple', 'motivates', 'compliments', 'good', 'happy', 'satisfied', 'like a charm', 'great deal'];
const negativeKeywords = ['waste', 'broke', 'disappointed', 'doesn\'t work', 'average', 'damaged', 'poor', 'not worth', 'confusing', 'hard time', 'terrible', 'dies', 'not the same', 'returning', 'smaller', 'inaccurate', 'extra steps', 'random spikes', 'not reliable', 'lags', 'low in quality', 'limited', 'repetitive', 'doesn’t support', 'can’t reply', 'scratched', 'delayed', 'weak', 'inconsistent', 'short', 'flimsy', 'doesn’t work', 'loose', 'too fast', 'bad', 'unhappy', 'issue', 'confusing'];

const highlightKeywords = (text: string, variant: 'positive' | 'negative') => {
  const keywords = variant === 'positive' ? positiveKeywords : negativeKeywords;
  // Using a regex with word boundaries to match whole words only, case-insensitively.
  const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
  const parts = text.split(regex);
  const highlightClass = variant === 'positive' ? 'bg-green-200 dark:bg-green-900/70 rounded-[0.2rem] px-1' : 'bg-red-200 dark:bg-red-900/70 rounded-[0.2rem] px-1';

  return parts.map((part, index) => {
    // The matched keywords will be at odd indices in the `parts` array due to `split` behavior with a capturing group.
    if (index % 2 === 1) {
      return <strong key={index} className={`${highlightClass} font-medium`}>{part}</strong>;
    }
    return part;
  });
};

export function ReviewList({ title, reviews, icon, variant }: ReviewListProps) {
  const classes = variantClasses[variant];
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Review Copied",
      description: "The review text has been copied to your clipboard.",
    });
  };

  return (
    <Card className={classes.borderColor}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title} ({reviews.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {reviews.map((review, index) => (
            <li key={index} className="p-3 bg-secondary rounded-lg flex justify-between items-start gap-2">
              <div className="flex-grow">
                <p className="text-sm text-secondary-foreground mb-2 leading-relaxed">{highlightKeywords(review.text, variant)}</p>
                <Badge variant="outline" className={classes.badgeClass}>
                  Score: {review.score.toFixed(2)}
                </Badge>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={() => handleCopy(review.text)}
                    aria-label="Copy review text"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy review</p>
                </TooltipContent>
              </Tooltip>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
