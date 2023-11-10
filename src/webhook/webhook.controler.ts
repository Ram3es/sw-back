import { Body, Controller, Post, Headers } from '@nestjs/common';
import { Public } from 'src/auth/public.decorator';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private webhookService: WebhookService) {}
  @Public()
  @Post()
  verifyAuth(@Headers('des-labs-auth') hash: string, @Body() body: any) {
    const trustworthyWebhook = this.webhookService.checkWebhookHash(
      'APIKEY',
      hash,
    );
    // if (!trustworthyWebhook) {
    //   return console.error('Untrustworthy webhook received:');
    // }

    return { status: 200, message: 'ok' };
  }
}
