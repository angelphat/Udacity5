import 'source-map-support/register'
import * as uuid from 'uuid'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getUserId } from '../utils'
import { generateAttachmentUrl, updateAttachmentUrl } from '../../helpers'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const idolId = event.pathParameters.idolId
    const userId = getUserId(event)
    const attachmentId = uuid.v4()
    const uploadUrl = await generateAttachmentUrl(attachmentId)
    await updateAttachmentUrl(userId, idolId, attachmentId)
    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl
      })
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
