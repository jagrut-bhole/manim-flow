import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

export async function createApiKey() {
    const secret = nanoid(40);

    const apiKey = `sk_${secret}`;

    const hash = await bcrypt.hash(secret, 10);

    return {
        apiKey,
        hash,
        secret,
    };
}
