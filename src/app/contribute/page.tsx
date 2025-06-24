import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export default function ContributePage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
        Contribute to BGC-Atlas
      </h1>
      
      <section className="mt-8">
        <h2 className="font-headline text-2xl font-bold">Guidelines</h2>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          We welcome contributions from the community. You can contribute by reporting issues, suggesting features, or submitting your own annotated BGC data. Please visit our GitHub repository to see open issues and our contribution guidelines.
        </p>
        <Button variant="outline" className="mt-4" asChild>
            <a href="#" target="_blank" rel="noopener noreferrer">View on GitHub</a>
        </Button>
      </section>

      <Separator className="my-8" />
      
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Data Submission Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input id="name" placeholder="Dr. Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Your Email</Label>
                <Input id="email" type="email" placeholder="jane.doe@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="institution">Institution</Label>
                <Input id="institution" placeholder="University of Science" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data-type">Data Type</Label>
                <Select>
                    <SelectTrigger id="data-type">
                        <SelectValue placeholder="Select data type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="bgc">Annotated BGC (GenBank)</SelectItem>
                        <SelectItem value="sample">Sample Metadata (TSV)</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="col-span-full space-y-2">
                <Label htmlFor="data-file">Data File</Label>
                <Input id="data-file" type="file" />
              </div>
               <div className="col-span-full space-y-2">
                <Label htmlFor="comments">Comments</Label>
                <Textarea id="comments" placeholder="Provide any additional details about your submission..." />
              </div>
              <div className="col-span-full">
                <Button type="submit">Submit Data</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
