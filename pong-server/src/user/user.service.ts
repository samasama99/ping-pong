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
    this.onlineUsers
      .forEach(_ => _.socket.emit('updateOnlineList', JSON.stringify(this.onlineUsers.map(_ => _.id))))
  }

  logIn(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, payload: string) {
    const id = parseInt(payload);
    if (this.onlineUsers.find(_ => _.id === id))
      return;
    this.onlineUsers.push({ id, socket });
    this.onlineUsers
      .forEach(_ => _.socket.emit('updateOnlineList', JSON.stringify(this.onlineUsers.map(_ => _.id))))
  }

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create({ ...createUserDto });
    return this.userRepository.save(user);
  }

  async findAll() {
    return this.userRepository.find({
      relations: ['matches']
    });
  }

  async findOne(id: number) {
    return this.userRepository.findOne({
      where: { id },
      relations: ['matches'],
    });
  }

  async findOneByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({
      where: { username },
      relations: ['matches'],
    });
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
