import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { IdolItem } from '../models/IdolItem';
import { IdolUpdate } from '../models/IdolUpdate';

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)



const logger = createLogger('IdolAccess')


export class IdolAccess {
    constructor(
        private readonly docClient:DocumentClient = createDynamoDBClient(),
        private readonly idolTable = process.env.IDOL_TABLE
    ){}

    async getIdolItem(userId: string, idolId: string): Promise<IdolItem>{
        return (
            await this.docClient.get({
                TableName: this.idolTable,
                Key:{
                    userId,
                    idolId
                }
            }).promise()
        ).Item as IdolItem
    }

    async getAllIdols(userId: string):Promise<IdolItem[]>{
        logger.info('Get all idol')
        const result = await this.docClient.query({
            TableName: this.idolTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
              ':userId': userId
            }
        }).promise()
        
        return result.Items as IdolItem[]
    }

    async createIdol(idolItem: IdolItem): Promise<IdolItem> {
        logger.info('Create new idol')
        await this.docClient.put({
            TableName: this.idolTable,
            Item: idolItem
          }).promise()

        return idolItem
    }

    async deleteIdolItem(userId: string, idolId: string) {
      logger.info(`delete idol with ${idolId}`)
      await this.docClient.delete({
        TableName: this.idolTable,
        Key: {
          userId,
          idolId
        }
      }).promise()
    }

    async updateIdolItem(userId: string, idolId: string, idolUpdate: IdolUpdate) {
        logger.info(`Update idol on ${idolId} with ${JSON.stringify(idolUpdate)}`)
        await this.docClient.update({
            TableName: this.idolTable,
            Key: {
              userId,
              idolId
            },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeNames: {
              '#name': 'name'
            },
            ExpressionAttributeValues: {
              ':name': idolUpdate.name,
              ':dueDate': idolUpdate.dueDate,
              ':done': idolUpdate.done
            }
          }).promise()
    }

    async updateAttachmentUrl(userId: string, idolId: string, newUrl: string) {
        logger.info(
          `Updating ${newUrl} attachment URL for idol ${idolId} of table ${this.idolTable}`
        )
    
        await this.docClient.update({
          TableName: this.idolTable,
          Key: {
            userId,
            idolId
          },
          UpdateExpression: 'set attachmentUrl = :attachmentUrl',
          ExpressionAttributeValues: {
            ':attachmentUrl': newUrl
          }
        }).promise()
    }
}

function createDynamoDBClient(): DocumentClient {
    if (process.env.IS_OFFLINE) {
      logger.info('Creating a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
}
