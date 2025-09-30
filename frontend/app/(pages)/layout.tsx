import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode; }>) {

  // ------------------------------------------------------------------------------

  return (
    <>
      <div className="xl:bg-background container mx-auto px-4 sm:px-6 lg:px-12 border-[#252422]/40 border-0 xl:border my-4 rounded-lg">
        <header className="sm:mt-8">
          <ThemeToggle />
        </header>

        <main>
          {children}
        </main>

        <footer className="mt-auto mb-8">
          <div className="flex justify-between items-center">
            <p className="tracking-tight sm:tracking-normal text-sm text-muted-foreground/50">
              &copy; {new Date().getFullYear()} @imgta
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
