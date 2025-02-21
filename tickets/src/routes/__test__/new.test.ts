import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

jest.mock("../../nats-wrapper");

it("has a route hadler listening to /api/tickets for posts", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).not.toEqual(404);
});
it("it can only be accessed if the user is signed in", async () => {
  const response = await request(app).post("/api/tickets").send({}).expect(401);
});

it("return a status other than 401 if the user is signed in", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({});

  expect(response.status).not.toEqual(401);
});
it("return an error if an invalid is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "kjvsjkjd",
      price: 10,
    })
    .expect(201);
});
it("return an error if an invalid price is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "kjvsjkjd",
      price: -10,
    })
    .expect(400);
});
it("creates a tickets with valid inputs", async () => {
  let tickets = await Ticket.find({});
  const title = "asdf";
  expect(tickets.length).toEqual(0);
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title,
      price: 10,
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(10);
  expect(tickets[0].title).toEqual(title);
});

it("publishes an event", async () => {
  const title = "fsdjj";
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title,
      price: 10,
    })
    .expect(201);
  // console.log(natsWrapper, "fff");
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
