import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ConferenceEntity } from './conference.entity';

@Entity('hosts')
export class HostEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => ConferenceEntity, (conference) => conference?.host)
  conferences?: ConferenceEntity[];
}

export type HostType = HostEntity;
