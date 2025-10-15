'use client'

import { Provider } from 'react-redux'
import { store } from '@/store'
import { PaymentsWsClient } from '@/store/ws/paymentsWsClient'
import React from 'react'
import { getEnv } from '@/utils/env';

interface ReduxProviderProps {
    children: React.ReactNode
}

export default function ReduxProvider({ children }: ReduxProviderProps) {
    React.useEffect(() => {
        const tenantId = getEnv('NEXT_PUBLIC_TENANT_ID', 'tenant-alpha')
        const wsUrl = getEnv('NEXT_PUBLIC_WS_URL', 'ws://localhost:3333')
        const wsClient = new PaymentsWsClient(wsUrl, tenantId)
        wsClient.connect()
        return () => wsClient.disconnect()
    }, [])

    return <Provider store={store}>{children}</Provider>
}
