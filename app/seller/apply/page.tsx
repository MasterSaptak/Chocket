'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  User, Mail, Phone, MapPin, Globe, FileText, Upload, Loader2,
  ArrowRight, CheckCircle, Clock, XCircle, ChevronLeft, Store
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthProvider';
import { RouteGuard } from '@/components/RouteGuard';
import { submitSellerApplication, getUserApplication } from '@/lib/sellerApplications';
import type { SellerApplication, SellingPlatform } from '@/types';

const PLATFORMS: SellingPlatform[] = ['Instagram', 'Facebook', 'Offline', 'Website', 'Other'];

function SellerApplyContent() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingExisting, setIsCheckingExisting] = useState(true);
  const [existingApp, setExistingApp] = useState<SellerApplication | null>(null);

  // Form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [sellingPlatform, setSellingPlatform] = useState<SellingPlatform>('Instagram');
  const [experience, setExperience] = useState('');
  const [identityProof, setIdentityProof] = useState('');

  useEffect(() => {
    if (userData) {
      setFullName(userData.name || '');
      setEmail(userData.email || '');
      setPhone(userData.phone || '');
    }
  }, [userData]);

  useEffect(() => {
    async function checkExisting() {
      if (!user) return;
      try {
        const app = await getUserApplication(user.uid);
        setExistingApp(app);
      } catch (e) {
        console.error('Error checking existing application:', e);
      } finally {
        setIsCheckingExisting(false);
      }
    }
    checkExisting();
  }, [user]);

  // If user is already a seller or higher
  if (userData && userData.role !== 'buyer') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0705] p-4">
        <div className="max-w-md w-full bg-[#1A0F0B] border border-emerald-500/30 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-display font-bold text-emerald-400">
            Already a {userData.role === 'seller' ? 'Seller' : userData.role === 'manager' ? 'Manager' : 'Prime Admin'}
          </h2>
          <p className="text-[#FFF3E0]/60 text-sm">
            You already have elevated access on this platform.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-3 bg-[#D4AF37] text-[#1A0F0B] rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!fullName || !email || !phone || !location || !experience) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await submitSellerApplication({
        userId: user.uid,
        fullName,
        email,
        phone,
        location,
        sellingPlatform,
        experience,
        identityProof: identityProof || '',
      });
      toast.success('Application submitted successfully! 🎉');
      // Reload to show status
      const app = await getUserApplication(user.uid);
      setExistingApp(app);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingExisting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0705]">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  // Show existing application status
  if (existingApp) {
    const statusConfig = {
      pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'Under Review' },
      approved: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Approved!' },
      rejected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Rejected' },
    };
    const cfg = statusConfig[existingApp.status];
    const StatusIcon = cfg.icon;

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0705] p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`max-w-md w-full bg-[#1A0F0B] border ${cfg.border} rounded-2xl p-8 text-center space-y-4`}
        >
          <div className={`w-20 h-20 ${cfg.bg} rounded-full flex items-center justify-center mx-auto`}>
            <StatusIcon className={`w-10 h-10 ${cfg.color}`} />
          </div>
          <h2 className={`text-2xl font-display font-bold ${cfg.color}`}>{cfg.label}</h2>
          <p className="text-[#FFF3E0]/60 text-sm leading-relaxed">
            {existingApp.status === 'pending'
              ? 'Your seller application is being reviewed by our team. We\'ll notify you once a decision is made.'
              : existingApp.status === 'approved'
              ? 'Congratulations! Your seller application has been approved. You now have access to the seller dashboard.'
              : `Your application was rejected. ${existingApp.rejectionReason ? `Reason: ${existingApp.rejectionReason}` : 'Please contact support for more details.'}`}
          </p>
          <div className="pt-4 space-y-3">
            {existingApp.status === 'approved' && (
              <button
                onClick={() => router.push('/seller/dashboard')}
                className="w-full px-6 py-3 bg-[#D4AF37] text-[#1A0F0B] rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Store className="w-4 h-4" />
                Go to Seller Dashboard
              </button>
            )}
            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-3 bg-[#2C1A12] text-[#FFF3E0] rounded-xl font-semibold hover:bg-[#3E2723] transition-colors"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0705] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-[#FFF3E0]/40 hover:text-[#D4AF37] transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1A0F0B]/80 backdrop-blur-xl border border-[#3E2723] rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-[#3E2723] bg-gradient-to-r from-[#D4AF37]/5 to-transparent">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center">
                <Store className="w-7 h-7 text-[#D4AF37]" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-[#FFF3E0]">
                  Apply as Seller
                </h1>
                <p className="text-[#FFF3E0]/50 text-sm mt-1">
                  Join our premium chocolate reseller network
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#FFF3E0]/60 uppercase tracking-wider">Full Name *</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFF3E0]/30" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full legal name"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-[#0D0705]/60 border border-[#3E2723] rounded-xl text-[#FFF3E0] placeholder:text-[#FFF3E0]/25 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all"
                />
              </div>
            </div>

            {/* Email & Phone Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#FFF3E0]/60 uppercase tracking-wider">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFF3E0]/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-[#0D0705]/60 border border-[#3E2723] rounded-xl text-[#FFF3E0] placeholder:text-[#FFF3E0]/25 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#FFF3E0]/60 uppercase tracking-wider">Phone *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFF3E0]/30" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-[#0D0705]/60 border border-[#3E2723] rounded-xl text-[#FFF3E0] placeholder:text-[#FFF3E0]/25 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#FFF3E0]/60 uppercase tracking-wider">Location *</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFF3E0]/30" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State, Country"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-[#0D0705]/60 border border-[#3E2723] rounded-xl text-[#FFF3E0] placeholder:text-[#FFF3E0]/25 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all"
                />
              </div>
            </div>

            {/* Selling Platform */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#FFF3E0]/60 uppercase tracking-wider">Selling Platform *</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSellingPlatform(p)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                      sellingPlatform === p
                        ? 'bg-[#D4AF37]/10 border-[#D4AF37]/50 text-[#D4AF37]'
                        : 'bg-[#0D0705]/40 border-[#3E2723] text-[#FFF3E0]/50 hover:border-[#D4AF37]/30'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience / Description */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#FFF3E0]/60 uppercase tracking-wider">Experience / Description *</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-4 h-4 text-[#FFF3E0]/30" />
                <textarea
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Tell us about your selling experience, business background, and why you want to sell on Chocket..."
                  required
                  rows={4}
                  className="w-full pl-11 pr-4 py-3.5 bg-[#0D0705]/60 border border-[#3E2723] rounded-xl text-[#FFF3E0] placeholder:text-[#FFF3E0]/25 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all resize-none"
                />
              </div>
            </div>

            {/* Identity Proof URL */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#FFF3E0]/60 uppercase tracking-wider">Identity Proof (URL)</label>
              <div className="relative">
                <Upload className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFF3E0]/30" />
                <input
                  type="url"
                  value={identityProof}
                  onChange={(e) => setIdentityProof(e.target.value)}
                  placeholder="Link to your identity document (Google Drive, etc.)"
                  className="w-full pl-11 pr-4 py-3.5 bg-[#0D0705]/60 border border-[#3E2723] rounded-xl text-[#FFF3E0] placeholder:text-[#FFF3E0]/25 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all"
                />
              </div>
              <p className="text-[10px] text-[#FFF3E0]/30">Upload your ID to Google Drive or similar service and paste the link</p>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A0F0B] font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Submit Application
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default function SellerApplyPage() {
  return (
    <RouteGuard allowedRoles={['buyer', 'seller', 'manager', 'primeadmin']}>
      <SellerApplyContent />
    </RouteGuard>
  );
}
