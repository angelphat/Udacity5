import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateIdolRequest } from '../../requests/CreateIdolRequest'
import { getUserId } from '../utils';
import { createIdol } from '../../helpers'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newIdol: CreateIdolRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    const newItem = await createIdol(userId, newIdol);

    return {
      statusCode: 201,
      body: JSON.stringify({item: newItem})
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
