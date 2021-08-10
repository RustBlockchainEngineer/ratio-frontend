/* eslint-disable object-shorthand */
/* eslint-disable import/order */
import cope from '../assets/images/cope.svg'
import eth from '../assets/images/eth.svg'
import media from '../assets/images/media.svg'
import ray from '../assets/images/ray.png'
import sol from '../assets/images/sol.png'
import srm from '../assets/images/srm.png'
import step from '../assets/images/step.png'
import usdc from '../assets/images/usdc.png'

import { GoogleSpreadsheet } from 'google-spreadsheet'

const SPREADSHEET_ID = process.env.REACT_APP_SPREADSHEET_ID
// const SHEET_ID = process.env.REACT_APP_SHEET_ID;
const CLIENT_EMAIL = process.env.REACT_APP_GOOGLE_CLIENT_EMAIL
const PRIVATE_KEY = process.env.REACT_APP_GOOGLE_SERVICE_PRIVATE_KEY || ''

const doc = new GoogleSpreadsheet(SPREADSHEET_ID)

export const getIcon = (name: any) => {
  let icon
  switch (name) {
    case 'RAY':
      icon = ray
      break
    case 'COPE':
      icon = cope
      break
    case 'ETH':
      icon = eth
      break
    case 'MEDIA':
      icon = media
      break
    case 'SOL':
      icon = sol
      break
    case 'SRM':
      icon = srm
      break
    case 'STEP':
      icon = step
      break
    case 'USDC':
      icon = usdc
      break
    default:
      icon = ray
      break
  }
  return icon
}

export const getSpreadsheet = async (
  offset: any,
  limit: any,
  callback: any
) => {
  try {
    await doc.useServiceAccountAuth({
      client_email: CLIENT_EMAIL || '',
      private_key: PRIVATE_KEY.replace(/\\n/g, '\n'),
    })
    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[0]
    const rows = await sheet.getRows({ offset: offset, limit: limit })
    callback(rows)
  } catch (e) {
    console.error('Error: ', e)
  }
}

export function chunks(array: any, size: any) {
  return Array.apply(
    0,
    new Array(Math.ceil(array.length / size))
  ).map((_, index) => array.slice(index * size, (index + 1) * size))
}
