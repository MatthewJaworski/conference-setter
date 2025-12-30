export interface IRepository<TCreateDto, TUpdateDto, TDetailsDto> {
  /**
   * Add a new entity
   */
  addAsync(dto: TCreateDto): Promise<void>;

  /**
   * Get entity by ID
   */
  getAsync(id: string): Promise<TDetailsDto | null>;

  /**
   * Browse/list all entities
   */
  browseAsync(): Promise<readonly TDetailsDto[]>;

  /**
   * Update an existing entity
   */
  updateAsync(dto: TUpdateDto): Promise<void>;

  /**
   * Delete an entity by ID
   */
  deleteAsync(id: string): Promise<void>;
}
