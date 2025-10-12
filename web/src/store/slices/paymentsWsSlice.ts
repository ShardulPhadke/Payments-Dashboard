import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { PaymentEvent, ConnectionStatusEvent } from '@payment/shared-types'

interface PaymentsWsState {
    events: PaymentEvent[]
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
        addPaymentEvent: (state, action: PayloadAction<PaymentEvent>) => {
            state.events.unshift(action.payload) // newest first
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
