import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { HostEntity, HostType } from './host.entity';

@Entity('conferences')
export class ConferenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  hostId!: string;

  @ManyToOne(() => HostEntity, (host) => host.conferences)
  @JoinColumn({ name: 'hostId' })
  host?: HostType;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl?: string;

  @Column({ type: 'int', nullable: true })
  participantsLimit?: number;

  @Column({ type: 'timestamp' })
  from!: Date;

  @Column({ type: 'timestamp' })
  to!: Date;
}
