import * as bcrypt from "bcryptjs";
import { env } from "./env";


const SALT_ROUNDS = env.SALT_ROUNDS;

export async function hashPassword(plainPassword: string) {
    const hash = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    return hash;
}


export async function checkPassword(plainPassword: string, hashPassword: string) {
    // console.log('hashPassword', hashPassword);
    // console.log('plainPassword', plainPassword);
    const match = await bcrypt.compare(plainPassword, hashPassword);
    // console.log('match', match);
    return match ? true : false

}


// rounds=8 : ~40 hashes/sec
// rounds=9 : ~20 hashes/sec
// rounds=10: ~10 hashes/sec
// rounds=11: ~5  hashes/sec
// rounds=12: 2-3 hashes/sec