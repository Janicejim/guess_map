import * as bcrypt from "bcryptjs";
import { env } from "./env";


const SALT_ROUNDS = env.SALT_ROUNDS;

export async function hashPassword(plainPassword: string) {
    const hash = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    return hash;
}


export async function checkPassword(plainPassword: string, hashPassword: string) {
    const match = await bcrypt.compare(plainPassword, hashPassword);
    return match ? true : false

}

