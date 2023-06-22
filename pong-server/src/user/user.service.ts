import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Matches } from 'class-validator';

@Injectable()
export class UserService {
  public onlineUsers: Array<{ id: number, socket: Socket }> = [];

  constructor(@InjectRepository(User) private userRepository: Repository<User>) {
    console.log("UserService", Date.now());
  };

  handleDisconnect(socket: any) {
    this.onlineUsers = this.onlineUsers.filter(_ => _.socket !== socket);
    const onlineUsersPayload = JSON.stringify(this.onlineUsers.map(u => u.id));
    this.onlineUsers
      .forEach(s => s.socket.emit('updateOnlineList', onlineUsersPayload));
  }

  logIn(socket: Socket, payload: string) {
    const id = parseInt(payload);
    if (this.onlineUsers.find(_ => _.id === id)) {
      const onlineUsersPayload = JSON.stringify(this.onlineUsers.map(u => u.id));
      this.onlineUsers
        .forEach(s => s.socket.emit('updateOnlineList', onlineUsersPayload));
      return;
    }
    this.onlineUsers.push({ id, socket });
    const onlineUsersPayload = JSON.stringify(this.onlineUsers.map(u => u.id));
    this.onlineUsers
      .forEach(s => s.socket.emit('updateOnlineList', onlineUsersPayload));
  }

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create({ ...createUserDto });
    return this.userRepository.save(user);
  }

  async findAll() {
    return this.userRepository.find({
      // relations: ['matches']
    });
  }

  async findOne(id: number) {
    return this.userRepository.findOne({
      where: { id },
      // relations: ['matches'],
    });
  }

  async findOneByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({
      where: { username },
      // relations: ['matches'],
    });
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
