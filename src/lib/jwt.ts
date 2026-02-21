import { JWT } from "@sholvoir/generic/jwt";

const jwt = new JWT({ iss: "micinfotech.com", sub: "dict" });
await jwt.importKey(Deno.env.get("APP_KEY"));

export default jwt;
