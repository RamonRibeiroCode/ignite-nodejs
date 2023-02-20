import fastify from "fastify";
// import { randomUUID } from "node:crypto";
import { knex } from "./database";

const app = fastify();

app.get("/", async (req, res) => {
  const transactions = await knex("transactions")
    .select("*")
    .where("amount", 1000);

  return transactions;
});

app.listen({ port: 3333 }).then((e) => {
  console.log("HTTP Server Running!");
});
