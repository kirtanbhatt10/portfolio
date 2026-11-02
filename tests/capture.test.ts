import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseFilter, printable, toPacket } from '../lib/capture.ts';
import { HOSTILE, intercept, SELF_INJECTION } from '../lib/intercept.ts';
import { projects } from '../lib/projects.ts';

const names = (expr: string) => {
  const f = parseFilter(expr, projects);
  assert.ok(f.ok, `${expr} should be valid`);
  return projects.filter(f.test).map((p) => p.slug);
};

test('capture: every byte belongs to exactly one field, in order', () => {
  for (const p of projects) {
    const { bytes, fields } = toPacket(p);
    assert.equal(fields[0].start, 0);
    for (let i = 1; i < fields.length; i++) assert.equal(fields[i].start, fields[i - 1].end);
    assert.equal(fields.at(-1)!.end, bytes.length);
    assert.equal(new TextDecoder().decode(bytes.slice(fields[0].start, fields[0].end)), p.name + '\n');
  }
  assert.equal(printable(0x41), 'A');
  assert.equal(printable(0x0a), '.');
});

test('filter: empty shows everything, protocols and fields work like Wireshark', () => {
  assert.equal(names('').length, projects.length);
  assert.deepEqual(names('http'), ['headerhawk']);
  assert.deepEqual(names('proto == LLM'), ['promptshield']);
  assert.deepEqual(names('demo'), ['promptshield', 'headerhawk', 'cybersec-arsenal']);
  assert.deepEqual(names('!demo && kind == security'), ['sentinel', 'codesec']);
  assert.ok(names('stack contains python').includes('cybersec-arsenal'));
  assert.deepEqual(names('kind == ai || role contains founder'), ['undertone', 'zenny', 'sugam']);
  assert.deepEqual(names('name matches "^s"'), ['sentinel', 'sugam', 'solaris']);
});

test('filter: bad expressions are rejected with a reason', () => {
  for (const bad of ['python', 'colour == red', 'proto ==', 'name matches "("']) {
    const f = parseFilter(bad, projects);
    assert.equal(f.ok, false, bad);
    if (!f.ok) assert.ok(f.error.length > 0);
  }
});

test('intercept: the self-injection and every hostile payload are stopped', () => {
  assert.equal(intercept(SELF_INJECTION).outcome, 'blocked');
  assert.equal(intercept(SELF_INJECTION).rule, 'instruction_override');
  for (const h of HOSTILE) assert.notEqual(intercept(h).outcome, 'allowed', h);
});

test('intercept: ordinary messages and links get through', () => {
  assert.equal(intercept('Great portfolio, the packet capture is a nice touch!').outcome, 'allowed');
  assert.equal(intercept('https://github.com/kirtanbhatt10').outcome, 'allowed');
  assert.equal(intercept('http://paypa1.com/webscr?cmd=login').detector, 'Phish analyser');
});
