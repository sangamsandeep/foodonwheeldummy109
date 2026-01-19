import twilio from 'twilio';
import { env } from '../config/env';

const twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

export async function sendOTPSMS(
  toPhone: string,
  orderNumber: number,
  otp: string
): Promise<{ success: boolean; sid?: string; error?: string; cost?: number }> {
  try {
    const message = await twilioClient.messages.create({
      body: `Your pickup OTP for order #${orderNumber} is ${otp}`,
      from: env.TWILIO_FROM_NUMBER,
      to: toPhone,
    });

    // Estimate SMS cost (typical US SMS cost is $0.0075-$0.01)
    const estimatedCostCents = 1; // 1 cent per SMS

    return {
      success: true,
      sid: message.sid,
      cost: estimatedCostCents,
    };
  } catch (error: any) {
    console.error('Failed to send SMS:', error);
    return {
      success: false,
      error: error.message,
      cost: 0,
    };
  }
}
