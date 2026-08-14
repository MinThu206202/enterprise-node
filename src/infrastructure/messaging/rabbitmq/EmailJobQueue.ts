import { IEmailJobQueue, SendVerificationEmailJob } from "../../../application/services/queue/IEmailJobQueue.js";
import { rabbitmqClient } from "./rabbitmqClient.js";

const EMAIL_EXCHANGE = "enterprise.email";
const VERIFICATION_ROUTING_KEY = "email.verification";

export class EmailJobQueue implements IEmailJobQueue{
    constructor(
        private readonly rabbitMQClient : rabbitmqClient,
    ){}

    async addVerificationEmail(job: SendVerificationEmailJob): Promise<void> {
        const channel = this.rabbitMQClient.getChannel();

        await channel.assertExchange(EMAIL_EXCHANGE , "topic" ,{
            durable : true,
        })

        const message = Buffer.from(JSON.stringify(job));

        const published = channel.publish(
            EMAIL_EXCHANGE ,
            VERIFICATION_ROUTING_KEY,
            message,{
                persistent : true,
                contentType : "application/json"
            }
        );

   if (!published) {
      throw new Error(
        "Failed to enqueue verification email",
      );
    }
  }
}