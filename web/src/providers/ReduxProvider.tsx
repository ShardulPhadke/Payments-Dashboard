'use client'

import { Provider } from 'react-redux'
import { store } from '@/store'
import { PaymentsWsClient } from '@/store/ws/paymentsWsClient'
import React from 'react'

interface ReduxProviderProps {
    children: React.ReactNode
}

export default function ReduxProvider({ children }: ReduxProviderProps) {
    React.useEffect(() => {
        const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || 'tenant-demo'
        // const wsUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace(/^http/, 'ws')}/ws/payments`
        const wsUrl = "ws://localhost:3333"
        const wsClient = new PaymentsWsClient(wsUrl, tenantId)
        wsClient.connect()
        return () => wsClient.disconnect()
    }, [])

    return <Provider store={store}>{children}</Provider>
}
