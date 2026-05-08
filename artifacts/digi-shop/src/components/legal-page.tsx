import { Layout } from "@/components/layout";

interface LegalPageProps {
  title: string;
  subtitle?: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPage({ title, subtitle, lastUpdated, children }: LegalPageProps) {
  return (
    <Layout>
      <div className="bg-muted/40 border-b border-border py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">{title}</h1>
          {subtitle && <p className="text-muted-foreground text-base">{subtitle}</p>}
          <p className="text-sm text-muted-foreground mt-3">Last updated: {lastUpdated}</p>
        </div>
      </div>
      <div className="container mx-auto px-4 max-w-4xl py-12">
        <div className="prose prose-slate prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline max-w-none">
          {children}
        </div>
      </div>
    </Layout>
  );
}
