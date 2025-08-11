import { WorldMap } from "@/components/maps/world-map";
import { StatsSection } from "@/components/stats/stats-section";

export default function Home() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <section className="relative w-full bg-background flex-shrink-0">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[10px_10px] dark:bg-grid-slate-400/[0.05]"></div>
        <div className="relative mx-auto max-w-[1440px] px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            BGC-Atlas
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            BGC Atlas is a web resource for exploring the diversity of biosynthetic gene clusters (BGCs) across a wide range of environments. It integrates thousands of publicly available metagenomic datasets to help researchers investigate the ecological and functional distribution of BGCs.
          </p>
        </div>
      </section>

      <div className="flex-shrink-0">
        <StatsSection />
      </div>

      <section className="flex-1 flex flex-col py-4 sm:py-6 min-h-0">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 flex-1 flex flex-col w-full min-h-0">
          <WorldMap />
        </div>
      </section>
    </div>
  );
}

