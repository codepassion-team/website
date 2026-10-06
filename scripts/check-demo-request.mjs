import assert from "node:assert/strict";
import {
  validateDemoRequest,
  submitDemoRequest,
} from "../src/lib/demo-request.ts";

const valid = {
  name: "  สมชาย ",
  company: " Lab Co. / สอบเทียบ ",
  channel: "phone",
  contact: "081-234 5678",
  topic: "",
};

// Valid request is trimmed and normalized
{
  const result = validateDemoRequest(valid);
  assert.equal(result.ok, true);
  assert.deepEqual(result.value, {
    name: "สมชาย",
    company: "Lab Co. / สอบเทียบ",
    channel: "phone",
    contact: "0812345678",
    topic: "",
  });
}

// Name, company, channel and contact are required
{
  const result = validateDemoRequest({
    name: " ",
    company: "",
    channel: "",
    contact: "",
    topic: "",
  });
  assert.equal(result.ok, false);
  assert.deepEqual(Object.keys(result.errors).sort(), [
    "channel",
    "company",
    "contact",
    "name",
  ]);
}

// Contact must match the chosen channel
for (const [channel, contact, ok] of [
  ["phone", "0812345678", true],
  ["phone", "+66 81 234 5678", true],
  ["phone", "02-123-4567", true],
  ["phone", "12345", false],
  ["phone", "hello@example.com", false],
  ["email", "hello@example.com", true],
  ["email", "hello@", false],
  ["email", "0812345678", false],
  ["line", "@codepassion", true],
  ["line", "somchai.k", true],
  ["line", "has space", false],
  ["fax", "0812345678", false],
]) {
  const result = validateDemoRequest({ ...valid, channel, contact });
  assert.equal(result.ok, ok, `${channel}: ${contact}`);
  if (!ok) assert(result.errors.contact || result.errors.channel);
}

// Phone numbers are stored in one local format
assert.equal(
  validateDemoRequest({ ...valid, contact: "+66 81 234 5678" }).value.contact,
  "0812345678",
);

// Topic is optional but limited to known values
assert.equal(validateDemoRequest({ ...valid, topic: "documents" }).ok, true);
assert.equal(validateDemoRequest({ ...valid, topic: "other" }).ok, true);
assert.equal(validateDemoRequest({ ...valid, topic: "hack" }).ok, false);

// Overlong input is rejected
assert.equal(
  validateDemoRequest({ ...valid, name: "ก".repeat(121) }).ok,
  false,
);

const value = validateDemoRequest(valid).value;

// No endpoint configured never reports success
{
  let called = false;
  const result = await submitDemoRequest("", value, async () => {
    called = true;
    return new Response(null, { status: 200 });
  });
  assert.equal(result, "unconfigured");
  assert.equal(called, false);
}

// Success only on a 2xx response; payload is JSON with source
{
  let request;
  const result = await submitDemoRequest(
    "https://hooks.example.com/demo",
    value,
    async (url, init) => {
      request = { url, init };
      return new Response(null, { status: 201 });
    },
  );
  assert.equal(result, "success");
  assert.equal(request.url, "https://hooks.example.com/demo");
  assert.equal(request.init.method, "POST");
  assert.equal(request.init.headers["Content-Type"], "application/json");
  const body = JSON.parse(request.init.body);
  assert.equal(body.name, "สมชาย");
  assert.equal(body.source, "line-oa-customer-portal");
}

for (const respond of [
  async () => new Response(null, { status: 500 }),
  async () => new Response(null, { status: 302 }),
  async () => {
    throw new TypeError("network");
  },
]) {
  assert.equal(
    await submitDemoRequest("https://hooks.example.com/demo", value, respond),
    "error",
  );
}

console.log("PASS: demo request validation and submit outcomes.");
