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
            BGC Atlas is a web resource for exploring the diversity of biosynthetic gene clusters (BGCs) across a wide range of environments. It integrates thousands of publicly available metagenomic datasets to help researchers investigate the ecological and functional distribution of BGCs.
          </p>
        </div>
      </section>

      <section className="w-full flex-1 flex flex-col py-8 sm:py-12">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 flex-1 flex flex-col w-full">
          <WorldMap />
        </div>
      </section>
    </div>
  );
}

