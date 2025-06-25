import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const chartData = [
  { name: 'Soil', count: 450 },
  { name: 'Marine', count: 210 },
  { name: 'Host', count: 150 },
  { name: 'Freshwater', count: 80 },
];

export default function TaxonDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="#">Bacteria</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink href="#">Actinobacteria</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink href="#">Streptomycetales</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
                <span className="font-semibold text-foreground">
                    Streptomyces
                </span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground mt-4">
          Taxon: <i className="capitalize">{params.id}</i>
        </h1>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>BGC Counts per Biome</CardTitle>
        </CardHeader>
        <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
         <CardHeader>
            <CardTitle>Enriched GCFs</CardTitle>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>GCF ID</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Enrichment Score</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({length: 5}).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell className="font-medium hover:underline cursor-pointer">GCF_00{567+i}</TableCell>
                            <TableCell>Type I PKS for polyene macrolide</TableCell>
                            <TableCell>{(Math.random() * 10 + 2).toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
             </Table>
        </CardContent>
      </Card>
    </div>
  );
}
