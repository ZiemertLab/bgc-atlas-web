import { Separator } from "@/components/ui/separator";

export default function ImprintPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
        Impressum
      </h1>
      
      <section className="mt-8">
        <h2 className="font-headline text-2xl font-bold">General information according to § 5 TMG, § 55 RStVG</h2>
        
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse border border-border">
            <tbody>
              <tr>
                <td className="border border-border p-4 font-semibold bg-muted/50">Address:</td>
                <td className="border border-border p-4">
                  University of Tübingen<br />
                  Geschwister-Scholl-Platz<br />
                  72074 Tübingen
                </td>
              </tr>
              <tr>
                <td className="border border-border p-4 font-semibold bg-muted/50"></td>
                <td className="border border-border p-4">
                  The University of Tübingen is a corporation under public law. Its legal representative is the President and Vice-Chancellor, Professor Dr. Dr. h.c. (Dōshisha) Karla Pollmann (E-Mail: rektorin@uni-tuebingen.de).
                </td>
              </tr>
              <tr>
                <td className="border border-border p-4 font-semibold bg-muted/50">Central phone no:</td>
                <td className="border border-border p-4">+49 (0) 70 71/29-0</td>
              </tr>
              <tr>
                <td className="border border-border p-4 font-semibold bg-muted/50">Central Administration fax no:</td>
                <td className="border border-border p-4">+49 (0) 70 71/29-59 90</td>
              </tr>
              <tr>
                <td className="border border-border p-4 font-semibold bg-muted/50">Central e-mail address:</td>
                <td className="border border-border p-4">info@uni-tuebingen.de</td>
              </tr>
              <tr>
                <td className="border border-border p-4 font-semibold bg-muted/50">Internet address:</td>
                <td className="border border-border p-4">
                  <a href="https://uni-tuebingen.de" className="text-primary hover:underline">
                    https://uni-tuebingen.de
                  </a>
                </td>
              </tr>
              <tr>
                <td className="border border-border p-4 font-semibold bg-muted/50">Value added tax ID no.:</td>
                <td className="border border-border p-4">
                  according to § 27 a Umsatzsteuergesetz:<br />
                  <strong>DE812383453</strong>
                </td>
              </tr>
              <tr>
                <td className="border border-border p-4 font-semibold bg-muted/50">Supervisory authority</td>
                <td className="border border-border p-4">
                  Baden-Württemberg Ministry of Science, Research and the Arts<br />
                  Königstraße 46 a<br />
                  70173 Stuttgart<br />
                  Website: <a href="https://mwk.baden-wuerttemberg.de/de/startseite/" className="text-primary hover:underline">
                    https://mwk.baden-wuerttemberg.de/de/startseite/
                  </a>
                </td>
              </tr>
              <tr>
                <td className="border border-border p-4 font-semibold bg-muted/50">Last Updated:</td>
                <td className="border border-border p-4">22.03.2024</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="font-headline text-2xl font-bold">External Links</h2>
        <div className="mt-4 space-y-4 text-muted-foreground">
          <p>
            This University of Tübingen website also contains appropriately marked links and references to third-party websites. Via any such link, the University of Tübingen merely provides access to the content. This does not imply any approval of the contents of the linked third-party sites. The University of Tübingen therefore accepts no responsibility for the availability or content of such websites and no liability for damage or injury resulting from the use – in whatever form – of such content. The provider of the respective site is solely liable for this.
          </p>
          <p>
            When linking to another website for the first time, the editorial team checked the content of that website to see whether it might give rise to any civil or criminal liability. However, it is unfortunately not possible to check content subsequently included there. The link will be removed immediately as soon as the editors notice or are informed by others that a certain site, to which a link has been provided, gives rise to civil or criminal liability.
          </p>
        </div>
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="font-headline text-2xl font-bold">Copyright</h2>
        <div className="mt-4 space-y-4 text-muted-foreground">
          <p>Copyright (c). All rights reserved.</p>
          <p>
            All content published on this website (layout, text, images, graphics, video and sound files, etc.) is subject to copyright. Any use not permitted by copyright law requires the prior express consent of the Translational Genome Mining for Natural Products research group. This applies in particular to the copying, editing, translation, storage, processing and reproduction of content in databases or other electronic media or systems. Photocopies and downloads of web pages for private, academic and non-commercial use are permitted.
          </p>
          <p>
            The copyright for the University of Tübingen logo is expressly held by the University of Tübingen.
          </p>
          <p>
            We expressly permit and welcome the citation of our documents and web pages as well as the setting of links to our website.
          </p>
        </div>
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="font-headline text-2xl font-bold">Disclaimer</h2>
        <div className="mt-4 space-y-4 text-muted-foreground">
          <p>
            The information on this website has been carefully compiled and checked to the best of our knowledge and belief. However, no guarantee – neither explicit nor implicit – is given for the completeness, correctness or topicality nor of the availability of the information provided at any time. Liability for damages resulting from the use or non-use of the information provided on this website is – as far as legally permissible – excluded.
          </p>
        </div>
      </section>

      <Separator className="my-8" />

      <section>
        <h3 className="font-headline text-xl font-bold">Responsible</h3>
        <div className="mt-4 text-muted-foreground">
          <p>
            Prof. Dr. Nadine Ziemert<br />
            Auf der Morgenstelle 24<br />
            72076 Tübingen<br />
            Phone: +49 7071 29788441<br />
            E-Mail: nadine.ziemert@uni-tuebingen.de
          </p>
        </div>
      </section>
    </div>
  );
}