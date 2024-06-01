import { SiweMessage } from "@learnweb3dao/siwe";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { getCsrfToken, signIn, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAccount, useSignMessage } from "wagmi";
import { Button } from "../ui/button";
import { LogOutIcon } from "lucide-react";
import { useIsMounted } from "@/hooks/useIsMounted";

export function SignInWithEthereum() {
  const { isConnected, address, chainId } = useAccount();
  const session = useSession();
  const { signMessageAsync } = useSignMessage();

  const isMounted = useIsMounted();

  async function handleSIWE() {
    try {
      if (!chainId) {
        toast.error("Could not detect Chain ID");
        return;
      }

      const message = new SiweMessage({
        domain: window.location.host,
        address: address,
        statement: "Sign in with Ethereum to the app.",
        uri: window.location.origin,
        version: "1",
        chainId: chainId.toString(),
        nonce: await getCsrfToken(),
      });
      const signature = await signMessageAsync({
        message: message.toMessage(),
      });

      signIn("credentials", {
        message: JSON.stringify(message),
        redirect: true,
        signature,
        callbackUrl: "/link-email",
      });
    } catch (e) {
      toast.error("Could not sign in", {
        description: (e as Error).message,
      });
    }
  }

  async function handleLogout() {
    await signOut();
    window.location.href = "/";
  }

  useEffect(() => {
    if (!session.data && session.status !== "loading" && isConnected) {
      void handleSIWE();
    }
  }, [isConnected, session, isMounted]);

  if (!isMounted) return null;

  if (!session.data) {
    return <ConnectButton />;
  }

  const userAddress = session.data.user.address;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">
        {userAddress.substring(0, 6)}...{userAddress.substring(38)}
      </span>

      <Button
        variant={"ghost"}
        size="sm"
        className="flex items-center gap-1 text-red-500"
        onClick={handleLogout}
      >
        <LogOutIcon className="h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}
