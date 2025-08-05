import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";


const changelog = [
    { version: "v1.0.0", date: "May 2024", changes: ["Initial launch of BGC-Atlas.", "Core browsing and search functionalities implemented."] },
    { version: "v0.9.0", date: "April 2024", changes: ["Beta testing phase.", "API documentation added."] },
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
        About BGC-Atlas
      </h1>
      
      <section className="mt-8">
        <h2 className="font-headline text-2xl font-bold">About</h2>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          BGC-Atlas is dedicated to providing a centralized, open-science resource for the scientific community to explore the vast world of biosynthetic gene clusters (BGCs). Our goal is to facilitate discovery by linking genomic data with rich metadata, enabling researchers to uncover novel natural products and understand their ecological roles.
        </p>
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="font-headline text-2xl font-bold">Changelog</h2>
        <Accordion type="single" collapsible className="w-full mt-4">
          {changelog.map(item => (
            <AccordionItem value={item.version} key={item.version}>
                <AccordionTrigger>{item.version} - {item.date}</AccordionTrigger>
                <AccordionContent>
                    <ul className="list-disc pl-6 space-y-1">
                        {item.changes.map((change, index) => <li key={index}>{change}</li>)}
                    </ul>
                </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <Separator className="my-8" />

       <section>
        <h2 className="font-headline text-2xl font-bold">Funding & Acknowledgements</h2>
        <div className="mt-6 flex flex-wrap items-center gap-8">
            <div className="px-4 py-2 bg-muted rounded-lg">
              <span className="font-semibold text-lg">DZIF</span>
            </div>
            <div className="px-4 py-2 bg-muted rounded-lg">
              <span className="font-semibold text-lg">CMFI</span>
            </div>
        </div>
      </section>
    </div>
  );
}
