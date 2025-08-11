import { BrowseClient } from "./components/browse-client";

export default function BrowsePage() {
  console.log("[DEBUG_LOG] BrowsePage: Component is rendering");
  
  try {
    console.log("[DEBUG_LOG] BrowsePage: About to render BrowseClient");
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
          Browse Database
        </h1>
        <p className="mt-2 text-muted-foreground">
          Explore BGCs, GCFs, Samples, and Taxonomy. Use the filters to narrow down your search.
        </p>
        <div className="mt-8">
          <BrowseClient />
        </div>
      </div>
    );
  } catch (error) {
    console.error("[DEBUG_LOG] BrowsePage: Error during rendering:", error);
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-red-600">Error loading browse page</h1>
        <p>Check console for details</p>
      </div>
    );
  }
}
