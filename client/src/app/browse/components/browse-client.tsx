"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getBgcs, getGcfs, getSamples, getTaxonomy, getRuns, getBiomes, getStudies } from "@/services/api";

const FilterSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="py-4">
    <h3 className="font-semibold text-lg mb-4">{title}</h3>
    {children}
  </div>
);

export function BrowseClient() {
  const [sliderValue, setSliderValue] = useState([5000, 25000]);
  const [bgcData, setBgcData] = useState({ data: [], total: 0 });
  const [gcfData, setGcfData] = useState({ data: [], total: 0 });
  const [sampleData, setSampleData] = useState({ data: [], total: 0 });
  const [taxonomyData, setTaxonomyData] = useState({ data: [], total: 0 });
  const [runsData, setRunsData] = useState({ data: [], total: 0 });
  const [biomesData, setBiomesData] = useState({ data: [], total: 0 });
  const [studiesData, setStudiesData] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("studies");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Only fetch data for the active tab to improve performance
        if (activeTab === "studies") {
          const response = await getStudies();
          console.log("Studies data:", response);
          setStudiesData(response);
        } else if (activeTab === "bgcs") {
          const response = await getBgcs();
          console.log("BGCs data:", response);
          setBgcData(response);
        } else if (activeTab === "gcfs") {
          const response = await getGcfs();
          console.log("GCFs data:", response);
          setGcfData(response);
        } else if (activeTab === "samples") {
          const response = await getSamples();
          console.log("Samples data:", response);
          setSampleData(response);
        } else if (activeTab === "taxonomy") {
          const response = await getTaxonomy();
          console.log("Taxonomy data:", response);
          setTaxonomyData(response);
        } else if (activeTab === "runs") {
          const response = await getRuns();
          console.log("Runs data:", response);
          setRunsData(response);
        } else if (activeTab === "biomes") {
          const response = await getBiomes();
          console.log("Biomes data:", response);
          setBiomesData(response);
        }
      } catch (error) {
        console.error(`Error fetching ${activeTab} data:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const renderEmptyState = (item: string) => (
     <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg">
        <div className="text-5xl text-muted-foreground mb-4">🧬</div>
        <h3 className="text-xl font-semibold">No {item} Found</h3>
        <p className="text-muted-foreground mt-1">Try adjusting your filters.</p>
    </div>
  )

  const renderBgcTable = () => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Product Class</TableHead>
              <TableHead>Assembly</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Show skeleton loading state
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                </TableRow>
              ))
            ) : (
              // If no data, show empty state
              bgcData.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                // Show actual BGC data
                bgcData.data.map((bgc) => (
                  <TableRow key={bgc.id}>
                    <TableCell>{bgc.id}</TableCell>
                    <TableCell>{Array.isArray(bgc.product_class) ? bgc.product_class.join(', ') : bgc.product_class}</TableCell>
                    <TableCell>{bgc.assembly_accession}</TableCell>
                    <TableCell>{`${bgc.contig}:${bgc.start}-${bgc.end_pos}`}</TableCell>
                  </TableRow>
                ))
              )
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderGcfTable = () => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>GCF ID</TableHead>
              <TableHead>BGC Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Show skeleton loading state
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                </TableRow>
              ))
            ) : (
              // If no data, show empty state
              gcfData.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                // Show actual GCF data
                gcfData.data.map((gcf) => (
                  <TableRow key={gcf.id}>
                    <TableCell>{gcf.id}</TableCell>
                    <TableCell>{gcf.bgc_count}</TableCell>
                  </TableRow>
                ))
              )
            )}
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
        <Tabs defaultValue="studies" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="studies">Studies</TabsTrigger>
            <TabsTrigger value="samples">Samples</TabsTrigger>
            <TabsTrigger value="runs">Runs</TabsTrigger>
            <TabsTrigger value="biomes">Biomes</TabsTrigger>
            <TabsTrigger value="gcfs">GCFs</TabsTrigger>
            <TabsTrigger value="taxonomy">Taxonomy</TabsTrigger>
            <TabsTrigger value="bgcs">BGCs</TabsTrigger>
          </TabsList>
          <TabsContent value="studies" className="mt-6">
            {studiesData.data.length === 0 && !loading ? renderEmptyState("Studies") : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Accession</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Bioproject</TableHead>
                        <TableHead>Release Date</TableHead>
                        <TableHead>BGC Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        // Show skeleton loading state
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          </TableRow>
                        ))
                      ) : (
                        // Show actual studies data
                        studiesData.data.map((study) => (
                          <TableRow key={study.id}>
                            <TableCell>{study.accession}</TableCell>
                            <TableCell>{study.study_name}</TableCell>
                            <TableCell>{study.bioproject || 'N/A'}</TableCell>
                            <TableCell>{study.public_release_date ? new Date(study.public_release_date).toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell>{study.bgc_count || 0}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="samples" className="mt-6">
            {sampleData.data.length === 0 && !loading ? renderEmptyState("Samples") : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Biome</TableHead>
                        <TableHead>Collection Date</TableHead>
                        <TableHead>BGC Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        // Show skeleton loading state
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          </TableRow>
                        ))
                      ) : (
                        // Show actual sample data
                        sampleData.data.map((sample) => (
                          <TableRow key={sample.id}>
                            <TableCell>{sample.accession}</TableCell>
                            <TableCell>{sample.sample_name}</TableCell>
                            <TableCell>{sample.environment_biome || 'N/A'}</TableCell>
                            <TableCell>{sample.collection_date ? new Date(sample.collection_date).toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell>{sample.bgc_count || 0}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="runs" className="mt-6">
            {runsData.data.length === 0 && !loading ? renderEmptyState("Runs") : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Accession</TableHead>
                        <TableHead>Sample Name</TableHead>
                        <TableHead>Experiment Type</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>BGC Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        // Show skeleton loading state
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          </TableRow>
                        ))
                      ) : (
                        // Show actual runs data
                        runsData.data.map((run) => (
                          <TableRow key={run.id}>
                            <TableCell>{run.accession}</TableCell>
                            <TableCell>{run.sample_name}</TableCell>
                            <TableCell>{run.experiment_type || 'N/A'}</TableCell>
                            <TableCell>{run.instrument_platform || 'N/A'}</TableCell>
                            <TableCell>{run.bgc_count || 0}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="biomes" className="mt-6">
            {biomesData.data.length === 0 && !loading ? renderEmptyState("Biomes") : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Lineage</TableHead>
                        <TableHead>BGC Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        // Show skeleton loading state
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          </TableRow>
                        ))
                      ) : (
                        // Show actual biomes data
                        biomesData.data.map((biome) => (
                          <TableRow key={biome.id}>
                            <TableCell>{biome.id}</TableCell>
                            <TableCell>{biome.lineage}</TableCell>
                            <TableCell>{biome.bgc_count || 0}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="gcfs" className="mt-6">
            {gcfData.data.length === 0 && !loading ? renderEmptyState("GCFs") : renderGcfTable()}
          </TabsContent>
          <TabsContent value="taxonomy" className="mt-6">
            {renderEmptyState("Taxa")}
          </TabsContent>
          <TabsContent value="bgcs" className="mt-6">
            {bgcData.data.length === 0 && !loading ? renderEmptyState("BGCs") : renderBgcTable()}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
