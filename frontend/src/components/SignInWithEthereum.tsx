'use client'

import { useAuth } from '@/hooks/auth'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useEffect, useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { SiweMessage } from '@learnweb3dao/siwe'

export const SignInWithEthereum = () => {
    const { user, loginWithEthereum } = useAuth({ middleware: 'guest' })
    const { isConnected, connector, address, chainId } = useAccount()
    const { signMessageAsync } = useSignMessage()

    const [errors, setErrors] = useState([])
    const [status, setStatus] = useState<string | null>(null)

    async function handleSIWE() {
        try {
            const message = new SiweMessage({
                domain: window.location.host,
                address,
                statement: 'Sign in with Ethereum to Celium.',
                uri: window.location.origin,
                version: '1',
                chainId: chainId?.toString(),
                nonce: '23984y2384y239o4h',
            })

            console.log({ message })

            const signature = await signMessageAsync({
                connector,
                message: message.toMessage(),
            })

            await loginWithEthereum({
                message: message.toMessage(),
                signature,
                address,
                setErrors,
                setStatus,
            })
        } catch (error) {
            console.error(error)
        }

        // make API call here
    }

    useEffect(() => {
        if (isConnected && !user) {
            void handleSIWE()
        }
    }, [isConnected, user])

    return <ConnectButton chainStatus={'none'} />
}
