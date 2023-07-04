import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductImage } from './product-image.entity';
import { User } from 'src/auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'product'})
export class Product {
    @ApiProperty({
        example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
        description: 'Product ID',
        uniqueItems: true,
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'T-Shirt Teslo',
        description: 'title',
        uniqueItems: true,
    })
    @Column('text', {
    unique: true,
    })
    title: string;

    @ApiProperty({
        example:0,
        description: 'Product Price',
    })
    @Column('float', {
        default: 0,
    })
    price: number;

    @ApiProperty({
        example: 'lorem ipsum dolor sit amet, consectetur adipiscing',
        description: 'Product description',
        default: null
    })
    @Column({
        type: 'text',
        nullable: true,
    })
    description: string;

    @ApiProperty({
        example: 't_shirt_teslo',
        description: 'Product Slug - for CEO',
        uniqueItems: true,
    })
    @Column({
        type: 'text',
        unique: true,
    })
    slug: string;

    @ApiProperty({
        example: 10,
        description: 'Product Stock',
        default: 0
    })
    @Column({
        type: 'int',
        default: 0,
    })
    stock: number;

    @ApiProperty({
        example: ['M', 'XXL'],
        description: 'Product Sizes',
    })
    @Column({
        type: 'text',
        array: true,
    })
    sizes: string[];

    @ApiProperty({
        example: 'Women',
        description: 'Product Gender',
        uniqueItems: true,
    })
    @Column({
        type: 'text',
    })
    gender: string;

    @ApiProperty()
    @Column({
        type: 'text',
        array: true,
        default: []
    })
    tags: string[];

    @ApiProperty()
    @OneToMany(
        () => ProductImage,
        productImage => productImage.product,
        { cascade: true, eager: true }
    )
    images: ProductImage[];

    @ApiProperty()
    @ManyToOne(
        () => User,
        user => user.product,
        { eager: true },
    )
    user: User

    @BeforeInsert()
    checkSlugInsert() {
        if( !this.slug ) this.slug = this.title;

        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '');
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        if( !this.slug ) this.slug = this.title;

        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '');
    }
}
