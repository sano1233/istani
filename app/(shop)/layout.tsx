import React from 'react';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background-dark">{children}</div>;
}
