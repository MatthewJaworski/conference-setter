import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm';
import { AgendaTrackEntity, AgendaTrackEntityType } from './agenda-track.entity';

@Entity('agenda_slots')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class AgendaSlotEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'timestamp' })
  from!: Date;

  @Column({ type: 'timestamp' })
  to!: Date;

  @Column({ type: 'uuid', nullable: true })
  trackId?: string;

  @ManyToOne(() => AgendaTrackEntity, (track) => track.slots)
  @JoinColumn({ name: 'trackId' })
  track?: AgendaTrackEntityType;
}
