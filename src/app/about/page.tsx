import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

const teamMembers = [
  { name: "Dr. Evelyn Reed", role: "Project Lead & PI", avatar: "/avatars/01.png", initial: "ER" },
  { name: "Dr. Kenji Tanaka", role: "Bioinformatics Lead", avatar: "/avatars/02.png", initial: "KT" },
  { name: "Maria Garcia", role: "Lead Software Engineer", avatar: "/avatars/03.png", initial: "MG" },
  { name: "Chao Li", role: "Data Scientist", avatar: "/avatars/04.png", initial: "CL" },
];

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
        <h2 className="font-headline text-2xl font-bold">Our Mission</h2>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          BGC-Atlas is dedicated to providing a centralized, open-science resource for the scientific community to explore the vast world of biosynthetic gene clusters (BGCs). Our goal is to facilitate discovery by linking genomic data with rich metadata, enabling researchers to uncover novel natural products and understand their ecological roles.
        </p>
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="font-headline text-2xl font-bold">The Team</h2>
        <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member) => (
            <Card key={member.name} className="text-center">
              <CardContent className="p-6">
                <Avatar className="mx-auto h-24 w-24">
                  <AvatarImage src={`https://placehold.co/100x100.png`} alt={member.name} data-ai-hint="professional portrait" />
                  <AvatarFallback>{member.initial}</AvatarFallback>
                </Avatar>
                <h3 className="mt-4 text-lg font-semibold">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
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
            <Image src="https://placehold.co/150x60" width={150} height={60} alt="Funder Logo 1" data-ai-hint="research funding" />
            <Image src="https://placehold.co/150x60" width={150} height={60} alt="Funder Logo 2" data-ai-hint="university logo" />
            <Image src="https://placehold.co/150x60" width={150} height={60} alt="Funder Logo 3" data-ai-hint="science foundation" />
        </div>
      </section>
    </div>
  );
}
