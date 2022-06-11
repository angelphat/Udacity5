import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils'
import { getIdols } from '../../helpers'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const idols = await getIdols(getUserId(event))

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: idols
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
