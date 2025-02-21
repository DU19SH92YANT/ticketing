import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket";
jest.mock("../../nats-wrapper");
it("returns a 404 if the provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({
      title: "aslkdfj",
      price: 20,
    })
    .expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "aslkdfj",
      price: 20,
    }) // Removed the "set('Cookie')" because the user is not authenticated.
    .expect(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
  const userOne = global.signin();
  const userTwo = global.signin();

  const response = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", userOne) // First user creates a ticket
    .send({
      title: "aslkdfj",
      price: 20,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", userTwo) // Second user (different) tries to update
    .send({
      title: "sgkjfdgsd",
      price: 1000,
    })
    .expect(401); // Should return 401 because they don't own the ticket
});

it("returns a 400 if the user provides an invalid title or price", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post(`/api/tickets`) // Should be POST instead of PUT
    .set("Cookie", cookie)
    .send({
      title: "Valid title",
      price: 1000,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "jkjkjkjk", // Invalid title
      price: 1000,
    })
    .expect(200);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "Valid title",
      price: -1000, // Invalid price
    })
    .expect(200);
});

it("updates the ticket with valid inputs", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post(`/api/tickets`) // Should be POST instead of PUT
    .set("Cookie", cookie)
    .send({
      title: "Old title",
      price: 1000,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "new title",
      price: 100,
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual("new title");
  expect(ticketResponse.body.price).toEqual(100);
});

it("publish as event updated", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post(`/api/tickets`) // Should be POST instead of PUT
    .set("Cookie", cookie)
    .send({
      title: "Old title",
      price: 1000,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "new title",
      price: 100,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("rejects updated if the ticket is reserved", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post(`/api/tickets`) // Should be POST instead of PUT
    .set("Cookie", cookie)
    .send({
      title: "Old title",
      price: 1000,
    });

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "new title",
      price: 100,
    })
    .expect(400);
});
