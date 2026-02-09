import { createClient, type RedisClientType } from "redis";
import { env } from "../config/env.js";

const redisClient: RedisClientType = createClient({
  url: env.REDIS_URL!,
});

redisClient.on("error", (err) => console.error("❌ Redis Client Error", err));
redisClient.on("connect", () => console.log("🚀 Redis Connected!"));

// connect redis
(async () => {
  await redisClient.connect();
})();

export default redisClient;
