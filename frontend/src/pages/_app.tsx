import 'tailwindcss/tailwind.css'
import '@rainbow-me/rainbowkit/styles.css'

import React from 'react'
import type { AppProps } from 'next/app'

import {
    darkTheme,
    getDefaultConfig,
    RainbowKitProvider,
} from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

const config = getDefaultConfig({
    appName: 'Celium',
    projectId: '8e476f828ec6c1fc27351bf37e63bbe2',
    chains: [mainnet, polygon, optimism, arbitrum, base],
    ssr: false,
})

const queryClient = new QueryClient()

function App({ Component, pageProps }: AppProps) {
    // suppress useLayoutEffect warnings when running outside a browser
    if (!process.browser) React.useLayoutEffect = React.useEffect

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider coolMode theme={darkTheme()}>
                    <Component {...pageProps} />
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
export default App
