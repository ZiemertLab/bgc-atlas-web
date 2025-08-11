import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t bg-secondary">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-center px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} BGC-Atlas. University of Tǔbingen, Germany. -{" "}
          <Link href="/imprint" className="hover:text-foreground underline">
            Imprint
          </Link>
          {" "}- {" "}
          <Link href="/privacy" className="hover:text-foreground underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </footer>
  );
}
