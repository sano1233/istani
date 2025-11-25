export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background-dark">{children}</div>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
