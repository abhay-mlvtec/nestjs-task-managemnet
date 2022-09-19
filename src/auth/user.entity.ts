import { Task } from 'src/tasks/task.entity';
import { Column,Entity,OneToMany,PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class User{
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column({unique: true})
    username: string;

    @Column()
    password: string

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, })
    amount: number;
    
    //eager true means whenever task will also be fetched with user. You dont need to fetch task manually
    @OneToMany((_type) => Task, (task) => task.user, { eager: true })
    tasks: Task[];

    
}
