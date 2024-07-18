import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { captureDto, refundDto } from './dto/paypal.dto';

@Injectable()
export class PaypalService {
  private clientId: string;
  private clientSecret: string;
  private paypalApiBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('PAYPAL_SECRET_KEY');
    this.paypalApiBaseUrl = this.configService.get<string>('PAYPAL_BASE_URL');
  }

  async createPayment(req:any, body:any) {
    try {
      let { amount } = body;
      let { _id: user_id } = req.user_data
      const response = await axios.post(
        `${this.paypalApiBaseUrl}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: 'USD',
                value: amount,
              },
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await this.getAccessToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating PayPal payment:', error.response.data);
      throw new Error('Error creating PayPal payment');
    }
  }

  async capturePayment(req:any, body: captureDto) {
    try {
      let { paymentId } = body;
      let { _id: user_id } = req.user_data;
      const response = await axios.post(
        `${this.paypalApiBaseUrl}/v2/checkout/orders/${paymentId}/capture`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await this.getAccessToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error capturing PayPal payment:', error.response.data);
      throw new Error('Error capturing PayPal payment');
    }
  }

  async refundPayment(req: any, body: refundDto) {
    try {
      const { captureId, amount } = body;
      const accessToken = await this.getAccessToken();
      const data = amount ? { amount: { value: amount, currency_code: 'USD' } } : {};
      const response = await axios.post(
        `${this.paypalApiBaseUrl}/v2/payments/captures/${captureId}/refund`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error refunding PayPal payment:', error.response?.data || error.message);
      throw new Error('Error refunding PayPal payment');
    }
  }

  private async getAccessToken() {
    try {
      const response = await axios.post(
        `${this.paypalApiBaseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(
              `${this.clientId}:${this.clientSecret}`
            ).toString('base64')}`,
          },
        }
      );
      return response.data.access_token;
    } catch (error) {
      console.error('Error getting access token:', error.response.data);
      throw new Error('Error getting access token');
    }
  }
}

