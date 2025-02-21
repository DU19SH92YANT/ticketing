import { Publisher, Subjects, TicketUpdatedEvent } from "@dksticketing/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
