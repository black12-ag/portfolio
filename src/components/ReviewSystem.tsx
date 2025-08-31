import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, ThumbsUp, Flag, Image as ImageIcon, Filter } from 'lucide-react';
import RatingStars from '@/components/ui/RatingStars';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Review {
  id: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
  helpful?: number;
  photos?: string[];
}

interface ReviewSystemProps {
  propertyId: string;
  reviews: Review[];
  overallRating: number;
  totalReviews: number;
}

export default function ReviewSystem({ 
  propertyId, 
  reviews, 
  overallRating, 
  totalReviews 
}: ReviewSystemProps) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    photos: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating'>('newest');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const ratingDistribution = [
    { stars: 5, count: Math.floor(totalReviews * 0.4) },
    { stars: 4, count: Math.floor(totalReviews * 0.3) },
    { stars: 3, count: Math.floor(totalReviews * 0.2) },
    { stars: 2, count: Math.floor(totalReviews * 0.08) },
    { stars: 1, count: Math.floor(totalReviews * 0.02) },
  ];

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to leave a review.",
        variant: "destructive"
      });
      return;
    }

    if (newReview.comment.trim().length < 10) {
      toast({
        title: "Review too short",
        description: "Please write at least 10 characters.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Save review to localStorage (simulate)
      const existingReviews = JSON.parse(localStorage.getItem(`reviews_${propertyId}`) || '[]');
      const review = {
        id: Date.now(),
        user: `${user?.firstName} ${user?.lastName}`,
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date().toISOString(),
        avatar: user?.avatar,
        helpful: 0,
        photos: newReview.photos
      };
      
      existingReviews.push(review);
      localStorage.setItem(`reviews_${propertyId}`, JSON.stringify(existingReviews));

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });

      setNewReview({ rating: 5, comment: '', photos: [] });
      setShowReviewModal(false);
    } catch (error) {
      toast({
        title: "Failed to submit review",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpful = (reviewId: number) => {
    // Simulate marking review as helpful
    toast({
      title: "Thank you!",
      description: "Your feedback helps other travelers.",
    });
  };

  const filtered = ratingFilter ? reviews.filter(r => r.rating === ratingFilter) : reviews;
  const sortedReviews = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <RatingStars rating={overallRating} totalReviews={totalReviews} />
          </CardTitle>
          <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
            <DialogTrigger asChild>
              <Button variant="outline">Write a review</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Write a review</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Rating Selection */}
                <div>
                  <Label>Rating</Label>
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="p-1"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= newReview.rating
                              ? 'fill-warning text-warning'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <Label htmlFor="comment">Your review</Label>
                  <Textarea
                    id="comment"
                    placeholder="Share your experience with future guests..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="mt-2"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {newReview.comment.length}/500 characters
                  </p>
                </div>

                {/* Photo Upload */}
                <div>
                  <Label>Add photos (optional)</Label>
                  <div className="mt-2 space-y-2">
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          const dataUrls: string[] = [];
                          for (const file of files) {
                            const url = await new Promise<string>((resolve) => {
                              const reader = new FileReader();
                              reader.onload = () => resolve(reader.result as string);
                              reader.readAsDataURL(file);
                            });
                            dataUrls.push(url);
                          }
                          setNewReview((prev) => ({ ...prev, photos: [...prev.photos, ...dataUrls] }));
                        }}
                      />
                      <Button variant="outline" className="w-full" onClick={(ev) => (ev.currentTarget.previousElementSibling as HTMLInputElement).click()}>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Add photos
                      </Button>
                    </label>
                    {newReview.photos.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {newReview.photos.map((src, i) => (
                          <img key={i} src={src} alt={`preview ${i+1}`} className="w-16 h-16 object-cover rounded" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmitReview}
                  disabled={isSubmitting || newReview.comment.trim().length < 10}
                  className="w-full"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit review'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            {ratingDistribution.map((dist) => (
              <div key={dist.stars} className="flex items-center gap-2">
                <span className="text-sm w-6">{dist.stars}</span>
                <Star className="h-3 w-3 fill-warning text-warning" />
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-warning rounded-full h-2"
                    style={{
                      width: `${totalReviews > 0 ? (dist.count / totalReviews) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8">{dist.count}</span>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cleanliness</span>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-warning text-warning" />
                <span className="text-sm">4.8</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Accuracy</span>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-warning text-warning" />
                <span className="text-sm">4.9</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Communication</span>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-warning text-warning" />
                <span className="text-sm">4.7</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Location</span>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-warning text-warning" />
                <span className="text-sm">4.6</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Check-in</span>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-warning text-warning" />
                <span className="text-sm">4.8</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Value</span>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-warning text-warning" />
                <span className="text-sm">4.5</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Sort & Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">Sort by:</span>
          {(['newest', 'oldest', 'rating'] as const).map((option) => (
            <Button
              key={option}
              variant={sortBy === option ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortBy(option)}
            >
              {option === 'newest' && 'Newest'}
              {option === 'oldest' && 'Oldest'}
              {option === 'rating' && 'Rating'}
            </Button>
          ))}
          <span className="ml-4 text-sm font-medium flex items-center gap-1"><Filter className="w-4 h-4"/>Filter:</span>
          {[5,4,3,2,1].map(st => (
            <Button key={st} variant={ratingFilter === st ? 'default' : 'ghost'} size="sm" onClick={() => setRatingFilter(ratingFilter === st ? null : st)}>
              <div className="flex items-center gap-1">
                <Star className={st >= 1 ? 'w-3.5 h-3.5 fill-warning text-warning' : 'w-3.5 h-3.5'} />
                {st}
              </div>
            </Button>
          ))}
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {sortedReviews.map((review) => (
            <div key={review.id} className="space-y-3">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.avatar} />
                  <AvatarFallback>{review.user.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{review.user}</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= review.rating
                                  ? 'fill-warning text-warning'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(review.date), 'MMM yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                  {review.photos && review.photos.length > 0 && (
                    <div className="flex gap-2">
                      {review.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Review photo ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleHelpful(review.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      Helpful {review.helpful && `(${review.helpful})`}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Flag className="h-3 w-3 mr-1" />
                      Report
                    </Button>
                  </div>
                </div>
              </div>
              <Separator />
            </div>
          ))}
        </div>

        {reviews.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No reviews yet. Be the first to review this property!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
