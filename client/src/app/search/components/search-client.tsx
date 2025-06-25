"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud } from "lucide-react";

export function SearchClient() {
  return (
    <Card>
      <CardContent className="p-6">
        <Tabs defaultValue="metadata">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="metadata">Metadata Search</TabsTrigger>
            <TabsTrigger value="sequence">Sequence Search</TabsTrigger>
          </TabsList>
          <TabsContent value="metadata" className="mt-6">
            <form className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bgc-id">BGC ID</Label>
                <Input id="bgc-id" placeholder="e.g., BGC0001234" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gcf-id">GCF ID</Label>
                <Input id="gcf-id" placeholder="e.g., GCF_000567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxon">Taxonomy</Label>
                <Input id="taxon" placeholder="e.g., Streptomyces" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Cluster Class</Label>
                <Input id="class" placeholder="e.g., PKS" />
              </div>
              <div className="col-span-full">
                <Button type="submit">Search</Button>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="sequence" className="mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fasta-input">FASTA Sequence</Label>
                <Textarea
                  id="fasta-input"
                  rows={8}
                  placeholder=">seq1..."
                  className="font-code"
                />
              </div>
              <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed p-12 text-center">
                <UploadCloud className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 font-semibold">Drag & drop a FASTA file</p>
                <p className="text-sm text-muted-foreground">or</p>
                <Button variant="outline" className="mt-2">
                  Browse files
                </Button>
              </div>
              <Button>Search with Sequence</Button>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-8" />

        <div>
          <h2 className="font-headline text-2xl font-bold">Results</h2>
          <Tabs defaultValue="bgcs-results" className="mt-4">
            <TabsList>
              <TabsTrigger value="bgcs-results">BGCs</TabsTrigger>
              <TabsTrigger value="gcfs-results">GCFs</TabsTrigger>
              <TabsTrigger value="samples-results">Samples</TabsTrigger>
              <TabsTrigger value="taxa-results">Taxa</TabsTrigger>
            </TabsList>
            <TabsContent value="bgcs-results" className="mt-4">
                <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Search results will appear here.</p>
                </div>
            </TabsContent>
             <TabsContent value="gcfs-results" className="mt-4">
                <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Search results will appear here.</p>
                </div>
            </TabsContent>
             <TabsContent value="samples-results" className="mt-4">
                <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Search results will appear here.</p>
                </div>
            </TabsContent>
             <TabsContent value="taxa-results" className="mt-4">
                <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Search results will appear here.</p>
                </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
