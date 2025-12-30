import { ChildEntity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { AgendaSlotEntity } from './agenda-slot.entity';
import { AgendaItemEntity } from './agenda-item.entity';

@ChildEntity('regular')
export class RegularAgendaSlotEntity extends AgendaSlotEntity {
  @Column({ type: 'int', nullable: true })
  participantsLimit?: number;

  @Column({ type: 'uuid', nullable: true })
  agendaItemId?: string;

  @ManyToOne(() => AgendaItemEntity)
  @JoinColumn({ name: 'agendaItemId' })
  agendaItem?: AgendaItemEntity;
}
