import argon2 from 'argon2';

export async function hashPassword(plainPassword: string): Promise<string> {
    return await argon2.hash(plainPassword, {
        type: argon2.argon2id,  // Use Argon2id variant for secure password hashing
        memoryCost: 2 ** 16,    // Memory cost in KiB (64 MiB recommended)
        timeCost: 4,            // Number of iterations (adjust to balance security vs. performance)
        parallelism: 1          // Degree of parallelism (1 thread; adjust for server capabilities)
    });
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await argon2.verify(hashedPassword, plainPassword);
}