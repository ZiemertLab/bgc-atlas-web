import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";

export default function SampleDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
       <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground mb-8">
        Sample: {params.id}
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="w-full aspect-square relative rounded-lg overflow-hidden border">
                         <Image src="https://placehold.co/600x600" alt="Map pin" layout="fill" objectFit="cover" data-ai-hint="map satellite" />
                         <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <p className="text-lg font-bold text-primary-foreground bg-primary/80 px-4 py-2 rounded">Placeholder Map</p>
                         </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                    <p><span className="font-semibold text-muted-foreground">Coordinates:</span> 34.0522° N, 118.2437° W</p>
                    <p><span className="font-semibold text-muted-foreground">Collection Date:</span> 2023-08-15</p>
                    <p><span className="font-semibold text-muted-foreground">Environment-Biome:</span> Terrestrial, Soil</p>
                    <p><span className="font-semibold text-muted-foreground">Depth:</span> 15 cm</p>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card>
                 <CardHeader>
                    <CardTitle>BGCs in this Sample</CardTitle>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>BGC ID</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Length</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({length: 8}).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium hover:underline cursor-pointer">BGC000{1234+i}</TableCell>
                                    <TableCell>NRPS</TableCell>
                                    <TableCell>{(Math.random() * 30000 + 10000).toFixed(0)} bp</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                     </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
