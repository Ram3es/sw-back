import { Injectable } from '@nestjs/common';
import crypto from 'crypto';
@Injectable()
export class WebhookService {
  checkWebhookHash = (apiKey, hash) => {
    // create sha256 hash of api key
    const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    return hash === apiKeyHash;
  };
}
