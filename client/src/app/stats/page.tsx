import { StatsDashboard } from "./components/stats-dashboard";

export default function StatsPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
        Database Statistics
      </h1>
      <p className="mt-2 text-muted-foreground">
        An overview of the data in BGC-Atlas.
      </p>
      <div className="mt-8">
        <StatsDashboard />
      </div>
    </div>
  );
}
