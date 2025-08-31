import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Star, MessageSquare, TrendingUp, Calendar, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Review {
  averageScore: number;
  country: string;
  type: string;
  name: string;
  date: string;
  headline: string;
  language: string;
  pros: string;
  cons: string;
}

interface SentimentCategory {
  name: string;
  rating: number;
  description: string;
}

interface SentimentAnalysis {
  categories: SentimentCategory[];
  summary: string;
  overallSentiment: number;
}

interface ReviewsData {
  data: Review[];
  sentimentAnalysis?: SentimentAnalysis;
}

interface LiteApiHotelReviewsProps {
  className?: string;
  defaultHotelId?: string;
}

export const LiteApiHotelReviews: React.FC<LiteApiHotelReviewsProps> = ({
  className = '',
  defaultHotelId = ''
}) => {
  const [hotelId, setHotelId] = useState(defaultHotelId || 'lp1f001');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null);
  const [getSentiment, setGetSentiment] = useState(false);
  const { toast } = useToast();

  const fetchReviews = async () => {
    if (!hotelId.trim()) {
      setError('Hotel ID is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        hotelId: hotelId.trim(),
        timeout: '10',
        ...(getSentiment && { getSentiment: 'true' })
      });

      const response = await fetch(`/api/liteapi/reviews?${params}`);
      const result = await response.json();

      if (result.success && result.data) {
        setReviewsData(result.data);
        toast({
          title: 'Reviews Loaded',
          description: `Found ${result.data.data?.length || 0} reviews`
        });
      } else {
        setError(result.error || 'Failed to fetch reviews');
        setReviewsData(null);
      }
    } catch (err) {
      setError(`Request failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setReviewsData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchReviews();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Poor';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Hotel Reviews & Sentiment Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Interface */}
        <div className="space-y-2">
          <Label htmlFor="hotel-id">Hotel ID</Label>
          <div className="flex gap-2">
            <Input
              id="hotel-id"
              value={hotelId}
              onChange={(e) => setHotelId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter hotel ID (e.g., lp3803c)"
              disabled={isLoading}
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sentiment"
                checked={getSentiment}
                onChange={(e) => setGetSentiment(e.target.checked)}
                disabled={isLoading}
              />
              <Label htmlFor="sentiment" className="text-sm">
                Include sentiment analysis
              </Label>
            </div>
            <Button onClick={fetchReviews} disabled={isLoading || !hotelId.trim()}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
              Load Reviews
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Reviews Data */}
        {reviewsData && (
          <Tabs defaultValue="reviews" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="reviews">
                Reviews ({reviewsData.data?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="sentiment" disabled={!reviewsData.sentimentAnalysis}>
                Sentiment Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reviews" className="space-y-4">
              {reviewsData.data && reviewsData.data.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {reviewsData.data.map((review, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-white ${getScoreColor(review.averageScore)}`}>
                            <Star className="w-3 h-3 mr-1" />
                            {review.averageScore}/10
                          </Badge>
                          <Badge variant="outline">{getScoreLabel(review.averageScore)}</Badge>
                          <Badge variant="secondary">{review.type}</Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDate(review.date)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{review.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {review.country}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {review.language}
                          </Badge>
                        </div>

                        <div className="font-medium text-sm">{review.headline}</div>

                        {review.pros && (
                          <div className="text-sm">
                            <span className="font-medium text-green-600">Pros: </span>
                            {review.pros}
                          </div>
                        )}

                        {review.cons && (
                          <div className="text-sm">
                            <span className="font-medium text-red-600">Cons: </span>
                            {review.cons}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No reviews found for this hotel
                </div>
              )}
            </TabsContent>

            <TabsContent value="sentiment" className="space-y-4">
              {reviewsData.sentimentAnalysis ? (
                <div className="space-y-4">
                  {/* Overall Sentiment */}
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5" />
                      <span className="font-medium">Overall Sentiment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-white ${getScoreColor(reviewsData.sentimentAnalysis.overallSentiment)}`}>
                        {reviewsData.sentimentAnalysis.overallSentiment}/10
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {reviewsData.sentimentAnalysis.summary}
                      </span>
                    </div>
                  </Card>

                  {/* Category Breakdown */}
                  <div className="space-y-3">
                    <Label>Category Breakdown</Label>
                    {reviewsData.sentimentAnalysis.categories.map((category, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{category.name}</span>
                          <Badge className={`text-white ${getScoreColor(category.rating)}`}>
                            {category.rating}/10
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Enable sentiment analysis when loading reviews to see this data
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Usage Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>• Enter a hotel ID (you can get this from hotel search results)</div>
          <div>• Check "Include sentiment analysis" for AI-powered review insights</div>
          <div>• Reviews show guest ratings, comments, pros and cons</div>
          <div>• Sentiment analysis breaks down reviews by categories like cleanliness, service, etc.</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiteApiHotelReviews;
