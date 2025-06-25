import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import Image from "next/image";

export default function GcfDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
           <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
                GCF: {params.id}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <Badge variant="default">PKS</Badge>
                <span>Members: 152 BGCs</span>
                <span>Unique Taxa: 34</span>
              </div>
            </div>
            <Button>
              <Download className="mr-2" /> Download Family Data
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <h2 className="font-headline text-xl font-semibold">Member BGC Network</h2>
            <div className="mt-4 relative w-full aspect-video border rounded-lg bg-secondary flex items-center justify-center">
                <p className="font-semibold text-muted-foreground">Placeholder Interactive Network Graph</p>
                <Image src="https://placehold.co/1200x675" alt="Network graph" layout="fill" objectFit="cover" className="opacity-10" data-ai-hint="network graph" />
            </div>
          </div>
          <div>
            <h2 className="font-headline text-xl font-semibold">Taxa × Biome Distribution</h2>
            <div className="mt-4 relative w-full aspect-video border rounded-lg bg-secondary flex items-center justify-center">
                 <p className="font-semibold text-muted-foreground">Placeholder Heatmap</p>
                 <Image src="https://placehold.co/1200x675" alt="Heatmap" layout="fill" objectFit="cover" className="opacity-10" data-ai-hint="heatmap chart" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
