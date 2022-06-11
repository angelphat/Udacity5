/**
 * Fields in a request to update a single Idol item.
 */
export interface UpdateIdolRequest {
  name: string
  dueDate: string
  done: boolean
}