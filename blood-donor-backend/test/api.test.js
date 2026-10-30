const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../index');

describe('Blood Donation Management System API Suite', () => {
  let server;
  let baseUrl;

  before((done) => {
    // Start test server on ephemeral port
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      done();
    });
  });

  after((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  test('GET /api/health returns online status and system metadata', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'online');
    assert.strictEqual(data.system, 'Blood Donation Management System API');
  });

  test('POST /api/chatbot answers eligibility questions with clinical guidelines', async () => {
    const res = await fetch(`${baseUrl}/api/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'What are the donor eligibility criteria?' })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.reply.includes('Eligibility'));
    assert.ok(data.reply.includes('18 to 65'));
    assert.ok(data.reply.includes('90 days'));
  });

  test('POST /api/chatbot explains blood compatibility', async () => {
    const res = await fetch(`${baseUrl}/api/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Tell me about blood compatibility' })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.reply.includes('Universal'));
  });

  test('POST /api/auth/register rejects missing fields with 400', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }) // Missing name & password
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.ok(data.msg.includes('Please provide name'));
  });

  test('POST /api/auth/register rejects short passwords under 6 characters', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Short Pass', email: 'short@example.com', password: '123' })
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.ok(data.msg.includes('at least 6 characters'));
  });

  test('POST /api/auth/login rejects empty payload with 400', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.strictEqual(res.status, 400);
  });

  test('POST /api/requests rejects request with missing required patient details', async () => {
    const res = await fetch(`${baseUrl}/api/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientName: 'Only Name' })
    });
    assert.strictEqual(res.status, 400);
  });

  test('GET /api/nonexistent returns 404 JSON', async () => {
    const res = await fetch(`${baseUrl}/api/nonexistent`);
    assert.strictEqual(res.status, 404);
    const data = await res.json();
    assert.ok(data.msg.includes('not found'));
  });
});

