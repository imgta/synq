import { ThemeToggle } from "@/components/ui/theme-toggle";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode; }>) {

  return (
    <>
      <div className="container bg-background mx-auto px-4 my-4">
        <header className="px-6 sm:mt-8">
          <ThemeToggle />
        </header>

        <main>
          {children}
        </main>

        <footer className="my-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground/50">
              &copy; {new Date().getFullYear()} @imgta
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
