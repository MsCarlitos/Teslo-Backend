import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';


@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsServices');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const producto = this.productRepository.create(createProductDto);
      await this.productRepository.save(producto);
      return producto;

    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit= 10, offset = 0 } = paginationDto;
    const products = await this.productRepository.find({
      take: limit,
      skip: offset
      // TODO: Relaciones
    });
    return products;
  }

  async findOne(term: string) {
    let product: Product;
    if( isUUID) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = await this.productRepository.createQueryBuilder();
      product = await queryBuilder.where(
        `UPPER(title) =:title or slug =:slug`,{
        title:term.toLowerCase(),
        slug: term.toUpperCase()
      }).getOne();
    }
    if( !product ) {
      throw new NotFoundException(`Product ${term} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto
    });

    if( !product ) throw new NotFoundException(`Product with id: ${id} not found`);

    try {
      return this.productRepository.save( product );
    } catch (error) {
      this.handleDBExceptions( error );
    }
  }

  async remove(id: string) {
    const product = await this.findOne( id )
    await this.productRepository.remove( product );
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505')
        throw new BadRequestException(error.detail)

      this.logger.error('Unexpected error, check server logs.');

      throw new InternalServerErrorException('Ayuda');
  }
}
