import "server-only";
import { hashPassword } from "better-auth/crypto";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";

const accountInput = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(320).toLowerCase(),
  password: z.string().min(10).max(128),
  role: z.enum(["super_admin", "admin", "editor", "journalist", "reader"]),
});

/** Only call after an administrator or bootstrap authorization check. */
export async function provisionCredentialAccount(
  input: z.infer<typeof accountInput>,
  initialAdmin = false,
): Promise<{ id: string }> {
  const data = accountInput.parse(input);
  if (initialAdmin && data.role !== "super_admin") throw new Error("Invalid bootstrap role");
  const passwordHash = await hashPassword(data.password);
  const id = crypto.randomUUID();
  // Neon HTTP supports atomic batches, not interactive db.transaction().
  // Serialize bootstrap checks, including requests using different emails.
  const [, created] = await db.batch([
    db.execute(sql`LOCK TABLE "user" IN SHARE ROW EXCLUSIVE MODE`),
    db.execute(sql`
      INSERT INTO "user" (id, name, email, role)
      SELECT ${id}, ${data.name}, ${data.email}, ${data.role}
      WHERE NOT EXISTS (SELECT 1 FROM "user" WHERE email = ${data.email})
        AND (NOT ${initialAdmin} OR NOT EXISTS (
          SELECT 1 FROM "user" WHERE role = 'super_admin'
        ))
      RETURNING id
    `),
    db.execute(sql`
      INSERT INTO account (id, user_id, account_id, provider_id, password)
      SELECT ${crypto.randomUUID()}, id, id, 'credential', ${passwordHash}
      FROM "user" WHERE id = ${id}
    `),
  ]);
  if (created.rows.length === 0) {
    throw new Error(initialAdmin ? "Initial admin already exists" : "An account with this email already exists");
  }
  return { id };
}
