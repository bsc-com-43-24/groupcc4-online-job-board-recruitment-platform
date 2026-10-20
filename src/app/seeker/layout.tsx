'use client';

import React from 'react';

export default function SeekerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: 40 }}>
      {children}
    </div>
  );
}