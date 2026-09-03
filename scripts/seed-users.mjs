import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  try {
    const content = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local optional if vars are already set
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const users = [
  { email: "admin@trading.com", password: "password", name: "Admin", role: "admin" },
  { email: "client@trading.com", password: "password", name: "Client", role: "investor" },
];

const { data: existingData, error: listError } = await supabase.auth.admin.listUsers();

if (listError) {
  console.error("Cannot list users:", listError.message);
  console.error("→ As-tu bien lancé la migration SQL sur Supabase ?");
  process.exit(1);
}

const existingUsers = existingData?.users ?? [];

for (const user of users) {
  const found = existingUsers.find((u) => u.email === user.email);

  if (found) {
    const { error } = await supabase.from("profiles").upsert({
      id: found.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    if (error) {
      console.error(`Profile update failed for ${user.email}:`, error.message);
    } else {
      console.log(`Updated profile: ${user.email} → ${user.role}`);
    }
    continue;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { name: user.name },
  });

  if (error) {
    console.error(`Failed to create ${user.email}:`, error.message);
    continue;
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: data.user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  if (profileError) {
    console.error(`Profile failed for ${user.email}:`, profileError.message);
  } else {
    console.log(`Created: ${user.email} → ${user.role}`);
  }
}

console.log("Seed terminé.");
