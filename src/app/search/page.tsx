import { SearchClient } from "./components/search-client";

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
        Advanced Search
      </h1>
      <p className="mt-2 text-muted-foreground">
        Search by metadata or submit a FASTA sequence to find matching entries.
      </p>
      <div className="mt-8">
        <SearchClient />
      </div>
    </div>
  );
}
