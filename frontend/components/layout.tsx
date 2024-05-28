import { Toaster } from "sonner";
import { Navbar } from "./shared/navbar";

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-background text-foreground">
      <Navbar />
      {children}

      <Toaster richColors />
    </main>
  );
}
