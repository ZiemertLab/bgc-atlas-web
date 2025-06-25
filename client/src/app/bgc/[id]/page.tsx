import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, VenetianMask } from "lucide-react";
import Image from "next/image";

export default function BgcDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
                BGC: {params.id}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <Badge variant="default">PKS</Badge>
                <span>Length: 23,456 bp</span>
                <span>Host: <i className="hover:underline cursor-pointer">Streptomyces coelicolor</i></span>
                <span>Biome: <Badge variant="secondary">Soil</Badge></span>
              </div>
            </div>
            <Button>
              <Download className="mr-2" /> Download GenBank
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <h2 className="font-headline text-xl font-semibold">Locus Diagram</h2>
            <div className="mt-4 relative w-full h-48 border rounded-lg bg-secondary flex items-center justify-center">
                <p className="font-semibold text-muted-foreground">Placeholder SVG Locus Diagram</p>
            </div>
          </div>
          <Separator className="my-6" />
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="similar">Similar BGCs</TabsTrigger>
              <TabsTrigger value="downloads">Downloads</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="font-semibold text-muted-foreground">Description</div>
                <div className="md:col-span-2">A type I polyketide synthase cluster responsible for the production of a pigmented antibiotic.</div>
                
                <div className="font-semibold text-muted-foreground">Accession</div>
                <div className="md:col-span-2 font-code">BGC0001234</div>

                <div className="font-semibold text-muted-foreground">Organism</div>
                <div className="md:col-span-2">Streptomyces coelicolor A3(2)</div>
               </div>
            </TabsContent>
            <TabsContent value="similar" className="mt-4">
                <p className="text-muted-foreground">Table of BGCs with high similarity scores.</p>
            </TabsContent>
             <TabsContent value="downloads" className="mt-4">
                <p className="text-muted-foreground">Download options including GenBank and JSON formats.</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
