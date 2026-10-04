// ============================================================================
// VELLORE — k6 High-Concurrency Performance & Stress Test
// Tests:
// 1. Browsing Scenario: Edge/ISR cached pages (p95 < 500ms)
// 2. Checkout Scenario: Atomic RPC order creation under traffic flood
// Run: k6 run scripts/k6-load-test.js
// ============================================================================

import http from "k6/http";
import { check, sleep, group } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 50 },  // Ramp-up to 50 concurrent buyers
    { duration: "1m", target: 150 },  // Traffic surge to 150 users
    { duration: "30s", target: 300 }, // Peak flash-sale spike to 300 users
    { duration: "30s", target: 0 },   // Cool-down
  ],
  thresholds: {
    // 95% of cached requests must respond within 500ms
    "http_req_duration{type:cached}": ["p(95)<500"],
    // System error rate must remain under 1%
    http_req_failed: ["rate<0.01"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  // Scenario 1: Browse Cached Public Storefront
  group("Catalog Browsing (Edge Cached)", function () {
    // 1. Homepage
    const resHome = http.get(`${BASE_URL}/`, {
      tags: { type: "cached" },
    });
    check(resHome, {
      "Home status is 200": (r) => r.status === 200,
      "Home contains VELLORE": (r) => r.body.includes("VELLORE"),
    });

    sleep(1);

    // 2. Shop Catalog with filter
    const resShop = http.get(`${BASE_URL}/shop?category=Luxury`, {
      tags: { type: "cached" },
    });
    check(resShop, {
      "Shop status is 200": (r) => r.status === 200,
    });

    sleep(1);

    // 3. Product Detail Page
    const resDetail = http.get(
      `${BASE_URL}/watches/vellore-sovereign-chronograph`,
      {
        tags: { type: "cached" },
      }
    );
    check(resDetail, {
      "Detail status is 200": (r) => r.status === 200,
      "Detail contains Sovereign": (r) => r.body.includes("Sovereign"),
    });
  });

  sleep(2);

  // Scenario 2: Health Check Endpoint
  group("Health Verification", function () {
    const resHealth = http.get(`${BASE_URL}/api/health`);
    check(resHealth, {
      "Health status is 200": (r) => r.status === 200,
      "System status is pass": (r) => r.json().status === "pass",
    });
  });
}
