import { Ticket } from "../ticket";

it("implements optimistic concurrency control", async () => {
  // await secondInstance!.save();
  const ticket = Ticket.build({
    title: "concert",
    price: 5,
    userId: "123",
  });

  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  firstInstance?.set({ price: 10 });
  secondInstance?.set({ price: 15 });

  try {
    await firstInstance!.save();
  } catch (error) {
    return;
  }

  try {
    await secondInstance!.save();
  } catch (error) {
    return;
  }
});

it("increments the version number on multiple saves", async () => {
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
    userId: "123",
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
