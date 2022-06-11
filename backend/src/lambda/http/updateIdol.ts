import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { UpdateIdolRequest } from '../../requests/UpdateIdolRequest'
import { getUserId } from '../utils'
import { updateIdol } from '../../helpers'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const idolId = event.pathParameters.idolId
    const updatedIdol: UpdateIdolRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    await updateIdol(userId, idolId, updatedIdol)

    return {
      statusCode: 200,
      body: ''
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
