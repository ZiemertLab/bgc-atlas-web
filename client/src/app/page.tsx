import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart, Database, Terminal } from "lucide-react";
import Link from "next/link";
import { WorldMap } from "@/components/maps/world-map";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative w-full bg-background">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[10px_10px] dark:bg-grid-slate-400/[0.05]"></div>
        <div className="relative mx-auto max-w-[1440px] px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            BGC-Atlas
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            A community resource for the metadata-aware exploration of biosynthetic gene clusters.
          </p>
          <div className="mt-10">
            <Button asChild size="lg">
              <Link href="/browse">
                Explore Database <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="w-full bg-secondary py-16 sm:py-24">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          <FeatureCard
            icon={<Database className="h-10 w-10 text-primary" />}
            title="Browse"
            description="Explore a comprehensive collection of BGCs, Gene Cluster Families, samples, and taxonomy."
            href="/browse"
          />
          <FeatureCard
            icon={<BarChart className="h-10 w-10 text-primary" />}
            title="Statistics"
            description="Visualize database statistics, BGC class distributions, and geographical sample data."
            href="/stats"
          />
          <FeatureCard
            icon={<Terminal className="h-10 w-10 text-primary" />}
            title="API Access"
            description="Programmatically access the BGC-Atlas database through our public API."
            href="/docs"
          />
        </div>
      </section>

      <section className="w-full flex-1 flex flex-col py-8 sm:py-12">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 flex-1 flex flex-col w-full">
          <WorldMap />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-col items-center text-center">
        {icon}
        <CardTitle className="mt-4 font-headline text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col text-center">
        <p className="flex-grow text-muted-foreground">{description}</p>
        <Button asChild variant="outline" className="mt-6 w-full">
          <Link href={href}>
            {title} <ArrowRight className="ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
