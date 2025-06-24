"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const FilterSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="py-4">
    <h3 className="font-semibold text-lg mb-4">{title}</h3>
    {children}
  </div>
);

export function BrowseClient() {
  const [sliderValue, setSliderValue] = useState([5000, 25000]);

  const renderEmptyState = (item: string) => (
     <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg">
        <div className="text-5xl text-muted-foreground mb-4">🧬</div>
        <h3 className="text-xl font-semibold">No {item} Found</h3>
        <p className="text-muted-foreground mt-1">Try adjusting your filters.</p>
    </div>
  )

  const renderDataTable = (type: string) => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>{type === 'BGC' || type === 'GCF' ? 'Class' : 'Name'}</TableHead>
              <TableHead>Taxonomy</TableHead>
              <TableHead>Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );


  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
      <aside className="col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <FilterSection title="Cluster Class">
              <div className="space-y-2">
                {["PKS", "NRPS", "RiPP", "Saccharide", "Terpene"].map((cls) => (
                   <div key={cls} className="flex items-center space-x-2">
                    <Checkbox id={cls.toLowerCase()} />
                    <Label htmlFor={cls.toLowerCase()}>{cls}</Label>
                  </div>
                ))}
              </div>
            </FilterSection>
            <FilterSection title="Biome">
              <div className="flex flex-wrap gap-2">
                {["Marine", "Soil", "Freshwater", "Host-associated"].map(biome => (
                  <Badge key={biome} variant="outline" className="cursor-pointer hover:bg-accent">{biome}</Badge>
                ))}
              </div>
            </FilterSection>
             <FilterSection title="Length (bp)">
              <Slider
                defaultValue={sliderValue}
                max={100000}
                step={1000}
                onValueChange={setSliderValue}
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>{sliderValue[0]}</span>
                <span>{sliderValue[1]}</span>
              </div>
            </FilterSection>
          </CardContent>
        </Card>
      </aside>
      <main className="col-span-1 lg:col-span-3">
        <Tabs defaultValue="bgcs">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bgcs">BGCs</TabsTrigger>
            <TabsTrigger value="gcfs">GCFs</TabsTrigger>
            <TabsTrigger value="samples">Samples</TabsTrigger>
            <TabsTrigger value="taxonomy">Taxonomy</TabsTrigger>
          </TabsList>
          <TabsContent value="bgcs" className="mt-6">
            {renderDataTable("BGC")}
          </TabsContent>
          <TabsContent value="gcfs" className="mt-6">
            {renderDataTable("GCF")}
          </TabsContent>
          <TabsContent value="samples" className="mt-6">
            {renderEmptyState("Samples")}
          </TabsContent>
          <TabsContent value="taxonomy" className="mt-6">
            {renderEmptyState("Taxa")}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
