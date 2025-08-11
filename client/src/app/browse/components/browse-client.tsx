"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { getBgcs, getGcfs, getTaxonomy, getBiomes, getStudies, getAnalyses } from "@/services/api";
import { TruncatedText } from "@/components/truncated-text";
import { FilterMenu, FilterValue } from "./filter-menu";

// Type for sort state
type SortState = {
  column: string;
  direction: "asc" | "desc" | null;
};



export function BrowseClient() {
  console.log("[DEBUG_LOG] BrowseClient: Component is initializing");
  
  const [bgcData, setBgcData] = useState({ data: [], total: 0, page: 1, limit: 10 });
  const [gcfData, setGcfData] = useState({ data: [], total: 0, page: 1, limit: 10 });
  const [taxonomyData, setTaxonomyData] = useState({ data: [], total: 0, page: 1, limit: 10 });
  const [biomesData, setBiomesData] = useState({ data: [], total: 0, page: 1, limit: 10 });
  const [studiesData, setStudiesData] = useState({ data: [], total: 0, page: 1, limit: 10 });
  const [analysesData, setAnalysesData] = useState({ data: [], total: 0, page: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("analyses");
  const [activeFilters, setActiveFilters] = useState<FilterValue[]>([]);
  
  console.log("[DEBUG_LOG] BrowseClient: State initialized, activeTab:", activeTab);

  // Sorting states for each table
  const [studiesSort, setStudiesSort] = useState<SortState>({ column: "", direction: null });
  const [biomesSort, setBiomesSort] = useState<SortState>({ column: "bgc_count", direction: "desc" });
  const [gcfsSort, setGcfsSort] = useState<SortState>({ column: "", direction: null });
  const [taxonomySort, setTaxonomySort] = useState<SortState>({ column: "", direction: null });
  const [bgcsSort, setBgcsSort] = useState<SortState>({ column: "", direction: null });
  const [analysesSort, setAnalysesSort] = useState<SortState>({ column: "bgc_count", direction: "desc" });


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
  const handleBiomesSort = (column: string) => handleSort(column, biomesSort, setBiomesSort);
  const handleGcfsSort = (column: string) => handleSort(column, gcfsSort, setGcfsSort);
  const handleTaxonomySort = (column: string) => handleSort(column, taxonomySort, setTaxonomySort);
  const handleBgcsSort = (column: string) => handleSort(column, bgcsSort, setBgcsSort);
  const handleAnalysesSort = (column: string) => handleSort(column, analysesSort, setAnalysesSort);


  // Page change handlers for each table
  const handleStudiesPageChange = (page: number) => {
    setStudiesData(prev => ({ ...prev, page }));
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

  const handleAnalysesPageChange = (page: number) => {
    setAnalysesData(prev => ({ ...prev, page }));
  };

  // Page size change handlers for each table
  const handleStudiesPageSizeChange = (pageSize: number) => {
    setStudiesData(prev => ({ ...prev, limit: pageSize, page: 1 }));
  };

  const handleBiomesPageSizeChange = (pageSize: number) => {
    setBiomesData(prev => ({ ...prev, limit: pageSize, page: 1 }));
  };

  const handleGcfsPageSizeChange = (pageSize: number) => {
    setGcfData(prev => ({ ...prev, limit: pageSize, page: 1 }));
  };

  const handleTaxonomyPageSizeChange = (pageSize: number) => {
    setTaxonomyData(prev => ({ ...prev, limit: pageSize, page: 1 }));
  };

  const handleBgcsPageSizeChange = (pageSize: number) => {
    setBgcData(prev => ({ ...prev, limit: pageSize, page: 1 }));
  };

  const handleAnalysesPageSizeChange = (pageSize: number) => {
    setAnalysesData(prev => ({ ...prev, limit: pageSize, page: 1 }));
  };

  // Filter change handler
  const handleFiltersChange = useCallback((filters: FilterValue[]) => {
    console.log("[DEBUG_LOG] BrowseClient: Filters changed:", filters);
    setActiveFilters(filters);
    // Reset to first page when filters change
    switch (activeTab) {
      case "studies":
        setStudiesData(prev => ({ ...prev, page: 1 }));
        break;
      case "bgcs":
        setBgcData(prev => ({ ...prev, page: 1 }));
        break;
      case "gcfs":
        setGcfData(prev => ({ ...prev, page: 1 }));
        break;
      case "taxonomy":
        setTaxonomyData(prev => ({ ...prev, page: 1 }));
        break;
      case "biomes":
        setBiomesData(prev => ({ ...prev, page: 1 }));
        break;
      case "analyses":
        setAnalysesData(prev => ({ ...prev, page: 1 }));
        break;
    }
  }, [activeTab]);

  // Server-side sorting is now used, so we don't need to sort the data client-side

  useEffect(() => {
    console.log("[DEBUG_LOG] BrowseClient: useEffect triggered, activeTab:", activeTab);
    
    const fetchData = async () => {
      console.log("[DEBUG_LOG] BrowseClient: fetchData starting for tab:", activeTab);
      try {
        setLoading(true);
        console.log("[DEBUG_LOG] BrowseClient: Loading set to true");

        // Prepare filters parameter
        const filtersParam = activeFilters.length > 0 ? JSON.stringify(activeFilters) : undefined;

        // Only fetch data for the active tab to improve performance
        if (activeTab === "studies") {
          console.log("[DEBUG_LOG] BrowseClient: Fetching studies data");
          const { page, limit } = studiesData;
          const { column, direction } = studiesSort;
          const response = await getStudies({ 
            page, 
            limit,
            sortColumn: column || undefined,
            sortDirection: direction || undefined,
            filters: filtersParam
          });
          console.log("Studies data:", response);
          setStudiesData(prev => ({ ...prev, ...response }));
        } else if (activeTab === "bgcs") {
          console.log("[DEBUG_LOG] BrowseClient: Fetching BGCs data");
          const { page, limit } = bgcData;
          const { column, direction } = bgcsSort;
          const response = await getBgcs({ 
            page, 
            limit,
            sortColumn: column || undefined,
            sortDirection: direction || undefined,
            filters: filtersParam
          });
          console.log("[DEBUG_LOG] BrowseClient: BGCs data received:", response);
          setBgcData(prev => ({ ...prev, ...response }));
        } else if (activeTab === "gcfs") {
          console.log("[DEBUG_LOG] BrowseClient: Fetching GCFs data");
          const { page, limit } = gcfData;
          const { column, direction } = gcfsSort;
          const response = await getGcfs({ 
            page, 
            limit,
            sortColumn: column || undefined,
            sortDirection: direction || undefined,
            filters: filtersParam
          });
          console.log("[DEBUG_LOG] BrowseClient: GCFs data received:", response);
          setGcfData(prev => ({ ...prev, ...response }));
        } else if (activeTab === "taxonomy") {
          console.log("[DEBUG_LOG] BrowseClient: Fetching taxonomy data");
          const { page, limit } = taxonomyData;
          const { column, direction } = taxonomySort;
          const response = await getTaxonomy({ 
            page, 
            limit,
            sortColumn: column || undefined,
            sortDirection: direction || undefined,
            filters: filtersParam
          });
          console.log("[DEBUG_LOG] BrowseClient: Taxonomy data received:", response);
          setTaxonomyData(prev => ({ ...prev, ...response }));
        } else if (activeTab === "biomes") {
          console.log("[DEBUG_LOG] BrowseClient: Fetching biomes data");
          const { page, limit } = biomesData;
          const { column, direction } = biomesSort;
          const response = await getBiomes({ 
            page, 
            limit,
            sortColumn: column || undefined,
            sortDirection: direction || undefined,
            filters: filtersParam
          });
          console.log("[DEBUG_LOG] BrowseClient: Biomes data received:", response);
          setBiomesData(prev => ({ ...prev, ...response }));
        } else if (activeTab === "analyses") {
          console.log("[DEBUG_LOG] BrowseClient: Fetching analyses data");
          const { page, limit } = analysesData;
          const { column, direction } = analysesSort;
          const response = await getAnalyses({ 
            page, 
            limit,
            sortColumn: column || undefined,
            sortDirection: direction || undefined,
            filters: filtersParam
          });
          console.log("[DEBUG_LOG] BrowseClient: Analyses data received:", response);
          setAnalysesData(prev => ({ ...prev, ...response }));
        } else {
          console.log("[DEBUG_LOG] BrowseClient: Unknown activeTab:", activeTab);
        }
      } catch (error) {
        console.error(`[DEBUG_LOG] BrowseClient: Error fetching ${activeTab} data:`, error);
        console.error("[DEBUG_LOG] BrowseClient: Error details:", {
          message: error?.message,
          stack: error?.stack,
          name: error?.name
        });
      } finally {
        console.log("[DEBUG_LOG] BrowseClient: Setting loading to false");
        setLoading(false);
        console.log("[DEBUG_LOG] BrowseClient: fetchData completed for tab:", activeTab);
      }
    };

    console.log("[DEBUG_LOG] BrowseClient: About to call fetchData");
    fetchData();
  }, [activeTab, 
      studiesData.page, studiesData.limit, studiesSort,
      bgcData.page, bgcData.limit, bgcsSort,
      gcfData.page, gcfData.limit, gcfsSort,
      taxonomyData.page, taxonomyData.limit, taxonomySort,
      biomesData.page, biomesData.limit, biomesSort,
      analysesData.page, analysesData.limit, analysesSort,
      activeFilters
  ]);

  const renderEmptyState = (item: string) => (
     <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg">
        <div className="text-5xl text-muted-foreground mb-4">🧬</div>
        <h3 className="text-xl font-semibold">No {item} Found</h3>
        <p className="text-muted-foreground mt-1">No data available at the moment.</p>
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
              sortable: true,
              filterable: false
            },
            {
              key: "product_class",
              label: "Product Class",
              sortable: true,
              filterable: false,
              render: (row) => {
                const text = Array.isArray(row.product_class) ? row.product_class.join(', ') : row.product_class;
                return <TruncatedText text={text} />;
              }
            },
            {
              key: "product_type",
              label: "Product Type",
              sortable: true,
              filterable: false,
              render: (row) => {
                const text = Array.isArray(row.product_type) ? row.product_type.join(', ') : row.product_type;
                return <TruncatedText text={text} />;
              }
            },
            {
              key: "assembly_accession",
              label: "Assembly",
              sortable: true,
              filterable: false
            },
            {
              key: "contig",
              label: "Location",
              sortable: true,
              filterable: false,
              render: (row) => `${row.contig}:${row.start}-${row.end_pos}`
            }
          ]}
          data={bgcData.data}
          total={bgcData.total}
          page={bgcData.page}
          limit={bgcData.limit}
          loading={loading}
          sortState={bgcsSort}
          onSort={handleBgcsSort}
          onPageChange={handleBgcsPageChange}
          onPageSizeChange={handleBgcsPageSizeChange}
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
              sortable: true,
              filterable: false
            },
            {
              key: "bgc_count",
              label: "BGC Count",
              sortable: true,
              filterable: false
            }
          ]}
          data={gcfData.data}
          total={gcfData.total}
          page={gcfData.page}
          limit={gcfData.limit}
          loading={loading}
          sortState={gcfsSort}
          onSort={handleGcfsSort}
          onPageChange={handleGcfsPageChange}
          onPageSizeChange={handleGcfsPageSizeChange}
        />
      </CardContent>
    </Card>
  );


  const renderAnalysesTable = () => (
    <Card>
      <CardContent className="p-0">
        <DataTable
          columns={[
            {
              key: "analysis_id",
              label: "Analysis ID",
              sortable: true,
              filterable: false
            },
            {
              key: "bgc_count",
              label: "BGC Count",
              sortable: true,
              filterable: false,
              render: (row) => row.bgc_count !== undefined ? row.bgc_count : 'N/A'
            },
            {
              key: "latitudes",
              label: "Latitude",
              sortable: true,
              filterable: false,
              render: (row) => {
                const text = row.latitudes && row.latitudes.length > 0 ? row.latitudes.join(', ') : 'N/A';
                return <TruncatedText text={text} />;
              }
            },
            {
              key: "longitudes",
              label: "Longitude",
              sortable: true,
              filterable: false,
              render: (row) => {
                const text = row.longitudes && row.longitudes.length > 0 ? row.longitudes.join(', ') : 'N/A';
                return <TruncatedText text={text} />;
              }
            },
            {
              key: "geo_loc_names",
              label: "Geographic Location",
              sortable: true,
              filterable: false,
              render: (row) => {
                const text = row.geo_loc_names && row.geo_loc_names.length > 0 ? row.geo_loc_names.join(', ') : 'N/A';
                return <TruncatedText text={text} />;
              }
            },
            {
              key: "instrument_platform",
              label: "Instrument Platform",
              sortable: true,
              filterable: false,
              render: (row) => row.instrument_platform || 'N/A'
            },
            {
              key: "sample_names",
              label: "Sample Name",
              sortable: true,
              filterable: false,
              render: (row) => {
                const text = row.sample_names && row.sample_names.length > 0 ? row.sample_names.join(', ') : 'N/A';
                return <TruncatedText text={text} />;
              }
            },
            {
              key: "biosamples",
              label: "Biosample",
              sortable: true,
              filterable: false,
              render: (row) => {
                const text = row.biosamples && row.biosamples.length > 0 ? row.biosamples.join(', ') : 'N/A';
                return <TruncatedText text={text} />;
              }
            },
            {
              key: "environment_biomes",
              label: "Environment Biome",
              sortable: true,
              filterable: false,
              render: (row) => {
                const text = row.environment_biomes && row.environment_biomes.length > 0 ? row.environment_biomes.join(', ') : 'N/A';
                return <TruncatedText text={text} />;
              }
            },
            {
              key: "environment_features",
              label: "Environment Feature",
              sortable: true,
              filterable: false,
              render: (row) => {
                const text = row.environment_features && row.environment_features.length > 0 ? row.environment_features.join(', ') : 'N/A';
                return <TruncatedText text={text} />;
              }
            },
            {
              key: "environment_materials",
              label: "Environment Material",
              sortable: true,
              filterable: false,
              render: (row) => {
                const text = row.environment_materials && row.environment_materials.length > 0 ? row.environment_materials.join(', ') : 'N/A';
                return <TruncatedText text={text} />;
              }
            },
            {
              key: "host_tax_ids",
              label: "Host Tax ID",
              sortable: true,
              filterable: false,
              render: (row) => row.host_tax_ids && row.host_tax_ids.length > 0 ? row.host_tax_ids.join(', ') : 'N/A'
            },
            {
              key: "species",
              label: "Species",
              sortable: true,
              filterable: false,
              render: (row) => {
                const text = row.species && row.species.length > 0 ? row.species.join(', ') : 'N/A';
                return <TruncatedText text={text} />;
              }
            },
            {
              key: "study_names",
              label: "Study Name",
              sortable: true,
              filterable: false,
              render: (row) => {
                const text = row.study_names && row.study_names.length > 0 ? row.study_names.join(', ') : 'N/A';
                return <TruncatedText text={text} />;
              }
            },
            {
              key: "study_accessions",
              label: "Study Accession",
              sortable: true,
              filterable: false,
              render: (row) => {
                const text = row.study_accessions && row.study_accessions.length > 0 ? row.study_accessions.join(', ') : 'N/A';
                return <TruncatedText text={text} />;
              }
            },
            {
              key: "bioprojects",
              label: "Bioproject",
              sortable: true,
              filterable: false,
              render: (row) => {
                const text = row.bioprojects && row.bioprojects.length > 0 ? row.bioprojects.join(', ') : 'N/A';
                return <TruncatedText text={text} />;
              }
            },
            {
              key: "biome_lineages",
              label: "Biome Lineage",
              sortable: true,
              filterable: false,
              render: (row) => {
                let text = 'N/A';
                if (row.biome_lineages && row.biome_lineages.length > 0) {
                  // Remove "root:" prefix from each biome lineage
                  const cleanedLineages = row.biome_lineages.map((lineage) => 
                    lineage.startsWith('root:') ? lineage.substring(5) : lineage
                  );
                  text = cleanedLineages.join(', ');
                }
                return <TruncatedText text={text} />;
              }
            },
            {
              key: "publication_dois",
              label: "Publications",
              sortable: true,
              filterable: false,
              render: (row) => {
                let text;
                if (row.publication_dois && row.publication_dois.length > 0) {
                  text = row.publication_dois.join(', ');
                } else if (row.publications) {
                  text = row.publications;
                } else {
                  text = 'N/A';
                }
                return <TruncatedText text={text} />;
              }
            },
            {
              key: "publication_titles",
              label: "Study Publications",
              sortable: true,
              filterable: false,
              render: (row) => {
                let text;
                if (row.publication_titles && row.publication_titles.length > 0) {
                  text = row.publication_titles.join(', ');
                } else if (row.study_publications) {
                  // Remove parentheses from DOIs
                  text = row.study_publications.replace(/\(([^)]+)\)/g, '$1');
                } else {
                  text = 'N/A';
                }
                return <TruncatedText text={text} />;
              }
            }
          ]}
          data={analysesData.data}
          total={analysesData.total}
          page={analysesData.page}
          limit={analysesData.limit}
          loading={loading}
          sortState={analysesSort}
          onSort={handleAnalysesSort}
          onPageChange={handleAnalysesPageChange}
          onPageSizeChange={handleAnalysesPageSizeChange}
        />
      </CardContent>
    </Card>
  );

  console.log("[DEBUG_LOG] BrowseClient: About to render UI, loading:", loading, "activeTab:", activeTab);
  console.log("[DEBUG_LOG] BrowseClient: Current data counts:", {
    studies: studiesData.data.length,
    bgcs: bgcData.data.length,
    gcfs: gcfData.data.length,
    taxonomy: taxonomyData.data.length,
    biomes: biomesData.data.length,
    analyses: analysesData.data.length
  });

  return (
    <div className="grid grid-cols-1 gap-8">
      <main className="col-span-1">
        {/* Filter Menu */}
        <FilterMenu
          activeTable={activeTab}
          filters={[]}
          onFiltersChange={handleFiltersChange}
          className="mb-6"
        />
        
        <Tabs defaultValue="analyses" value={activeTab} onValueChange={(newTab) => {
          setActiveTab(newTab);
          // Clear filters when switching tabs
          setActiveFilters([]);
        }}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="analyses">Analyses</TabsTrigger>
            <TabsTrigger value="studies">Studies</TabsTrigger>
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
                        sortable: true,
                        filterable: false
                      },
                      {
                        key: "study_name",
                        label: "Name",
                        sortable: true,
                        filterable: false,
                        render: (row) => <TruncatedText text={row.study_name || 'N/A'} />
                      },
                      {
                        key: "bioproject",
                        label: "Bioproject",
                        sortable: true,
                        filterable: false,
                        render: (row) => row.bioproject || 'N/A'
                      },
                      {
                        key: "public_release_date",
                        label: "Release Date",
                        sortable: true,
                        filterable: false,
                        render: (row) => row.public_release_date ? new Date(row.public_release_date).toLocaleDateString() : 'N/A'
                      },
                      {
                        key: "bgc_count",
                        label: "BGC Count",
                        sortable: true,
                        filterable: false,
                        render: (row) => row.bgc_count || 0
                      }
                    ]}
                    data={studiesData.data}
                    total={studiesData.total}
                    page={studiesData.page}
                    limit={studiesData.limit}
                    loading={loading}
                    sortState={studiesSort}
                    onSort={handleStudiesSort}
                    onPageChange={handleStudiesPageChange}
                    onPageSizeChange={handleStudiesPageSizeChange}
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
                        key: "lineage",
                        label: "Lineage",
                        sortable: true,
                        filterable: false,
                        render: (row) => {
                          const lineage = row.lineage || 'N/A';
                          const displayText = lineage.startsWith('root:') ? lineage.substring(5) : lineage;
                          return <TruncatedText text={displayText} />;
                        }
                      },
                      {
                        key: "bgc_count",
                        label: "BGC Count",
                        sortable: true,
                        filterable: false,
                        render: (row) => row.bgc_count || 0
                      }
                    ]}
                    data={biomesData.data}
                    total={biomesData.total}
                    page={biomesData.page}
                    limit={biomesData.limit}
                    loading={loading}
                    sortState={biomesSort}
                    onSort={handleBiomesSort}
                    onPageChange={handleBiomesPageChange}
                    onPageSizeChange={handleBiomesPageSizeChange}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="analyses" className="mt-6">
            {analysesData.data.length === 0 && !loading ? renderEmptyState("Analyses") : renderAnalysesTable()}
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
