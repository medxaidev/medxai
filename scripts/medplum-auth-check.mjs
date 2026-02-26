/**
 * Quick script to find Medplum ClientApplication credentials
 * and test the auth flow. Disposable — delete after use.
 */
import pg from "pg";

const pool = new pg.Pool({
  host: "localhost",
  port: 5433,
  database: "medplum_next",
  user: "postgres",
  password: "assert",
});

async function main() {
  // Read ClientApplication content (TEXT column, not JSONB)
  const clientApps = await pool.query(
    `SELECT id, content FROM "ClientApplication" LIMIT 10`
  );
  const rows = clientApps.rows.map((r) => {
    const c = typeof r.content === "string" ? JSON.parse(r.content) : r.content;
    return { id: c.id || r.id, secret: c.secret, name: c.name };
  });
  console.log("=== ClientApplications ===");
  for (const row of rows) {
    console.log(`  id=${row.id}  name=${row.name}  secret=${row.secret || "null"}`);
  }

  // 2. Try client_credentials with first app that has a secret
  const appWithSecret = rows.find((r) => r.secret);
  if (appWithSecret) {
    console.log(`\n=== Trying client_credentials with ${appWithSecret.name} (${appWithSecret.id}) ===`);
    const tokenRes = await fetch("http://localhost:8103/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=client_credentials&client_id=${appWithSecret.id}&client_secret=${appWithSecret.secret}`,
    });
    console.log("token status:", tokenRes.status);
    const tokenJson = await tokenRes.json();
    if (tokenJson.access_token) {
      console.log("GOT ACCESS TOKEN, length:", tokenJson.access_token.length);

      // 3. Test FHIR create
      const patRes = await fetch("http://localhost:8103/fhir/R4/Patient", {
        method: "POST",
        headers: {
          "Content-Type": "application/fhir+json",
          Authorization: `Bearer ${tokenJson.access_token}`,
        },
        body: JSON.stringify({ resourceType: "Patient" }),
      });
      console.log("\ncreate Patient status:", patRes.status);
      const patJson = await patRes.json();
      console.log("patient:", JSON.stringify(patJson).substring(0, 300));
    } else {
      console.log("token error:", JSON.stringify(tokenJson));
    }
  } else {
    console.log("\nNo ClientApplication with secret found.");
    console.log("Trying login flow with code_challenge...");

    // Try login + token exchange with code_challenge
    const loginRes = await fetch("http://localhost:8103/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "medplum_admin",
        scope: "openid",
        codeChallenge: "plain_challenge_value",
        codeChallengeMethod: "plain",
      }),
    });
    const loginJson = await loginRes.json();
    console.log("login:", JSON.stringify(loginJson));

    const tokenRes = await fetch("http://localhost:8103/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=authorization_code&code=${loginJson.code}&code_verifier=plain_challenge_value`,
    });
    console.log("token status:", tokenRes.status);
    const tokenJson = await tokenRes.json();
    if (tokenJson.access_token) {
      console.log("GOT ACCESS TOKEN via PKCE, length:", tokenJson.access_token.length);
    } else {
      console.log("token error:", JSON.stringify(tokenJson));
    }
  }

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  pool.end();
});
