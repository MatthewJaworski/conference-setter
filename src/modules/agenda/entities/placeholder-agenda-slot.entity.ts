import { ChildEntity, Column } from 'typeorm';
import { AgendaSlotEntity } from './agenda-slot.entity';

@ChildEntity('placeholder')
export class PlaceholderAgendaSlotEntity extends AgendaSlotEntity {
  @Column({ type: 'varchar', length: 500, nullable: true })
  placeholder?: string;
}
