import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Payment } from '@payment/shared-types'

export type PaymentEventForStore = {
    type: string
    payment: Payment
    timestamp: string // ISO string
}

interface ConnectionStatusEvent {
    status: 'connected' | 'disconnected' | 'error'
    message?: string
    timestamp: string // ISO string
}

interface PaymentsWsState {
    events: PaymentEventForStore[]
    connection: ConnectionStatusEvent | null
}

const initialState: PaymentsWsState = {
    events: [],
    connection: null,
}

export const paymentsWsSlice = createSlice({
    name: 'paymentsWs',
    initialState,
    reducers: {
        addPaymentEvent: (state, action: PayloadAction<PaymentEventForStore>) => {
            state.events.unshift(action.payload)
        },
        setConnectionStatus: (state, action: PayloadAction<ConnectionStatusEvent>) => {
            state.connection = action.payload
        },
        clearEvents: (state) => {
            state.events = []
        },
    },
})

export const { addPaymentEvent, setConnectionStatus, clearEvents } = paymentsWsSlice.actions
export default paymentsWsSlice.reducer
