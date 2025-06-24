import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const downloadFiles = [
  { name: "BGC Data (Full)", format: "JSON", size: "12.5 GB", md5: "a1b2c3d4e5f6...", date: "2024-05-10" },
  { name: "GCF Data (Full)", format: "JSON", size: "2.1 GB", md5: "b2c3d4e5f6a1...", date: "2024-05-10" },
  { name: "Sample Metadata", format: "TSV", size: "512 MB", md5: "c3d4e5f6a1b2...", date: "2024-05-10" },
  { name: "Taxonomy Data", format: "TSV", size: "128 MB", md5: "d4e5f6a1b2c3...", date: "2024-05-10" },
  { name: "All BGC Sequences", format: "FASTA.gz", size: "55.2 GB", md5: "e5f6a1b2c3d4...", date: "2024-05-01" },
];

export default function DownloadsPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
        Downloads
      </h1>
      <p className="mt-2 text-muted-foreground">
        Download bulk data from the BGC-Atlas database.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Data Dumps</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>MD5</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {downloadFiles.map((file) => (
                <TableRow key={file.name}>
                  <TableCell className="font-medium">{file.name}</TableCell>
                  <TableCell>{file.format}</TableCell>
                  <TableCell>{file.size}</TableCell>
                  <TableCell className="font-code">{file.md5}</TableCell>
                  <TableCell>{file.date}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
