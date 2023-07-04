import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { LoginUserDTO } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interfaces';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDTO) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);
      delete user.password;
      return {
        ...user,
        token: this.getJwtToken({ email: user.email, id: user.id })
      };
    } catch (error) {
      console.log(error);
      this.handleDBError(error);
    }
  }

  async login( userLoginDto: LoginUserDTO ) {
      const { password, email } = userLoginDto;
      const user = await this.userRepository.findOne({
        where: { email },
        select: { email:true, password:true, id: true },
      });

      if ( !user ) {
        throw new UnauthorizedException('Credentials are not valid (email)');
      }

      if ( !bcrypt.compareSync( password, user.password ) ) {
        throw new UnauthorizedException('Credentials are not valid (password)');
      }

      return {
        ...user,
        token: this.getJwtToken({ email: user.email, id: user.id })
      };
  }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ email: user.email, id: user.id })
    };
  }

  private getJwtToken( payload: JwtPayload ) {
    const token = this.jwtService.sign( payload );
    return token
  }

  private handleDBError( error: any ): never {
    if ( error.code === '23505') throw new BadRequestException(error.detail);
      console.log(error);
    throw new InternalServerErrorException(`Please check server logs`);
  }
}
