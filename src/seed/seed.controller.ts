import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('SEED')
@Controller('seed')
export class SeedController {

  constructor(
    private readonly seedService: SeedService
  ) {}

  @Get()
  // @Auth( ValidRoles.admin )
  async executedSeed() {
    return this.seedService.runSeed();
  }

}
