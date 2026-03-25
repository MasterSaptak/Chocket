'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Globe, Mail, MessageSquare, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { getUserPreferences, saveUserPreferences } from '@/lib/profile-service';
import type { UserPreferences } from '@/types/profile';
import { toast } from 'sonner';

export default function Preferences() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: {
      email: true,
      sms: false,
      whatsapp: true,
      promotions: true
    },
    language: 'English',
    currency: 'INR'
  });

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    try {
      const data = await getUserPreferences(user.uid);
      if (data) setPreferences(data);
    } catch (error) {
      console.error('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof UserPreferences['notifications']) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
    setIsSuccess(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await saveUserPreferences(user.uid, preferences);
      setIsSuccess(true);
      toast.success('Preferences saved safely! ✨');
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-display font-bold text-[#FFF3E0]">Preferences</h3>
            <p className="text-xs text-[#FFF3E0]/40 uppercase tracking-widest font-bold mt-1">Personalize your experience</p>
          </div>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-3 px-10 py-3.5 rounded-full font-bold shadow-2xl transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 ${
            isSuccess ? 'bg-green-500 text-white shadow-green-500/20' : 'gold-gradient text-[#1A0F0B] shadow-[#D4AF37]/20 hover:scale-[1.02]'
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Ready</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save System Settings</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Notification Settings */}
        <div className="glass-dark border border-[#3E2723]/30 rounded-[40px] p-10">
          <div className="flex items-center gap-3 mb-8">
            <Mail className="w-5 h-5 text-[#D4AF37]" />
            <h4 className="text-xl font-display font-bold text-[#FFF3E0]">Notifications</h4>
          </div>
          
          <div className="space-y-4">
            {[
              { id: 'email', label: 'Email Notifications', desc: 'Orders, receipts & tracking', icon: Mail },
              { id: 'sms', label: 'SMS Alerts', desc: 'Critical order updates on phone', icon: MessageSquare },
              { id: 'whatsapp', label: 'WhatsApp Messenger', desc: 'Direct order support & status', icon: Globe },
              { id: 'promotions', label: 'Marketing Offers', desc: 'Exclusive gold-tier deals', icon: Zap },
            ].map((n) => (
              <button
                key={n.id}
                onClick={() => handleToggle(n.id as any)}
                className="w-full flex items-center justify-between p-5 bg-[#1A0F0B] border border-white/5 rounded-3xl hover:border-[#D4AF37]/20 transition-all group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${preferences.notifications[n.id as keyof UserPreferences['notifications']] ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-white/5 text-[#FFF3E0]/20'}`}>
                    <n.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#FFF3E0] group-hover:text-[#FFF3E0] transition-colors">{n.label}</p>
                    <p className="text-[10px] text-[#FFF3E0]/30 font-bold uppercase tracking-widest mt-0.5">{n.desc}</p>
                  </div>
                </div>
                
                <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${preferences.notifications[n.id as keyof UserPreferences['notifications']] ? 'bg-[#D4AF37]' : 'bg-white/10'}`}>
                   <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${preferences.notifications[n.id as keyof UserPreferences['notifications']] ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Localization & Region */}
        <div className="glass-dark border border-[#3E2723]/30 rounded-[40px] p-10 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <Globe className="w-5 h-5 text-[#D4AF37]" />
            <h4 className="text-xl font-display font-bold text-[#FFF3E0]">Localization</h4>
          </div>

          <div className="space-y-8 flex-1">
            <div className="space-y-4">
              <label className="text-[10px] text-[#FFF3E0]/30 font-bold uppercase tracking-[0.2em] ml-2">Preferred Language</label>
              <div className="grid grid-cols-2 gap-3">
                {['English', 'Hindi', 'French', 'Spanish'].map(l => (
                  <button
                    key={l}
                    onClick={() => setPreferences({...preferences, language: l})}
                    className={`py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all ${preferences.language === l ? 'bg-[#D4AF37]/10 border-[#D4AF37]/50 text-[#D4AF37]' : 'border-[#3E2723] text-[#FFF3E0]/30 hover:border-[#FFF3E0]/20'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] text-[#FFF3E0]/30 font-bold uppercase tracking-[0.2em] ml-2">Currency Symbol</label>
              <div className="grid grid-cols-2 gap-3">
                {['INR (₹)', 'USD ($)', 'EUR (€)', 'GBP (£)'].map(c => (
                  <button
                    key={c}
                    onClick={() => setPreferences({...preferences, currency: c.split(' ')[0]})}
                    className={`py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all ${preferences.currency === c.split(' ')[0] ? 'bg-[#D4AF37]/10 border-[#D4AF37]/50 text-[#D4AF37]' : 'border-[#3E2723] text-[#FFF3E0]/30 hover:border-[#FFF3E0]/20'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-auto p-6 bg-[#D4AF37]/5 border border-[#D4AF37]/10 rounded-3xl">
              <p className="text-[10px] text-[#FFF3E0]/50 font-medium leading-relaxed italic">
                Note: Changing language or currency will update your entire store interface once you refresh the application.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Fixed import for Zap
import { Zap } from 'lucide-react';
