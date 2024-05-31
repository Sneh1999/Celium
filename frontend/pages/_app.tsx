import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { sepolia } from "wagmi/chains";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { SessionProvider } from "next-auth/react";
import { RootLayout } from "@/components/layout";
import { trpc } from "@/lib/trpc";

const config = getDefaultConfig({
  appName: "Celium",
  projectId: "8e476f828ec6c1fc27351bf37e63bbe2",
  chains: [sepolia],
  ssr: true,
});

const client = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={client}>
          <RainbowKitProvider>
            <RootLayout>
              <Component {...pageProps} />
            </RootLayout>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </SessionProvider>
  );
}

export default trpc.withTRPC(MyApp);
