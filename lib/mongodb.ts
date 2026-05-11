import { Db, MongoClient } from "mongodb";

const mongoUri = process.env.MONGODB_STRING;
const mongoDbName = process.env.MONGODB_DB || "hremail";

declare global {
  // eslint-disable-next-line no-var
  var mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

export async function getDatabase(): Promise<Db> {
  if (!mongoUri) {
    throw new Error("MONGODB_STRING is not set");
  }

  if (!global.mongoClientPromise) {
    const client = new MongoClient(mongoUri);
    global.mongoClientPromise = client.connect();
  }

  clientPromise = global.mongoClientPromise;
  const client = await clientPromise;
  return client.db(mongoDbName);
}
