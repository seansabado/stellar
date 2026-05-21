const baseUrl = new URL(process.env.SMOKE_BASE_URL ?? "https://stellar.laundromatai.app");
const maxAttempts = Number.parseInt(process.env.SMOKE_MAX_ATTEMPTS ?? "12", 10);
const delayMs = Number.parseInt(process.env.SMOKE_RETRY_DELAY_MS ?? "30000", 10);

const checks = [
  {
    path: "/",
    expectedType: "text/html",
    contains: ["StellarPay", "Dashboard", "Orders", "Profile"],
  },
  {
    path: "/orders",
    expectedType: "text/html",
    contains: ["Orders"],
  },
  {
    path: "/profile",
    expectedType: "text/html",
    contains: ["Profile"],
  },
  {
    path: "/history",
    expectedType: "text/html",
  },
  {
    path: "/stelllar",
    expectedType: "text/html",
    contains: ["StellarPay"],
  },
  {
    path: "/stelllar/orders",
    expectedType: "text/html",
    contains: ["Orders"],
  },
  {
    path: "/stelllar/profile",
    expectedType: "text/html",
    contains: ["Profile"],
  },
  {
    path: "/stelllar/history",
    expectedType: "text/html",
  },
  {
    path: "/favicon.ico",
    expectedType: "image/x-icon",
  },
  {
    path: "/icon.svg",
    expectedType: "image/svg+xml",
  },
  {
    path: "/manifest.webmanifest",
    expectedType: "application/manifest+json",
  },
  {
    path: "/sw.js",
    expectedType: "application/javascript",
  },
  {
    path: "/robots.txt",
    expectedType: "text/plain",
    contains: ["User-Agent: *", "Disallow: /"],
  },
  {
    path: "/api/health",
    expectedType: "application/json",
    contains: ['"status":"ok"'],
  },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function matchesContentType(actual, expected) {
  const normalizedActual = actual.toLowerCase();
  const normalizedExpected = expected.toLowerCase();

  if (normalizedExpected === "application/javascript") {
    return normalizedActual.includes("application/javascript")
      || normalizedActual.includes("text/javascript");
  }

  if (normalizedExpected === "application/manifest+json") {
    return normalizedActual.includes("application/manifest+json")
      || normalizedActual.includes("application/json");
  }

  return normalizedActual.includes(normalizedExpected);
}

async function runCheck(check) {
  const url = new URL(check.path, baseUrl);
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "cache-control": "no-cache",
    },
  });

  const body = await response.text();
  const contentType = response.headers.get("content-type") ?? "";
  const issues = [];

  if (!response.ok) {
    issues.push(`status ${response.status}`);
  }

  if (check.expectedType && !matchesContentType(contentType, check.expectedType)) {
    issues.push(`content-type ${contentType || "missing"}`);
  }

  for (const expectedText of check.contains ?? []) {
    if (!body.includes(expectedText)) {
      issues.push(`missing text ${JSON.stringify(expectedText)}`);
    }
  }

  return {
    path: check.path,
    url: url.toString(),
    status: response.status,
    contentType,
    issues,
  };
}

async function runAttempt(attemptNumber) {
  const results = [];

  for (const check of checks) {
    try {
      results.push(await runCheck(check));
    } catch (error) {
      results.push({
        path: check.path,
        url: new URL(check.path, baseUrl).toString(),
        status: -1,
        contentType: "",
        issues: [error instanceof Error ? error.message : String(error)],
      });
    }
  }

  const failures = results.filter((result) => result.issues.length > 0);

  console.log(`Attempt ${attemptNumber}/${maxAttempts} against ${baseUrl.toString()}`);
  for (const result of results) {
    const statusLabel = result.issues.length > 0 ? "FAIL" : "OK";
    console.log(`${statusLabel} ${result.status} ${result.path} [${result.contentType || "no-content-type"}]`);
    if (result.issues.length > 0) {
      console.log(`  ${result.issues.join("; ")}`);
    }
  }

  return failures;
}

async function main() {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const failures = await runAttempt(attempt);
    if (failures.length === 0) {
      console.log("Smoke test passed.");
      return;
    }

    if (attempt < maxAttempts) {
      console.log(`Smoke test failed. Retrying in ${delayMs}ms.`);
      await sleep(delayMs);
    }
  }

  console.error("Smoke test failed after all retry attempts.");
  process.exitCode = 1;
}

await main();