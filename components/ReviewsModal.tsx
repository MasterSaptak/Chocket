'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Trash2, Check, XCircle, Loader2, MessageSquare, User, Calendar } from 'lucide-react';
import { Review, updateReviewStatus, deleteReview, getProductReviews } from '@/lib/reviews';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Product } from '@/components/ProductCard';

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export function ReviewsModal({ isOpen, onClose, product }: ReviewsModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!product) return;
    setIsLoading(true);
    try {
      const fetchedReviews = await getProductReviews(product.id);
      setReviews(fetchedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  }, [product]);

  useEffect(() => {
    if (isOpen && product) {
      fetchReviews();
    }
  }, [isOpen, product, fetchReviews]);

  const handleStatusUpdate = async (reviewId: string, status: Review['status']) => {
    setIsActionLoading(reviewId);
    try {
      await updateReviewStatus(reviewId, status);
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status } : r));
      toast.success(`Review ${status} successfully`);
    } catch (error) {
      console.error('Error updating review status:', error);
      toast.error('Failed to update review status');
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    setIsActionLoading(reviewId);
    try {
      await deleteReview(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      toast.success('Review deleted successfully');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    } finally {
      setIsActionLoading(null);
    }
  };

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-[#1A0F0B] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#2C1A12]/50">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                  <MessageSquare className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-[#FFF3E0]">Reviews for {product.name}</h2>
                  <p className="text-sm text-[#FFF3E0]/60">Manage customer feedback and ratings</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/5 text-[#FFF3E0]/60 hover:text-[#FFF3E0] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
                  <p className="text-[#FFF3E0]/60">Loading reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-2">
                    <MessageSquare className="w-10 h-10 text-[#FFF3E0]/20" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-[#FFF3E0]">No reviews yet</h3>
                  <p className="text-[#FFF3E0]/60 max-w-xs">There are no reviews for this product at the moment.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div 
                      key={review.id} 
                      className={`p-6 rounded-2xl border transition-all duration-300 ${
                        review.status === 'pending' 
                          ? 'bg-yellow-500/5 border-yellow-500/20' 
                          : review.status === 'rejected'
                            ? 'bg-red-500/5 border-red-500/20'
                            : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold">
                                {review.userName.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-bold text-[#FFF3E0] flex items-center gap-2">
                                  {review.userName}
                                  {review.status === 'pending' && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 uppercase tracking-wider">
                                      Pending
                                    </span>
                                  )}
                                </h4>
                                <div className="flex items-center gap-4 text-xs text-[#FFF3E0]/40">
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" /> {review.userId.slice(0, 8)}...
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-[#D4AF37]">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'opacity-20'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          
                          <p className="text-[#FFF3E0]/80 leading-relaxed italic">
                            &quot;{review.comment}&quot;
                          </p>
                        </div>

                        <div className="flex md:flex-col items-center gap-2 shrink-0">
                          {review.status !== 'approved' && (
                            <button
                              disabled={isActionLoading === review.id}
                              onClick={() => handleStatusUpdate(review.id, 'approved')}
                              className="flex-1 md:w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-all text-sm font-bold"
                            >
                              {isActionLoading === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              Approve
                            </button>
                          )}
                          {review.status !== 'rejected' && (
                            <button
                              disabled={isActionLoading === review.id}
                              onClick={() => handleStatusUpdate(review.id, 'rejected')}
                              className="flex-1 md:w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all text-sm font-bold"
                            >
                              {isActionLoading === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                              Reject
                            </button>
                          )}
                          <button
                            disabled={isActionLoading === review.id}
                            onClick={() => handleDelete(review.id)}
                            className="p-2 text-[#FFF3E0]/40 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                            title="Delete Review"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 bg-[#2C1A12]/50 flex items-center justify-between">
              <p className="text-xs text-[#FFF3E0]/40">
                Total Reviews: <span className="font-bold text-[#FFF3E0]">{reviews.length}</span>
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 text-[#FFF3E0] font-semibold rounded-xl transition-colors border border-white/10"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
