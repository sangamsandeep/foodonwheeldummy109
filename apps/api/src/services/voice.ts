import twilio from 'twilio';
import { env } from '../config/env';

const twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

export async function makeOrderReadyCall(
  toPhone: string,
  orderNumber: number,
  orderId: string
): Promise<{ success: boolean; callSid?: string; error?: string; cost?: number }> {
  try {
    const twimlUrl = `${env.BASE_URL}/api/twilio/voice/order-ready?orderNumber=${orderNumber}`;
    const statusCallback = `${env.BASE_URL}/api/twilio/voice/status`;

    const call = await twilioClient.calls.create({
      url: twimlUrl,
      to: toPhone,
      from: env.TWILIO_FROM_NUMBER,
      statusCallback: statusCallback,
      statusCallbackEvent: ['completed', 'failed'],
      statusCallbackMethod: 'POST',
    });

    // Estimate call cost (typical US outbound call is $0.013/min, assume 30 seconds = $0.0065)
    const estimatedCostCents = 1; // 1 cent per call

    return {
      success: true,
      callSid: call.sid,
      cost: estimatedCostCents,
    };
  } catch (error: any) {
    console.error('Failed to make call:', error);
    return {
      success: false,
      error: error.message,
      cost: 0,
    };
  }
}

export function generateOrderReadyTwiML(orderNumber: number): string {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();
  
  twiml.say(
    {
      voice: 'Polly.Joanna',
      language: 'en-US',
    },
    `Your order number ${orderNumber} is ready for pickup. Thank you.`
  );

  return twiml.toString();
}
