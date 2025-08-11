"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KPIData {
  title: string;
  value: string;
}

export function StatsSection() {
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKPIData = async () => {
      try {
        const response = await fetch('/api/stats/kpi');
        if (!response.ok) {
          throw new Error('Failed to fetch KPI data');
        }
        const data = await response.json();
        setKpiData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchKPIData();
  }, []);

  if (loading) {
    return (
      <section className="w-full bg-secondary/50 py-12 sm:py-16">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Database Statistics
            </h2>
            <p className="mt-4 text-muted-foreground">Loading statistics...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full bg-secondary/50 py-12 sm:py-16">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Database Statistics
            </h2>
            <p className="mt-4 text-muted-foreground">Unable to load statistics at this time.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-secondary/50 py-12 sm:py-16">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Database Statistics
          </h2>
          <p className="mt-4 text-muted-foreground">
            Current overview of the BGC Atlas database
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {kpiData.map((item, index) => (
            <Card key={index} className="text-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-primary">
                  {parseInt(item.value).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}