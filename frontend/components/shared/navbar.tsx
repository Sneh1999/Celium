import { SignInWithEthereum } from "./sign-in-with-ethereum";

export function Navbar() {
  return (
    <div className="h-16 bg-background text-foreground">
      <div className="flex items-center justify-between px-4 py-2 border-b border-input">
        <h2 className="flex-shrink-0 text-2xl font-bold">Celium</h2>
        <div className="flex-1 flex justify-end">
          <div className="flex items-center">
            <SignInWithEthereum />
          </div>
        </div>
      </div>
    </div>
  );
}
