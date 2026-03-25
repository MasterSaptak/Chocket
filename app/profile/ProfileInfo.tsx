'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, Calendar, Loader2, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { updateUserProfile } from '@/lib/users';
import { updateProfile } from 'firebase/auth';
import { toast } from 'sonner';

export default function ProfileInfo() {
  const { user, userData } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dob: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        phone: userData.phone || '',
        dob: userData.dob || ''
      });
    }
  }, [userData]);

  const validate = (name: string, value: string) => {
    let error = '';
    if (name === 'name' && value.length < 3) error = 'Name must be at least 3 characters';
    if (name === 'phone' && value && !/^\+?[0-9\s-]{10,14}$/.test(value)) error = 'Invalid phone number format';
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validate(name, value);
    setIsSuccess(false);
  };

  const handleSave = async () => {
    if (!user) return;
    
    // Final validation
    const isNameValid = validate('name', formData.name);
    const isPhoneValid = validate('phone', formData.phone);
    if (!isNameValid || !isPhoneValid) {
      toast.error('Please fix validation errors');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(user, { displayName: formData.name });
      await updateUserProfile(user.uid, {
        ...formData,
        lastUpdated: new Date().toISOString()
      });
      
      setIsSuccess(true);
      toast.success('Profile updated successfully! ✨');
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="glass-dark border border-[#3E2723]/50 rounded-3xl p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-bl-full pointer-events-none" />
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-2xl font-display font-bold text-[#FFF3E0]">Personal Information</h3>
          <p className="text-xs text-[#FFF3E0]/40 uppercase tracking-widest font-bold mt-1">Manage your identity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Name Input */}
        <div className="space-y-2">
          <label className="text-[10px] text-[#FFF3E0]/40 uppercase tracking-[0.2em] font-bold ml-1">Full Name</label>
          <div className="relative group">
            <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.name ? 'text-red-400' : 'text-[#FFF3E0]/20 group-focus-within:text-[#D4AF37]'}`} />
            <input 
              name="name"
              type="text" 
              value={formData.name}
              onChange={handleChange}
              placeholder="Chocolate Lover"
              className={`w-full bg-[#1A0F0B] border rounded-2xl pl-12 pr-4 py-4 text-[#FFF3E0] focus:outline-none transition-all font-medium ${errors.name ? 'border-red-400/50 focus:border-red-400 bg-red-400/5' : 'border-[#3E2723] focus:border-[#D4AF37]/50'}`}
            />
          </div>
          {errors.name && <p className="text-[10px] text-red-400 ml-4 font-bold tracking-wider">{errors.name}</p>}
        </div>

        {/* Email Input (Disabled) */}
        <div className="space-y-2 opacity-60">
          <label className="text-[10px] text-[#FFF3E0]/40 uppercase tracking-[0.2em] font-bold ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFF3E0]/20" />
            <input 
              type="email" 
              value={user?.email || ''}
              disabled
              className="w-full bg-[#1A0F0B] border border-[#3E2723]/30 rounded-2xl pl-12 pr-4 py-4 text-[#FFF3E0]/30 cursor-not-allowed font-medium"
            />
          </div>
        </div>

        {/* Phone Input */}
        <div className="space-y-2">
          <label className="text-[10px] text-[#FFF3E0]/40 uppercase tracking-[0.2em] font-bold ml-1">Phone Number</label>
          <div className="relative group">
            <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.phone ? 'text-red-400' : 'text-[#FFF3E0]/20 group-focus-within:text-[#D4AF37]'}`} />
            <input 
              name="phone"
              type="tel" 
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className={`w-full bg-[#1A0F0B] border rounded-2xl pl-12 pr-4 py-4 text-[#FFF3E0] focus:outline-none transition-all font-medium ${errors.phone ? 'border-red-400/50 focus:border-red-400 bg-red-400/5' : 'border-[#3E2723] focus:border-[#D4AF37]/50'}`}
            />
          </div>
          {errors.phone && <p className="text-[10px] text-red-400 ml-4 font-bold tracking-wider">{errors.phone}</p>}
        </div>

        {/* DOB Input */}
        <div className="space-y-2">
          <label className="text-[10px] text-[#FFF3E0]/40 uppercase tracking-[0.2em] font-bold ml-1">Date of Birth</label>
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFF3E0]/20 group-focus-within:text-[#D4AF37] transition-colors" />
            <input 
              name="dob"
              type="date" 
              value={formData.dob}
              onChange={handleChange}
              className="w-full bg-[#1A0F0B] border border-[#3E2723] rounded-2xl pl-12 pr-4 py-4 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 transition-all [&::-webkit-calendar-picker-indicator]:invert-[0.8] font-medium"
            />
          </div>
        </div>
      </div>

      <div className="mt-12 flex items-center justify-between border-t border-[#3E2723]/50 pt-8">
        <p className="text-[10px] text-[#FFF3E0]/20 uppercase tracking-widest font-bold">
          Last updated: {userData?.lastUpdated ? new Date(userData.lastUpdated).toLocaleString() : 'Never'}
        </p>
        
        <button 
          onClick={handleSave}
          disabled={isSaving || Object.values(errors).some(e => !!e)}
          className={`flex items-center gap-3 px-10 py-4 rounded-full font-bold shadow-2xl transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 ${
            isSuccess ? 'bg-green-500 text-white shadow-green-500/20' : 'gold-gradient text-[#1A0F0B] shadow-[#D4AF37]/20 hover:scale-[1.02]'
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Syncing...</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Update Profile</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
