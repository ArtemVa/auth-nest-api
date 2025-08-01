import { Exclude } from 'class-transformer';
import { UserEntity } from '../../users/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({name: "posts"})
export class PostEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 255})
    title: string;

    @Column('text')
    description: string;

    @CreateDateColumn()
    publishedAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Exclude()
    @ManyToOne(() => UserEntity, (user) => user.posts)
    author: UserEntity;
}
