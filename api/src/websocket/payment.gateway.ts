import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PaymentEvent } from '@payment/shared-types';
import { PaymentCreatedEvent } from '../payments/payments.service';

/**
 * Payments WebSocket Gateway
 * 
 * Handles WebSocket connections at /ws/payments
 * Broadcasts payment events to connected clients based on tenantId.
 * 
 * Connection URL: ws://localhost:3000/ws/payments?tenantId=tenant-alpha
 * 
 * Architecture:
 * 1. Client connects with tenantId in query params
 * 2. Server validates tenantId and joins client to tenant-specific room
 * 3. When PaymentsService creates a payment, it emits 'payment.created' event
 * 4. This gateway listens to that event and broadcasts to the tenant's room
 * 5. Only clients in that tenant's room receive the event
 */
@WebSocketGateway({
    cors: {
        origin: '*', // In production, restrict this to your frontend domain
        credentials: true,
    },
    path: '/ws/payments',
    transports: ['websocket', 'polling'],
})
export class PaymentsGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    private readonly logger = new Logger(PaymentsGateway.name);

    // Add constructor logging
    constructor() {
        this.logger.log('PaymentsGateway CONSTRUCTOR called');
    }
    /**
     * Track connected clients by tenant
     * Structure: { tenantId: Set<socketId> }
     */
    private tenantRooms: Map<string, Set<string>> = new Map();

    /**
     * Gateway initialization
     * Called once when the gateway is instantiated
     */
    afterInit(server: Server) {
        this.logger.log('WebSocket Gateway initialized at /ws/payments');
        this.logger.log(`Server type: ${server.constructor.name}`);
        this.logger.log(`Server has engine: ${!!server.engine}`);

    }

    /**
     * Validate tenant ID format
     * Matches the validation in TenantGuard
     */
    private isValidTenantIdFormat(tenantId: string): boolean {
        const pattern = /^tenant-[a-zA-Z0-9-]+$/;
        return pattern.test(tenantId);
    }

    /**
     * Handle new client connection
     * 
     * 1. Extract tenantId from query params
     * 2. Validate tenantId exists and format
     * 3. Join client to tenant-specific room
     * 4. Track connection in tenantRooms map
     * 5. Send connection confirmation to client
     */
    handleConnection(client: Socket) {
        const tenantId = client.handshake.query.tenantId as string;

        // Validate tenantId exists
        if (!tenantId || tenantId.trim() === '') {
            this.logger.warn(`Connection rejected: Missing tenantId (client: ${client.id})`);
            client.emit('error', {
                message: 'tenantId is required in query parameters',
            });
            client.disconnect();
            return;
        }

        // Validate tenant ID format (same as REST API guard)
        if (!this.isValidTenantIdFormat(tenantId)) {
            this.logger.warn(
                `Connection rejected: Invalid tenantId format: ${tenantId} (client: ${client.id})`
            );
            client.emit('error', {
                message: 'Invalid tenantId format. Expected format: tenant-{name}',
            });
            client.disconnect();
            return;
        }

        // Join tenant-specific room
        const roomName = `tenant-${tenantId}`;
        client.join(roomName);

        // Track connection
        if (!this.tenantRooms.has(tenantId)) {
            this.tenantRooms.set(tenantId, new Set());
        }
        this.tenantRooms.get(tenantId)!.add(client.id);

        // Log connection
        this.logger.log(
            `Client connected: ${client.id} | Tenant: ${tenantId} | Room: ${roomName} | Total in room: ${this.tenantRooms.get(tenantId)!.size}`
        );

        // Send connection confirmation to client
        client.emit('connection_status', {
            status: 'connected',
            message: `Connected to payment stream for tenant: ${tenantId}`,
            timestamp: new Date(),
        });
    }

    /**
     * Handle client disconnection
     * 
     * 1. Find tenant for this client
     * 2. Remove from tenantRooms tracking
     * 3. Clean up empty tenant rooms
     */
    handleDisconnect(client: Socket) {
        // Find which tenant this client belonged to
        let clientTenant: string | null = null;
        for (const [tenantId, clients] of this.tenantRooms.entries()) {
            if (clients.has(client.id)) {
                clientTenant = tenantId;
                clients.delete(client.id);

                // Clean up empty tenant room
                if (clients.size === 0) {
                    this.tenantRooms.delete(tenantId);
                }
                break;
            }
        }

        this.logger.log(
            `Client disconnected: ${client.id}${clientTenant ? ` | Tenant: ${clientTenant}` : ''}`
        );
    }

    /**
     * Listen to 'payment.created' events from PaymentsService
     * 
     * This is the core of the event-driven architecture:
     * - PaymentsService emits 'payment.created' when a payment is saved
     * - This method catches that event
     * - Broadcasts to all clients in the tenant's room
     * 
     * @OnEvent decorator makes this method listen to internal events
     */
    @OnEvent('payment.created')
    handlePaymentCreated(event: PaymentCreatedEvent) {
        const { tenantId, payment, eventType } = event;

        // Create WebSocket event payload
        const wsEvent: PaymentEvent = {
            type: eventType,
            payment,
            timestamp: new Date(),
        };

        // Get room name for this tenant
        const roomName = `tenant-${tenantId}`;

        // Broadcast to all clients in this tenant's room
        this.server.to(roomName).emit('payment_event', wsEvent);

        // Log broadcast
        const clientCount = this.tenantRooms.get(tenantId)?.size || 0;
        this.logger.debug(
            `Broadcasted ${eventType} to ${clientCount} clients in ${roomName} | Amount: $${payment.amount}`
        );
    }

    /**
     * Get connection statistics (useful for monitoring)
     */
    getConnectionStats() {
        const stats = {
            totalConnections: 0,
            tenants: [] as Array<{ tenantId: string; connections: number }>,
        };

        for (const [tenantId, clients] of this.tenantRooms.entries()) {
            stats.totalConnections += clients.size;
            stats.tenants.push({
                tenantId,
                connections: clients.size,
            });
        }

        return stats;
    }
}