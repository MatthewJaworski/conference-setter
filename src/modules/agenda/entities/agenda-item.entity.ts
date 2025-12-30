import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ConferenceEntity } from '../../conferences/entities/conference.entity';

@Entity('agenda_items')
export class AgendaItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  conferenceId!: string;

  @ManyToOne(() => ConferenceEntity)
  @JoinColumn({ name: 'conferenceId' })
  conference?: ConferenceEntity;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int' })
  level!: number;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ type: 'simple-array', nullable: true })
  speakerIds?: string[];

  @Column({ type: 'int', default: 0 })
  version!: number;
}
