import { io, Socket } from 'socket.io-client'
import { store } from '../index'
import { addPaymentEvent, setConnectionStatus } from '../slices/paymentsWsSlice'
import type { PaymentEvent } from '@payment/shared-types'

const RECONNECT_INTERVAL = 3000

// Define a store-safe PaymentEvent type
interface PaymentEventForStore {
    type: PaymentEvent['type']
    payment: PaymentEvent['payment']
    timestamp: string // ISO string
}

export class PaymentsWsClient {
    private socket: Socket | null = null
    private url: string
    private tenantId: string

    constructor(url: string, tenantId: string) {
        this.url = url
        this.tenantId = tenantId
    }

    connect() {
        if (this.socket) return

        console.log('Connecting to WS:', this.url, 'with tenantId:', this.tenantId)
        this.socket = io(this.url, {
            path: '/ws/payments/socket.io',
            query: { tenantId: this.tenantId },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: RECONNECT_INTERVAL,
        })

        this.socket.on('connect', () => {
            store.dispatch(
                setConnectionStatus({
                    status: 'connected',
                    timestamp: new Date().toISOString(),
                })
            )
        })

        this.socket.on('disconnect', (reason) => {
            store.dispatch(
                setConnectionStatus({
                    status: 'disconnected',
                    message: reason,
                    timestamp: new Date().toISOString(),
                })
            )
        })

        this.socket.on('connect_error', (err) => {
            store.dispatch(
                setConnectionStatus({
                    status: 'error',
                    message: err.message,
                    timestamp: new Date().toISOString(),
                })
            )
        })

        this.socket.on('connection_status', (data) => {
            store.dispatch(
                setConnectionStatus({
                    ...data,
                    timestamp: new Date(data.timestamp).toISOString(),
                })
            )
        })

        this.socket.on('payment_event', (data: PaymentEvent) => {
            // Convert timestamp to ISO string for Redux
            const evt: PaymentEventForStore = {
                ...data,
                timestamp: new Date(data.timestamp).toISOString(),
            }
            store.dispatch(addPaymentEvent(evt))
        })
    }

    disconnect() {
        this.socket?.disconnect()
        this.socket = null
    }
}
