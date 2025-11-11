import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly SMS_API_URL = 'http://bhashsms.com/api/sendmsg.php';
  private readonly SMS_USER = 'paisaads';
  private readonly SMS_PASS = '123456';
  private readonly SMS_SENDER = 'PSADDS';

  async sendOtp(phoneNumber: string, otp: string): Promise<boolean> {
    try {
      const message = `Your One Time Password (OTP) for login is ${otp}. Please do not share the OTP with anyone. Best Regards, www.PaisaAds.com - contact@PaisaAds.com`;

      const params = {
        user: this.SMS_USER,
        pass: this.SMS_PASS,
        sender: this.SMS_SENDER,
        phone: phoneNumber,
        text: message,
        priority: 'ndnd',
        stype: 'normal',
      };

      this.logger.log(`Sending OTP to ${phoneNumber}`);

      const response = await axios.get(this.SMS_API_URL, { params });

      this.logger.log(`SMS API Response: ${response.data}`);

      return response.status === 200;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${phoneNumber}:`, error.message);
      return false;
    }
  }
}
