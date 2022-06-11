import { IdolAccess } from './idolAcess'
import { AttachmentUtils } from './attachmentUtils'
import { IdolItem } from '../models/IdolItem'
import { CreateIdolRequest } from '../requests/CreateIdolRequest'
import { UpdateIdolRequest } from '../requests/UpdateIdolRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

const logger = createLogger('idol')

const idolAccess = new IdolAccess()
const attachmentUtil = new AttachmentUtils()

export async function getIdols(userId: string) {
  logger.info(`Retrieving all idols for user ${userId}`, { userId })
  return await idolAccess.getAllIdols(userId)
}

export async function createIdol(
  userId: string,
  createIdolRequest: CreateIdolRequest
): Promise<IdolItem> {
  const idolId = uuid.v4()

  const newItem: IdolItem = {
    userId,
    idolId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: null,
    ...createIdolRequest
  }

  await idolAccess.createIdol(newItem)

  return newItem
}

async function checkIdol(userId: string, idolId: string) {
  const existItem = await idolAccess.getIdolItem(userId, idolId)
  if (!existItem) {
    throw new createError.NotFound(`Idol with id: ${idolId} not found`)
  }

  if (existItem.userId !== userId) {
    throw new createError.BadRequest('User not authorized to update item')
  }
}

export async function updateIdol(
  userId: string,
  idolId: string,
  updateRequest: UpdateIdolRequest
) {
  await checkIdol(userId, idolId)

  idolAccess.updateIdolItem(userId, idolId, updateRequest)
}

export async function deleteIdol(userId: string, idolId: string) {
  await checkIdol(userId, idolId)

  idolAccess.deleteIdolItem(userId, idolId)
}

export async function updateAttachmentUrl(
  userId: string,
  idolId: string,
  attachmentId: string
) {
  await checkIdol(userId, idolId)

  const url = await attachmentUtil.getAttachmentUrl(attachmentId)

  await idolAccess.updateAttachmentUrl(userId, idolId, url)
}

export async function generateAttachmentUrl(id: string): Promise<string> {
  return await attachmentUtil.getUploadUrl(id)
}
