import { apiEndpoint } from '../config'
import { Idol } from '../types/Idol';
import { CreateIdolRequest } from '../types/CreateIdolRequest';
import Axios from 'axios'
import { UpdateIdolRequest } from '../types/UpdateIdolRequest';

export async function getIdols(idToken: string): Promise<Idol[]> {
  console.log('Fetching idol')

  const response = await Axios.get(`${apiEndpoint}/idols`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Idols:', response.data)
  return response.data.items
}

export async function createIdol(
  idToken: string,
  newIdol: CreateIdolRequest
): Promise<Idol> {
  const response = await Axios.post(`${apiEndpoint}/idols`,  JSON.stringify(newIdol), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchIdol(
  idToken: string,
  idolId: string,
  updatedIdol: UpdateIdolRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/idols/${idolId}`, JSON.stringify(updatedIdol), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteIdol(
  idToken: string,
  idolId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/idols/${idolId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  idolId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/idols/${idolId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
