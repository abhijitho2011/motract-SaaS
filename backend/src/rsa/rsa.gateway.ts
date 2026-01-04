import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RsaService } from './rsa.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: '/rsa',
})
export class RsaGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    // Map to track connected users
    private connectedRSAs: Map<string, string> = new Map(); // rsaId -> socketId
    private connectedClients: Map<string, string> = new Map(); // clientId -> socketId
    private jobSubscriptions: Map<string, Set<string>> = new Map(); // jobId -> Set<socketIds>

    constructor(private readonly rsaService: RsaService) { }

    handleConnection(client: Socket) {
        console.log(`RSA WebSocket connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`RSA WebSocket disconnected: ${client.id}`);
        // Clean up from all maps
        for (const [rsaId, socketId] of this.connectedRSAs.entries()) {
            if (socketId === client.id) {
                this.connectedRSAs.delete(rsaId);
                break;
            }
        }
        for (const [clientId, socketId] of this.connectedClients.entries()) {
            if (socketId === client.id) {
                this.connectedClients.delete(clientId);
                break;
            }
        }
    }

    // RSA registers their socket
    @SubscribeMessage('rsa.register')
    handleRsaRegister(
        @MessageBody() data: { rsaId: string },
        @ConnectedSocket() client: Socket
    ) {
        this.connectedRSAs.set(data.rsaId, client.id);
        console.log(`RSA ${data.rsaId} registered with socket ${client.id}`);
        return { success: true };
    }

    // Client registers their socket
    @SubscribeMessage('client.register')
    handleClientRegister(
        @MessageBody() data: { clientId: string },
        @ConnectedSocket() client: Socket
    ) {
        this.connectedClients.set(data.clientId, client.id);
        console.log(`Client ${data.clientId} registered with socket ${client.id}`);
        return { success: true };
    }

    // Subscribe to job updates
    @SubscribeMessage('job.subscribe')
    handleJobSubscribe(
        @MessageBody() data: { jobId: string },
        @ConnectedSocket() client: Socket
    ) {
        if (!this.jobSubscriptions.has(data.jobId)) {
            this.jobSubscriptions.set(data.jobId, new Set());
        }
        this.jobSubscriptions.get(data.jobId)?.add(client.id);
        client.join(`job:${data.jobId}`);
        console.log(`Socket ${client.id} subscribed to job ${data.jobId}`);
        return { success: true };
    }

    // RSA updates location
    @SubscribeMessage('rsa.location.update')
    async handleLocationUpdate(
        @MessageBody() data: { rsaId: string; jobId: string; lat: number; lng: number },
        @ConnectedSocket() client: Socket
    ) {
        // Update RSA location in database
        await this.rsaService.updateLocation(data.rsaId, data.lat, data.lng);

        // Broadcast to all subscribers of this job
        this.server.to(`job:${data.jobId}`).emit('rsa.location.broadcast', {
            jobId: data.jobId,
            rsaId: data.rsaId,
            lat: data.lat,
            lng: data.lng,
            timestamp: new Date().toISOString(),
        });

        return { success: true };
    }

    // Emit job requested event to nearby RSAs
    emitJobRequested(job: any, nearbyRSAIds: string[]) {
        for (const rsaId of nearbyRSAIds) {
            const socketId = this.connectedRSAs.get(rsaId);
            if (socketId) {
                this.server.to(socketId).emit('rsa.job.requested', {
                    jobId: job.id,
                    serviceType: job.serviceType,
                    pickupLat: job.pickupLat,
                    pickupLng: job.pickupLng,
                    pickupAddress: job.pickupAddress,
                    vehicle: job.vehicle,
                    createdAt: job.createdAt,
                });
            }
        }
    }

    // Emit job accepted event to client
    emitJobAccepted(job: any) {
        const clientSocketId = this.connectedClients.get(job.clientId);
        if (clientSocketId) {
            this.server.to(clientSocketId).emit('rsa.job.accepted', {
                jobId: job.id,
                rsa: {
                    id: job.rsaId,
                    name: job.rsa?.name,
                    phone: job.rsa?.phone,
                    vehicleType: job.rsa?.vehicleType,
                    lat: job.rsa?.currentLat,
                    lng: job.rsa?.currentLng,
                },
            });
        }

        // Also broadcast to job room
        this.server.to(`job:${job.id}`).emit('rsa.job.status', {
            jobId: job.id,
            status: 'ACCEPTED',
        });
    }

    // Emit job status change
    emitJobStatusChange(jobId: string, status: string, data?: any) {
        this.server.to(`job:${jobId}`).emit('rsa.job.status', {
            jobId,
            status,
            ...data,
        });
    }

    // Emit job completed
    emitJobCompleted(jobId: string, data: { fare?: number; distanceKm?: number }) {
        this.server.to(`job:${jobId}`).emit('rsa.job.completed', {
            jobId,
            ...data,
            completedAt: new Date().toISOString(),
        });
    }
}
