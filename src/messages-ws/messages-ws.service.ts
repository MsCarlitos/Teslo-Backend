import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConnectedClients {
    [id: string]: {
        socket: Socket,
        user: User,
    };
}

@Injectable()
export class MessagesWsService {
    private connectedClient: ConnectedClients = {}

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async registerClient( client: Socket, userId: string ) {
        const user = await  this.userRepository.findOneBy({id: userId});
        if (!user) throw new Error('User not found');
        if (!user.isActive) throw new Error('User not Active');
        this.checkUserConnection(user);
        this.connectedClient[client.id] = {
            socket: client,
            user: user
        };
    }

    removeClient( clientId: string ) {
        delete this.connectedClient[clientId];
    }

    getConnectedClients(): string[] {
        return Object.keys(this.connectedClient);
    }

    getUserFullName( socketId: string ){
        return this.connectedClient[socketId].user.fullname;
    }

    private checkUserConnection(user: User) {
        for( const clientId of Object.keys( this.connectedClient )) {
            const connected = this.connectedClient[clientId];

            if (connected.user.id === user.id) {
                connected.socket.disconnect();
                break;
            }
        }
    }
}
