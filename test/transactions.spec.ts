import { expect, it, beforeAll, afterAll, describe, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { execSync } from "child_process";

describe("Transactions Routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  afterAll(async () => {
    await app.close();
  });

  it("should be able to create a new transaction", async () => {
    await request(app.server)
      .post("/transactions")
      .send({
        title: "Freelancer",
        amount: 2000,
        type: "credit",
      })
      .expect(201);
  });

  it("should be able to list all transactions", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "Freelancer",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionResponse.get("Set-Cookie");

    const response = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    expect(response.body.transactions).toEqual([
      expect.objectContaining({
        title: "Freelancer",
        amount: 5000,
      }),
    ]);
  });

  it("should be able to get a specific transactions", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "Freelancer",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionResponse.get("Set-Cookie");

    const listTransactionsResponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    const [{ id }] = listTransactionsResponse.body.transactions;

    const response = await request(app.server)
      .get(`/transactions/${id}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(response.body.transaction).toEqual(
      expect.objectContaining({
        title: "Freelancer",
        amount: 5000,
      })
    );
  });

  it("should be able to get the summary", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "Freelancer",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionResponse.get("Set-Cookie");

    await request(app.server)
      .post("/transactions")
      .send({
        title: "Freelancer",
        amount: 2000,
        type: "debit",
      })
      .set("Cookie", cookies);

    const response = await request(app.server)
      .get("/transactions/summary")
      .set("Cookie", cookies)
      .expect(200);

    expect(response.body.summary).toEqual(
      expect.objectContaining({
        amount: 3000,
      })
    );
  });
});
