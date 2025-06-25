import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const tocItems = [
    { title: "Introduction", href: "#introduction" },
    { title: "API Access", href: "#api-access" },
    { title: "Authentication", href: "#authentication" },
    { title: "Endpoints", href: "#endpoints", subItems: [
        { title: "BGC Search", href: "#bgc-search" },
        { title: "GCF Search", href: "#gcf-search" },
    ]},
    { title: "Data Model", href: "#data-model" },
    { title: "Versioning", href: "#versioning" },
]

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
        Documentation
      </h1>
      <p className="mt-2 text-muted-foreground">
        Learn how to use the BGC-Atlas API and understand our data.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
        <aside className="col-span-1">
            <Card className="sticky top-24">
                <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">On this page</h3>
                    <ul className="space-y-2 text-sm">
                        {tocItems.map(item => (
                            <li key={item.href}>
                                <Link href={item.href} className="text-muted-foreground hover:text-primary">{item.title}</Link>
                                {item.subItems && (
                                    <ul className="pl-4 mt-2 space-y-2 border-l">
                                        {item.subItems.map(subItem => (
                                            <li key={subItem.href}>
                                                 <Link href={subItem.href} className="text-muted-foreground hover:text-primary">{subItem.title}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </aside>
        <main className="col-span-1 lg:col-span-3">
           <article className="prose dark:prose-invert max-w-none">
                <section id="introduction">
                    <h2 className="font-headline text-2xl font-bold">Introduction</h2>
                    <p>Welcome to the BGC-Atlas documentation. This resource provides all the information you need to interact with our database programmatically.</p>
                </section>
                <Separator className="my-8" />
                <section id="api-access">
                    <h2 className="font-headline text-2xl font-bold">API Access</h2>
                    <p>The base URL for all API endpoints is:</p>
                    <pre className="bg-secondary p-4 rounded-md font-code"><code>https://api.bgc-atlas.org/v1</code></pre>
                </section>
                <Separator className="my-8" />
                <section id="authentication">
                    <h2 className="font-headline text-2xl font-bold">Authentication</h2>
                    <p>Currently, the API is open and does not require authentication for read-only access. This may change in the future.</p>
                </section>
           </article>
        </main>
      </div>
    </div>
  );
}
