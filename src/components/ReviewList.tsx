
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export function ReviewList({ title, reviews, icon, variant }: ReviewListProps) {
  const classes = variantClasses[variant];

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
            <li key={index} className="p-3 bg-secondary rounded-lg">
              <p className="text-sm text-secondary-foreground mb-2">{review.text}</p>
              <Badge variant="outline" className={classes.badgeClass}>
                Score: {review.score.toFixed(2)}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
