import { Exclude } from 'class-transformer';
//import { User } from 'src/auth/user.entity';
import { User } from '../auth/user.entity';
import { Column,Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import { TaskStatus } from './task-status.enum';

@Entity()
export class Task {
    //@PrimaryGeneratedColumn()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, })
    amount: number;

    @Column()
    description: string;

    @Column()
    status: TaskStatus;

    @ManyToOne((_type) => User, (user) => user.tasks, { eager: false })
    @Exclude({ toPlainOnly: true })
    user: User;

    @Column()
    requested_by: string;
}