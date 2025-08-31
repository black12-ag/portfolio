import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Star, 
  MessageSquare, 
  CheckCircle,
  X
} from 'lucide-react';

interface PostChatRatingProps {
  isOpen: boolean;
  onClose: () => void;
  agentName?: string;
  chatId: string;
  sessionDuration?: string;
  issueResolved?: boolean;
}

export default function PostChatRating({ 
  isOpen, 
  onClose, 
  agentName = 'Support Agent',
  chatId,
  sessionDuration,
  issueResolved = true
}: PostChatRatingProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitRating = async () => {
    try {
      // Store rating in localStorage (in real app, send to backend)
      const ratingData = {
        chatId,
        agentName,
        rating,
        feedback,
        timestamp: new Date().toISOString(),
        sessionDuration,
        issueResolved
      };
      
      const existingRatings = JSON.parse(localStorage.getItem('chat-ratings') || '[]');
      existingRatings.push(ratingData);
      localStorage.setItem('chat-ratings', JSON.stringify(existingRatings));
      
      setSubmitted(true);
      
      toast({
        title: t('Thank you for your feedback!'),
        description: t('Your rating helps us improve our service'),
        variant: 'default'
      });
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
      
    } catch (error) {
      toast({
        title: t('Error'),
        description: t('Failed to submit rating. Please try again.'),
        variant: 'destructive'
      });
    }
  };

  if (!isOpen) return null;

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('Thank You!')}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('Your feedback has been submitted successfully.')}
            </p>
            <Button onClick={onClose} className="w-full">
              {t('Close')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1" />
            <CardTitle className="text-lg">{t('Rate Your Experience')}</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="w-8 h-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('Chat with')} <span className="font-medium">{agentName}</span>
          </div>
          {sessionDuration && (
            <div className="text-xs text-gray-500">
              {t('Session duration')}: {sessionDuration}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Star Rating */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {t('How would you rate your support experience?')}
            </p>
            <div className="flex justify-center space-x-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-1 transition-colors ${
                    star <= rating 
                      ? 'text-yellow-400 hover:text-yellow-500' 
                      : 'text-gray-300 hover:text-gray-400'
                  }`}
                >
                  <Star 
                    className={`w-6 h-6 ${star <= rating ? 'fill-current' : ''}`} 
                  />
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-500">
              {rating === 0 && t('Click to rate')}
              {rating === 1 && t('Very Poor')}
              {rating === 2 && t('Poor')}
              {rating === 3 && t('Average')}
              {rating === 4 && t('Good')}
              {rating === 5 && t('Excellent')}
            </div>
          </div>

          {/* Quick Feedback Badges */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('Was your issue resolved?')}
            </p>
            <div className="flex gap-2 mb-3">
              <Button
                size="sm"
                variant={issueResolved ? "default" : "outline"}
                onClick={() => {/* Could toggle issue resolution */}}
                className="flex-1"
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                {t('Yes, resolved')}
              </Button>
              <Button
                size="sm"
                variant={!issueResolved ? "destructive" : "outline"}
                onClick={() => {/* Could toggle issue resolution */}}
                className="flex-1"
              >
                <ThumbsDown className="w-4 h-4 mr-1" />
                {t('No, still need help')}
              </Button>
            </div>
          </div>

          {/* Feedback Text */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('Additional feedback')} ({t('optional')})
            </p>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={t('Tell us about your experience...')}
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {feedback.length}/500
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              {t('Skip')}
            </Button>
            <Button
              onClick={handleSubmitRating}
              disabled={rating === 0}
              className="flex-1"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {t('Submit Rating')}
            </Button>
          </div>
          
          <div className="text-xs text-center text-gray-500">
            {t('Your feedback helps us improve our service')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
