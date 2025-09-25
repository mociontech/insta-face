'use client'
import { useOfflineSync } from '@/hooks/useOfflineSync';
import React from 'react'

function layout({ children }: { children: React.ReactNode }) {
  useOfflineSync();
  return (
    <>
      {children}
    </>
  )
}

export default layout
