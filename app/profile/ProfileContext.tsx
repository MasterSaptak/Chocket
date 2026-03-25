'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { UserCommandCenterData } from '@/types/profile';

interface ProfileContextType {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSaving, setIsSaving] = useState(false);

  return (
    <ProfileContext.Provider value={{ 
      activeSection, 
      setActiveSection, 
      isSaving, 
      setIsSaving 
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
