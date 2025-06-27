"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { getBgcs, getGcfs, getSamples, getTaxonomy, getRuns, getBiomes, getStudies } from "@/services/api";

// Type for sort state
type SortState = {
  column: string;
  direction: "asc" | "desc" | null;
};

const FilterSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="py-4">
    <h3 className="font-semibold text-lg mb-4">{title}</h3>
    {children}
  </div>
);

export function BrowseClient() {
  const [sliderValue, setSliderValue] = useState([5000, 25000]);
  const [bgcData, setBgcData] = useState({ data: [], total: 0, page: 1, limit: 10 });
  const [gcfData, setGcfData] = useState({ data: [], total: 0, page: 1, limit: 10 });
  const [sampleData, setSampleData] = useState({ data: [], total: 0, page: 1, limit: 10 });
  const [taxonomyData, setTaxonomyData] = useState({ data: [], total: 0, page: 1, limit: 10 });
  const [runsData, setRunsData] = useState({ data: [], total: 0, page: 1, limit: 10 });
  const [biomesData, setBiomesData] = useState({ data: [], total: 0, page: 1, limit: 10 });
  const [studiesData, setStudiesData] = useState({ data: [], total: 0, page: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("studies");
  const [filtersVisible, setFiltersVisible] = useState(true);

  // Sorting states for each table
  const [studiesSort, setStudiesSort] = useState<SortState>({ column: "", direction: null });
  const [samplesSort, setSamplesSort] = useState<SortState>({ column: "", direction: null });
  const [runsSort, setRunsSort] = useState<SortState>({ column: "", direction: null });
  const [biomesSort, setBiomesSort] = useState<SortState>({ column: "", direction: null });
  const [gcfsSort, setGcfsSort] = useState<SortState>({ column: "", direction: null });
  const [taxonomySort, setTaxonomySort] = useState<SortState>({ column: "", direction: null });
  const [bgcsSort, setBgcsSort] = useState<SortState>({ column: "", direction: null });

  // Generic sorting function
  const handleSort = (
    column: string,
    currentSort: SortState,
    setSort: React.Dispatch<React.SetStateAction<SortState>>
  ) => {
    // If clicking the same column, cycle through: null -> asc -> desc -> null
    if (currentSort.column === column) {
      const nextDirection = currentSort.direction === null 
        ? "asc" 
        : currentSort.direction === "asc" 
          ? "desc" 
          : null;
      setSort({ column, direction: nextDirection });
    } else {
      // If clicking a new column, start with ascending sort
      setSort({ column, direction: "asc" });
    }
  };

  // Sort functions for each table
  const handleStudiesSort = (column: string) => handleSort(column, studiesSort, setStudiesSort);
  const handleSamplesSort = (column: string) => handleSort(column, samplesSort, setSamplesSort);
  const handleRunsSort = (column: string) => handleSort(column, runsSort, setRunsSort);
  const handleBiomesSort = (column: string) => handleSort(column, biomesSort, setBiomesSort);
  const handleGcfsSort = (column: string) => handleSort(column, gcfsSort, setGcfsSort);
  const handleTaxonomySort = (column: string) => handleSort(column, taxonomySort, setTaxonomySort);
  const handleBgcsSort = (column: string) => handleSort(column, bgcsSort, setBgcsSort);

  // Page change handlers for each table
  const handleStudiesPageChange = (page: number) => {
    setStudiesData(prev => ({ ...prev, page }));
  };

  const handleSamplesPageChange = (page: number) => {
    setSampleData(prev => ({ ...prev, page }));
  };

  const handleRunsPageChange = (page: number) => {
    setRunsData(prev => ({ ...prev, page }));
  };

  const handleBiomesPageChange = (page: number) => {
    setBiomesData(prev => ({ ...prev, page }));
  };

  const handleGcfsPageChange = (page: number) => {
    setGcfData(prev => ({ ...prev, page }));
  };

  const handleTaxonomyPageChange = (page: number) => {
    setTaxonomyData(prev => ({ ...prev, page }));
  };

  const handleBgcsPageChange = (page: number) => {
    setBgcData(prev => ({ ...prev, page }));
  };

  // Apply sorting to data
  const sortedStudiesData = useMemo(() => {
    if (!studiesSort.column || !studiesSort.direction || studiesData.data.length === 0) {
      return studiesData.data;
    }

    return [...studiesData.data].sort((a, b) => {
      const aValue = a[studiesSort.column];
      const bValue = b[studiesSort.column];

      // Handle null/undefined values
      if (aValue == null) return studiesSort.direction === "asc" ? -1 : 1;
      if (bValue == null) return studiesSort.direction === "asc" ? 1 : -1;

      // Compare based on data type
      if (typeof aValue === "string" && typeof bValue === "string") {
        return studiesSort.direction === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }

      // For numbers and other types
      return studiesSort.direction === "asc" 
        ? (aValue > bValue ? 1 : -1) 
        : (aValue > bValue ? -1 : 1);
    });
  }, [studiesData.data, studiesSort]);

  const sortedSamplesData = useMemo(() => {
    if (!samplesSort.column || !samplesSort.direction || sampleData.data.length === 0) {
      return sampleData.data;
    }

    return [...sampleData.data].sort((a, b) => {
      const aValue = a[samplesSort.column];
      const bValue = b[samplesSort.column];

      if (aValue == null) return samplesSort.direction === "asc" ? -1 : 1;
      if (bValue == null) return samplesSort.direction === "asc" ? 1 : -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return samplesSort.direction === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }

      return samplesSort.direction === "asc" 
        ? (aValue > bValue ? 1 : -1) 
        : (aValue > bValue ? -1 : 1);
    });
  }, [sampleData.data, samplesSort]);

  const sortedRunsData = useMemo(() => {
    if (!runsSort.column || !runsSort.direction || runsData.data.length === 0) {
      return runsData.data;
    }

    return [...runsData.data].sort((a, b) => {
      const aValue = a[runsSort.column];
      const bValue = b[runsSort.column];

      if (aValue == null) return runsSort.direction === "asc" ? -1 : 1;
      if (bValue == null) return runsSort.direction === "asc" ? 1 : -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return runsSort.direction === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }

      return runsSort.direction === "asc" 
        ? (aValue > bValue ? 1 : -1) 
        : (aValue > bValue ? -1 : 1);
    });
  }, [runsData.data, runsSort]);

  const sortedBiomesData = useMemo(() => {
    if (!biomesSort.column || !biomesSort.direction || biomesData.data.length === 0) {
      return biomesData.data;
    }

    return [...biomesData.data].sort((a, b) => {
      const aValue = a[biomesSort.column];
      const bValue = b[biomesSort.column];

      if (aValue == null) return biomesSort.direction === "asc" ? -1 : 1;
      if (bValue == null) return biomesSort.direction === "asc" ? 1 : -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return biomesSort.direction === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }

      return biomesSort.direction === "asc" 
        ? (aValue > bValue ? 1 : -1) 
        : (aValue > bValue ? -1 : 1);
    });
  }, [biomesData.data, biomesSort]);

  const sortedGcfsData = useMemo(() => {
    if (!gcfsSort.column || !gcfsSort.direction || gcfData.data.length === 0) {
      return gcfData.data;
    }

    return [...gcfData.data].sort((a, b) => {
      const aValue = a[gcfsSort.column];
      const bValue = b[gcfsSort.column];

      if (aValue == null) return gcfsSort.direction === "asc" ? -1 : 1;
      if (bValue == null) return gcfsSort.direction === "asc" ? 1 : -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return gcfsSort.direction === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }

      return gcfsSort.direction === "asc" 
        ? (aValue > bValue ? 1 : -1) 
        : (aValue > bValue ? -1 : 1);
    });
  }, [gcfData.data, gcfsSort]);

  const sortedBgcsData = useMemo(() => {
    if (!bgcsSort.column || !bgcsSort.direction || bgcData.data.length === 0) {
      return bgcData.data;
    }

    return [...bgcData.data].sort((a, b) => {
      const aValue = a[bgcsSort.column];
      const bValue = b[bgcsSort.column];

      if (aValue == null) return bgcsSort.direction === "asc" ? -1 : 1;
      if (bValue == null) return bgcsSort.direction === "asc" ? 1 : -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return bgcsSort.direction === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }

      return bgcsSort.direction === "asc" 
        ? (aValue > bValue ? 1 : -1) 
        : (aValue > bValue ? -1 : 1);
    });
  }, [bgcData.data, bgcsSort]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Only fetch data for the active tab to improve performance
        if (activeTab === "studies") {
          const { page, limit } = studiesData;
          const response = await getStudies({ page, limit });
          console.log("Studies data:", response);
          setStudiesData(prev => ({ ...prev, ...response }));
        } else if (activeTab === "bgcs") {
          const { page, limit } = bgcData;
          const response = await getBgcs({ page, limit });
          console.log("BGCs data:", response);
          setBgcData(prev => ({ ...prev, ...response }));
        } else if (activeTab === "gcfs") {
          const { page, limit } = gcfData;
          const response = await getGcfs({ page, limit });
          console.log("GCFs data:", response);
          setGcfData(prev => ({ ...prev, ...response }));
        } else if (activeTab === "samples") {
          const { page, limit } = sampleData;
          const response = await getSamples({ page, limit });
          console.log("Samples data:", response);
          setSampleData(prev => ({ ...prev, ...response }));
        } else if (activeTab === "taxonomy") {
          const { page, limit } = taxonomyData;
          const response = await getTaxonomy({ page, limit });
          console.log("Taxonomy data:", response);
          setTaxonomyData(prev => ({ ...prev, ...response }));
        } else if (activeTab === "runs") {
          const { page, limit } = runsData;
          const response = await getRuns({ page, limit });
          console.log("Runs data:", response);
          setRunsData(prev => ({ ...prev, ...response }));
        } else if (activeTab === "biomes") {
          const { page, limit } = biomesData;
          const response = await getBiomes({ page, limit });
          console.log("Biomes data:", response);
          setBiomesData(prev => ({ ...prev, ...response }));
        }
      } catch (error) {
        console.error(`Error fetching ${activeTab} data:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, 
      studiesData.page, studiesData.limit,
      bgcData.page, bgcData.limit,
      gcfData.page, gcfData.limit,
      sampleData.page, sampleData.limit,
      taxonomyData.page, taxonomyData.limit,
      runsData.page, runsData.limit,
      biomesData.page, biomesData.limit
  ]);

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
        <DataTable
          columns={[
            {
              key: "id",
              label: "ID",
              sortable: true
            },
            {
              key: "product_class",
              label: "Product Class",
              sortable: true,
              render: (row) => Array.isArray(row.product_class) ? row.product_class.join(', ') : row.product_class
            },
            {
              key: "assembly_accession",
              label: "Assembly",
              sortable: true
            },
            {
              key: "contig",
              label: "Location",
              sortable: true,
              render: (row) => `${row.contig}:${row.start}-${row.end_pos}`
            }
          ]}
          data={sortedBgcsData}
          total={bgcData.total}
          page={bgcData.page}
          limit={bgcData.limit}
          loading={loading}
          sortState={bgcsSort}
          onSort={handleBgcsSort}
          onPageChange={handleBgcsPageChange}
        />
      </CardContent>
    </Card>
  );

  const renderGcfTable = () => (
    <Card>
      <CardContent className="p-0">
        <DataTable
          columns={[
            {
              key: "id",
              label: "GCF ID",
              sortable: true
            },
            {
              key: "bgc_count",
              label: "BGC Count",
              sortable: true
            }
          ]}
          data={sortedGcfsData}
          total={gcfData.total}
          page={gcfData.page}
          limit={gcfData.limit}
          loading={loading}
          sortState={gcfsSort}
          onSort={handleGcfsSort}
          onPageChange={handleGcfsPageChange}
        />
      </CardContent>
    </Card>
  );


  return (
    <div className={`grid grid-cols-1 gap-8 ${filtersVisible ? 'lg:grid-cols-4' : 'lg:grid-cols-1'}`}>
      {filtersVisible && (
        <aside className="col-span-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-headline">Filters</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFiltersVisible(!filtersVisible)}
                className="h-8 w-8 p-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="m18 15-6-6-6 6"/>
                </svg>
                <span className="sr-only">Hide filters</span>
              </Button>
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
      )}
      <main className={`col-span-1 ${filtersVisible ? 'lg:col-span-3' : 'lg:col-span-1'}`}>
        {!filtersVisible && (
          <div className="mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setFiltersVisible(true)}
              className="flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M3 6h18M6 12h12M9 18h6"/>
              </svg>
              Show Filters
            </Button>
          </div>
        )}
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
                  <DataTable
                    columns={[
                      {
                        key: "accession",
                        label: "Accession",
                        sortable: true
                      },
                      {
                        key: "study_name",
                        label: "Name",
                        sortable: true
                      },
                      {
                        key: "bioproject",
                        label: "Bioproject",
                        sortable: true,
                        render: (row) => row.bioproject || 'N/A'
                      },
                      {
                        key: "public_release_date",
                        label: "Release Date",
                        sortable: true,
                        render: (row) => row.public_release_date ? new Date(row.public_release_date).toLocaleDateString() : 'N/A'
                      },
                      {
                        key: "bgc_count",
                        label: "BGC Count",
                        sortable: true,
                        render: (row) => row.bgc_count || 0
                      }
                    ]}
                    data={sortedStudiesData}
                    total={studiesData.total}
                    page={studiesData.page}
                    limit={studiesData.limit}
                    loading={loading}
                    sortState={studiesSort}
                    onSort={handleStudiesSort}
                    onPageChange={handleStudiesPageChange}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="samples" className="mt-6">
            {sampleData.data.length === 0 && !loading ? renderEmptyState("Samples") : (
              <Card>
                <CardContent className="p-0">
                  <DataTable
                    columns={[
                      {
                        key: "accession",
                        label: "ID",
                        sortable: true
                      },
                      {
                        key: "sample_name",
                        label: "Name",
                        sortable: true
                      },
                      {
                        key: "environment_biome",
                        label: "Biome",
                        sortable: true,
                        render: (row) => row.environment_biome || 'N/A'
                      },
                      {
                        key: "collection_date",
                        label: "Collection Date",
                        sortable: true,
                        render: (row) => row.collection_date ? new Date(row.collection_date).toLocaleDateString() : 'N/A'
                      },
                      {
                        key: "bgc_count",
                        label: "BGC Count",
                        sortable: true,
                        render: (row) => row.bgc_count || 0
                      }
                    ]}
                    data={sortedSamplesData}
                    total={sampleData.total}
                    page={sampleData.page}
                    limit={sampleData.limit}
                    loading={loading}
                    sortState={samplesSort}
                    onSort={handleSamplesSort}
                    onPageChange={handleSamplesPageChange}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="runs" className="mt-6">
            {runsData.data.length === 0 && !loading ? renderEmptyState("Runs") : (
              <Card>
                <CardContent className="p-0">
                  <DataTable
                    columns={[
                      {
                        key: "accession",
                        label: "Accession",
                        sortable: true
                      },
                      {
                        key: "sample_name",
                        label: "Sample Name",
                        sortable: true
                      },
                      {
                        key: "experiment_type",
                        label: "Experiment Type",
                        sortable: true,
                        render: (row) => row.experiment_type || 'N/A'
                      },
                      {
                        key: "instrument_platform",
                        label: "Platform",
                        sortable: true,
                        render: (row) => row.instrument_platform || 'N/A'
                      },
                      {
                        key: "bgc_count",
                        label: "BGC Count",
                        sortable: true,
                        render: (row) => row.bgc_count || 0
                      }
                    ]}
                    data={sortedRunsData}
                    total={runsData.total}
                    page={runsData.page}
                    limit={runsData.limit}
                    loading={loading}
                    sortState={runsSort}
                    onSort={handleRunsSort}
                    onPageChange={handleRunsPageChange}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="biomes" className="mt-6">
            {biomesData.data.length === 0 && !loading ? renderEmptyState("Biomes") : (
              <Card>
                <CardContent className="p-0">
                  <DataTable
                    columns={[
                      {
                        key: "id",
                        label: "ID",
                        sortable: true
                      },
                      {
                        key: "lineage",
                        label: "Lineage",
                        sortable: true
                      },
                      {
                        key: "bgc_count",
                        label: "BGC Count",
                        sortable: true,
                        render: (row) => row.bgc_count || 0
                      }
                    ]}
                    data={sortedBiomesData}
                    total={biomesData.total}
                    page={biomesData.page}
                    limit={biomesData.limit}
                    loading={loading}
                    sortState={biomesSort}
                    onSort={handleBiomesSort}
                    onPageChange={handleBiomesPageChange}
                  />
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
