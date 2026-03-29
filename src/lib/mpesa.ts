export interface MpesaPaymentRequest {
  phoneNumber: string
  amount: number
  businessId: string
  customerName?: string
}

export interface MpesaResponse {
  success: boolean
  message?: string
  checkoutRequestID?: string
  merchantRequestID?: string
}

export class MpesaService {
  private consumerKey: string
  private consumerSecret: string
  private passkey: string
  private shortcode: string
  private callbackUrl: string

  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY!
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET!
    this.passkey = process.env.MPESA_PASSKEY!
    this.shortcode = process.env.MPESA_SHORTCODE!
    this.callbackUrl = process.env.MPESA_CALLBACK_URL!
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64')
    
    const response = await fetch(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to get M-Pesa access token')
    }

    const data = await response.json()
    return data.access_token
  }

  async initiateSTKPush(request: MpesaPaymentRequest): Promise<MpesaResponse> {
    try {
      const accessToken = await this.getAccessToken()
      const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)
      const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64')

      const payload = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: request.amount,
        PartyA: request.phoneNumber,
        PartyB: this.shortcode,
        PhoneNumber: request.phoneNumber,
        CallBackURL: `${this.callbackUrl}/api/mpesa/callback`,
        AccountReference: `LIPANOW-${request.businessId}`,
        TransactionDesc: `Payment to ${request.businessId}`,
      }

      const response = await fetch(
        'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      const data = await response.json()

      if (data.ResponseCode === '0') {
        return {
          success: true,
          checkoutRequestID: data.CheckoutRequestID,
          merchantRequestID: data.MerchantRequestID,
        }
      } else {
        return {
          success: false,
          message: data.errorMessage || 'Failed to initiate STK push',
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

export const mpesaService = new MpesaService()
