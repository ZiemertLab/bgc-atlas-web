import { Separator } from "@/components/ui/separator";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
        Privacy Policy
      </h1>
      
      <section className="mt-8">
        <div className="space-y-4 text-muted-foreground">
          <p>
            Our services are provided by the University of Tübingen, Geschwister-Scholl-Platz, 72074 Tübingen, Germany. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
          </p>
        </div>
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="font-headline text-2xl font-bold">What data do we collect?</h2>
        <div className="mt-4 space-y-4 text-muted-foreground">
          <p>
            We collect several different types of information for various purposes to provide and improve our Service to you.
          </p>
          <p>
            <strong>Personal Information Provided by You.</strong> We collect information that you provide to us when you use our services, or when you contact us. This information may include the following:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Email addresses. We collect email addresses when you submit jobs through our webservices in order to inform you about the status of your job.</li>
          </ul>
          <p>
            We do not collect or store any other personal information including sensitive information.
          </p>
          <p>
            <strong>Information automatically collected.</strong> We automatically collect certain information when you visit, use or navigate the website. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our website and other technical information. This information is primarily needed to maintain the security and operation of our website, and for our internal analytics and reporting purposes. This information is not shared with third parties. This information may include the following:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Log and Usage Data. Log and usage data is service-related, diagnostic usage and performance information our servers automatically collect when you access or use our website and which we record in log files. Depending on how you interact with us, this log data may include your IP address, device information, browser type and settings and information about your activity in the website (such as the date/time stamps associated with your usage, pages and files viewed, searches and other actions you take such as which features you use), device event information (such as system activity, error reports (sometimes called 'crash dumps') and hardware settings).</li>
          </ul>
        </div>
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="font-headline text-2xl font-bold">How will we use your data?</h2>
        <div className="mt-4 space-y-4 text-muted-foreground">
          <p>We use the information we collect or receive:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Email you about the status of your job submission(s).</li>
            <li>To provide and maintain our Service, including to monitor the usage of our Service.</li>
          </ul>
          <p>We do not share your personal information with third parties.</p>
        </div>
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="font-headline text-2xl font-bold">How do we store your data?</h2>
        <div className="mt-4 space-y-4 text-muted-foreground">
          <p>We store your data on secure servers located at the University of Tübingen, Germany.</p>
          <p>We will keep your information (such as email addresses) for as long as necessary to provide you with our services, and at most for 90 days, after which it will be deleted.</p>
        </div>
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="font-headline text-2xl font-bold">Marketing</h2>
        <div className="mt-4 text-muted-foreground">
          <p>We do not use your personal information for marketing purposes.</p>
        </div>
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="font-headline text-2xl font-bold">What are your data protection rights?</h2>
        <div className="mt-4 space-y-4 text-muted-foreground">
          <p>We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:</p>
          <p>
            <strong>The right to access.</strong> You have the right to request copies of your personal data.
          </p>
          <p>
            <strong>The right to rectification.</strong> You have the right to request that we correct any information you believe is inaccurate. You also have the right to request that we complete the information you believe is incomplete.
          </p>
          <p>
            <strong>The right to erasure.</strong> You have the right to request that we erase your personal data, under certain conditions.
          </p>
          <p>
            <strong>The right to restrict processing.</strong> You have the right to request that we restrict the processing of your personal data, under certain conditions.
          </p>
          <p>
            <strong>The right to object to processing.</strong> You have the right to object to our processing of your personal data, under certain conditions.
          </p>
          <p>
            <strong>The right to data portability.</strong> You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.
          </p>
          <p>
            If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us at our email: nadine.ziemert@uni-tuebingen.de<br />
            Call us at: +49 (0) 7071 2978841<br />
            Or write to us: Auf der Morgenstelle 24, 72076, Tübingen, Germany.
          </p>
        </div>
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="font-headline text-2xl font-bold">Cookies</h2>
        <div className="mt-4 space-y-4 text-muted-foreground">
          <p>
            Cookies are text files placed on your computer to collect standard Internet log information and visitor behavior information. When you visit our websites, we may collect information from you automatically through cookies or similar technology.
          </p>
          <p>
            For further information, visit{" "}
            <a href="https://allaboutcookies.org" className="text-primary hover:underline">
              allaboutcookies.org
            </a>.
          </p>
        </div>
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="font-headline text-2xl font-bold">What types of cookies do we use?</h2>
        <div className="mt-4 space-y-4 text-muted-foreground">
          <p>There are a number of different types of cookies, however, our website uses:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Functionality - We use these cookies so that we recognize you on our website and remember your previously selected preferences. These could include what language you prefer and location you are in. A mix of first-party and third-party cookies are used.</li>
          </ul>
        </div>
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="font-headline text-2xl font-bold">How to manage cookies</h2>
        <div className="mt-4 text-muted-foreground">
          <p>
            You can set your browser not to accept cookies, and the above website tells you how to remove cookies from your browser. However, in a few cases, some of our website features may not function as a result.
          </p>
        </div>
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="font-headline text-2xl font-bold">Privacy policies of other websites</h2>
        <div className="mt-4 text-muted-foreground">
          <p>
            Our website contains links to other websites. Our privacy policy applies only to our website, so if you click on a link to another website, you should read their privacy policy.
          </p>
        </div>
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="font-headline text-2xl font-bold">Changes to our privacy policy</h2>
        <div className="mt-4 text-muted-foreground">
          <p>
            We keep our privacy policy under regular review and place any updates on this web page. This privacy policy was last updated on 22.03.2024.
          </p>
        </div>
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="font-headline text-2xl font-bold">How to contact us</h2>
        <div className="mt-4 space-y-4 text-muted-foreground">
          <p>
            If you have any questions about our privacy policy, the data we hold on you, or you would like to exercise one of your data protection rights, please do not hesitate to contact us.
          </p>
          <p>
            Email us at: nadine.ziemert@uni-tuebingen.de<br />
            Call us: +49 (0) 7071 2978841<br />
            Or write to us at: Auf der Morgenstelle 24, 72076, Tübingen, Germany.
          </p>
          <p className="mt-6 text-sm">
            Last updated: 22.03.2024
          </p>
        </div>
      </section>
    </div>
  );
}