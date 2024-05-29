import Link from "next/link";
import { SignInWithEthereum } from "./sign-in-with-ethereum";

export function Navbar() {
  return (
    <div className="h-16 bg-background text-foreground">
      <div className="flex items-center gap-4 justify-between px-4 py-2 border-b border-input">
        <h2 className="flex-shrink-0 text-2xl font-bold">Celium</h2>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-medium text-sm border-b transition-all duration-300 border-transparent hover:border-muted-foreground"
          >
            Home
          </Link>
          <Link
            href="/transfer"
            className="font-medium text-sm h-full border-b transition-all duration-300 border-transparent hover:border-muted-foreground"
          >
            Transfer
          </Link>
          <Link
            href="/swap"
            className="font-medium text-sm h-full border-b transition-all duration-300 border-transparent hover:border-muted-foreground"
          >
            Swap
          </Link>
          <Link
            href="/bridge"
            className="font-medium text-sm h-full border-b transition-all duration-300 border-transparent hover:border-muted-foreground"
          >
            CCIP Bridge
          </Link>
        </div>
        <div className="flex-1 flex justify-end">
          <div className="flex items-center gap-4">
            <div className="rounded-sm bg-gradient-to-tr from-gray-500 to-gray-800 px-2 py-1">
              2,121,223 Points
            </div>

            <SignInWithEthereum />
          </div>
        </div>
      </div>
    </div>
  );
}
