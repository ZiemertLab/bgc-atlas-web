"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getBatchFilterOptions } from "@/services/api";

// Filter types
export type FilterType = "text" | "number" | "range" | "select" | "multiselect" | "boolean" | "date";

export interface FilterConfig {
  key: string;
  label: string;
  type: FilterType;
  options?: string[]; // Static options
  dynamicOptions?: boolean; // Flag for dynamic options
  placeholder?: string;
}

export interface FilterValue {
  key: string;
  value: any;
  label: string;
}

interface FilterMenuProps {
  activeTable: string;
  filters: FilterConfig[];
  onFiltersChange: (filters: FilterValue[]) => void;
  className?: string;
}

// Define filter configurations for each table
const TABLE_FILTERS: Record<string, FilterConfig[]> = {
  analyses: [
    { key: "analysis_id", label: "Analysis ID", type: "text", placeholder: "Search by analysis ID..." },
    { key: "bgc_count", label: "BGC Count", type: "range", placeholder: "Min - Max" },
    { key: "latitudes", label: "Latitude", type: "range", placeholder: "Min - Max" },
    { key: "longitudes", label: "Longitude", type: "range", placeholder: "Min - Max" },
    { key: "sample_names", label: "Sample Name", type: "text", placeholder: "Search sample name..." },
    { key: "biosamples", label: "BioSample", type: "text", placeholder: "Search biosample..." },
    { key: "environment_features", label: "Environment Feature", type: "text", placeholder: "Search environment feature..." },
    { key: "environment_materials", label: "Environment Material", type: "text", placeholder: "Search environment material..." },
    { key: "geo_loc_names", label: "Geographic Location", type: "text", placeholder: "Search location..." },
    { key: "instrument_platform", label: "Instrument Platform", type: "select", dynamicOptions: true },
    { key: "environment_biomes", label: "Environment Biome", type: "multiselect", dynamicOptions: true },
    { key: "species", label: "Species", type: "multiselect", dynamicOptions: true },
    { key: "study_names", label: "Study Name", type: "text", placeholder: "Search study..." },
  ],
  studies: [
    { key: "accession", label: "Accession", type: "text", placeholder: "Search accession..." },
    { key: "study_name", label: "Study Name", type: "text", placeholder: "Search study name..." },
    { key: "bioproject", label: "Bioproject", type: "select", dynamicOptions: true },
    { key: "bgc_count", label: "BGC Count", type: "range", placeholder: "Min - Max" },
  ],
  bgcs: [
    { key: "id", label: "BGC ID", type: "text", placeholder: "Search BGC ID..." },
    { key: "product_class", label: "Product Class", type: "multiselect", dynamicOptions: true },
    { key: "product_type", label: "Product Type", type: "multiselect", dynamicOptions: true },
    { key: "assembly_accession", label: "Assembly", type: "text", placeholder: "Search assembly..." },
    { key: "contig", label: "Contig", type: "text", placeholder: "Search contig..." },
    { key: "is_complete", label: "Complete BGC", type: "boolean" },
  ],
  gcfs: [
    { key: "id", label: "GCF ID", type: "text", placeholder: "Search GCF ID..." },
    { key: "bgc_count", label: "BGC Count", type: "range", placeholder: "Min - Max" },
  ],
  taxonomy: [
    { key: "tax_id", label: "Taxonomy ID", type: "text", placeholder: "Search taxonomy ID..." },
    { key: "species", label: "Species", type: "multiselect", dynamicOptions: true },
    { key: "genus", label: "Genus", type: "text", placeholder: "Search genus..." },
    { key: "family", label: "Family", type: "text", placeholder: "Search family..." },
  ],
  biomes: [
    { key: "lineage", label: "Lineage", type: "select", dynamicOptions: true },
    { key: "bgc_count", label: "BGC Count", type: "range", placeholder: "Min - Max" },
  ],
};

export function FilterMenu({ activeTable, filters, onFiltersChange, className }: FilterMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterValue[]>([]); // Applied filters
  const [draftFilters, setDraftFilters] = useState<FilterValue[]>([]); // Draft/pending filters
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, string[]>>({});
  const [loadingOptions, setLoadingOptions] = useState<Record<string, boolean>>({});

  // Load dynamic options when table changes
  useEffect(() => {
    const loadDynamicOptions = async () => {
      const currentFilters = TABLE_FILTERS[activeTable] || [];
      const dynamicFilters = currentFilters.filter(f => f.dynamicOptions);
      
      if (dynamicFilters.length === 0) return;
      
      // Set loading state
      const loadingState: Record<string, boolean> = {};
      dynamicFilters.forEach(f => {
        loadingState[f.key] = true;
      });
      setLoadingOptions(loadingState);
      
      try {
        // Batch load all dynamic options for this table
        const requests = dynamicFilters.map(f => ({
          table: activeTable,
          column: f.key
        }));
        
        const results = await getBatchFilterOptions(requests);
        
        // Update options state
        const newOptions: Record<string, string[]> = {};
        dynamicFilters.forEach(f => {
          const key = `${activeTable}.${f.key}`;
          newOptions[f.key] = results[key] || [];
        });
        
        setDynamicOptions(newOptions);
        
      } catch (error) {
        console.error('Error loading dynamic filter options:', error);
        // Set empty arrays as fallback
        const fallbackOptions: Record<string, string[]> = {};
        dynamicFilters.forEach(f => {
          fallbackOptions[f.key] = [];
        });
        setDynamicOptions(fallbackOptions);
      } finally {
        // Clear loading state
        setLoadingOptions({});
      }
    };
    
    loadDynamicOptions();
  }, [activeTable]);

  // Clear filters when activeTable changes (tab switch)
  useEffect(() => {
    setActiveFilters([]);
    setDraftFilters([]);
    onFiltersChange([]);
  }, [activeTable, onFiltersChange]);

  // Get filters for the current table
  const currentFilters = TABLE_FILTERS[activeTable] || [];

  // Get options for a filter (static or dynamic)
  const getFilterOptions = (filter: FilterConfig): string[] => {
    let options: string[] = [];
    if (filter.dynamicOptions) {
      options = dynamicOptions[filter.key] || [];
    } else {
      options = filter.options || [];
    }
    // Filter out empty strings to prevent SelectItem errors
    return options.filter(option => option && option.trim() !== '');
  };

  // Check if options are loading
  const isOptionsLoading = (filter: FilterConfig): boolean => {
    return filter.dynamicOptions && loadingOptions[filter.key];
  };

  const handleFilterChange = (filterKey: string, value: any, label: string) => {
    const newFilters = draftFilters.filter(f => f.key !== filterKey);
    
    if (value !== null && value !== undefined && value !== "" && 
        !(Array.isArray(value) && value.length === 0)) {
      newFilters.push({ key: filterKey, value, label });
    }
    
    setDraftFilters(newFilters);
    // Don't call onFiltersChange here - only when Filter button is clicked
  };

  const applyFilters = () => {
    setActiveFilters(draftFilters);
    onFiltersChange(draftFilters);
  };

  const resetFilters = () => {
    setActiveFilters([]);
    setDraftFilters([]);
    onFiltersChange([]);
  };

  const clearFilter = (filterKey: string) => {
    const newActiveFilters = activeFilters.filter(f => f.key !== filterKey);
    const newDraftFilters = draftFilters.filter(f => f.key !== filterKey);
    setActiveFilters(newActiveFilters);
    setDraftFilters(newDraftFilters);
    onFiltersChange(newActiveFilters);
  };

  const renderFilterInput = (filter: FilterConfig) => {
    const currentValue = draftFilters.find(f => f.key === filter.key)?.value;
    const options = getFilterOptions(filter);
    const loading = isOptionsLoading(filter);

    switch (filter.type) {
      case "text":
        return (
          <Input
            placeholder={filter.placeholder}
            value={currentValue || ""}
            onChange={(e) => handleFilterChange(filter.key, e.target.value, `${filter.label}: ${e.target.value}`)}
            className="w-full"
          />
        );

      case "range":
        return (
          <div className="flex gap-2">
            <Input
              placeholder="Min"
              type="number"
              value={currentValue?.min || ""}
              onChange={(e) => {
                const newValue = { ...currentValue, min: e.target.value };
                const label = `${filter.label}: ${newValue.min || "∞"} - ${newValue.max || "∞"}`;
                handleFilterChange(filter.key, newValue, label);
              }}
              className="flex-1"
            />
            <Input
              placeholder="Max"
              type="number"
              value={currentValue?.max || ""}
              onChange={(e) => {
                const newValue = { ...currentValue, max: e.target.value };
                const label = `${filter.label}: ${newValue.min || "∞"} - ${newValue.max || "∞"}`;
                handleFilterChange(filter.key, newValue, label);
              }}
              className="flex-1"
            />
          </div>
        );

      case "select":
        return (
          <Select
            value={currentValue || ""}
            onValueChange={(value) => handleFilterChange(filter.key, value, `${filter.label}: ${value}`)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                loading 
                  ? "Loading options..." 
                  : `Select ${filter.label.toLowerCase()}...`
              } />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : (
                options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        );

      case "multiselect":
        return (
          <div className="space-y-2">
            <Select
              onValueChange={(value) => {
                const current = currentValue || [];
                if (!current.includes(value)) {
                  const newValue = [...current, value];
                  handleFilterChange(filter.key, newValue, `${filter.label}: ${newValue.join(", ")}`);
                }
              }}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  loading 
                    ? "Loading options..." 
                    : `Add ${filter.label.toLowerCase()}...`
                } />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : (
                  options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {currentValue && currentValue.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {currentValue.map((item: string) => (
                  <Badge key={item} variant="secondary" className="text-xs">
                    {item}
                    <button
                      onClick={() => {
                        const newValue = currentValue.filter((v: string) => v !== item);
                        if (newValue.length > 0) {
                          handleFilterChange(filter.key, newValue, `${filter.label}: ${newValue.join(", ")}`);
                        } else {
                          clearFilter(filter.key);
                        }
                      }}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );

      case "boolean":
        return (
          <Select
            value={currentValue?.toString() || "all"}
            onValueChange={(value) => {
              if (value === "all") {
                clearFilter(filter.key);
              } else {
                const boolValue = value === "true";
                handleFilterChange(filter.key, boolValue, `${filter.label}: ${boolValue ? "Yes" : "No"}`);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        );

      case "date":
        return (
          <div className="flex gap-2">
            <Input
              type="date"
              value={currentValue?.from || ""}
              onChange={(e) => {
                const newValue = { ...currentValue, from: e.target.value };
                const label = `${filter.label}: ${newValue.from || "∞"} - ${newValue.to || "∞"}`;
                handleFilterChange(filter.key, newValue, label);
              }}
              className="flex-1"
            />
            <Input
              type="date"
              value={currentValue?.to || ""}
              onChange={(e) => {
                const newValue = { ...currentValue, to: e.target.value };
                const label = `${filter.label}: ${newValue.from || "∞"} - ${newValue.to || "∞"}`;
                handleFilterChange(filter.key, newValue, label);
              }}
              className="flex-1"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardHeader 
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-lg">Filters</CardTitle>
            {activeFilters.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilters.length}
              </Badge>
            )}
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="pt-0">
          {/* Active filters display */}
          {activeFilters.length > 0 && (
            <div className="mb-4 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Active Filters:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-6 px-2 text-xs"
                >
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {activeFilters.map((filter) => (
                  <Badge key={filter.key} variant="default" className="text-xs">
                    {filter.label}
                    <button
                      onClick={() => clearFilter(filter.key)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Filter inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentFilters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <Label htmlFor={filter.key} className="text-sm font-medium">
                  {filter.label}
                </Label>
                {renderFilterInput(filter)}
              </div>
            ))}
          </div>

          {/* Filter action buttons */}
          {currentFilters.length > 0 && (
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Button 
                onClick={applyFilters}
                className="flex-1"
                disabled={draftFilters.length === 0}
              >
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
              <Button 
                onClick={resetFilters}
                variant="outline"
                className="flex-1"
              >
                Reset
              </Button>
            </div>
          )}

          {currentFilters.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No filters available for this table</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}