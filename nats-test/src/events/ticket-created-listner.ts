import { Message } from "node-nats-streaming";
import { Listener } from "./base-listner";
import { TicketCreatedEvent } from "./ticket-created-event";
import { Subjects } from "./subject";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = "payment-service";

  onMessage(data: TicketCreatedEvent["data"], msg: Message): void {
    console.log("Event data!", data);
    console.log(data.id);
    console.log(data.title);
    msg.ack();
  }
}
