import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ConferenceEntity } from '../../conferences/entities/conference.entity';
import { AgendaSlotEntity } from './agenda-slot.entity';

@Entity('agenda_tracks')
export class AgendaTrackEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  conferenceId!: string;

  @ManyToOne(() => ConferenceEntity)
  @JoinColumn({ name: 'conferenceId' })
  conference?: ConferenceEntity;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @OneToMany(() => AgendaSlotEntity, (slot) => slot.track)
  slots?: AgendaSlotEntity[];

  @Column({ type: 'int', default: 0 })
  version!: number;
}
export type AgendaTrackEntityType = AgendaTrackEntity;
