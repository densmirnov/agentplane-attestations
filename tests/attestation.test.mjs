import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createAttestation, verifyAttestation } from '../src/lib/attestation.mjs';

function loadJson(filePath) {
  return JSON.parse(readFileSync(new URL(filePath, import.meta.url), 'utf8'));
}

test('passing evidence generates a trusted attestation', () => {
  const evidence = loadJson('../examples/passing-evidence.json');
  const attestation = createAttestation(evidence);
  const verification = verifyAttestation(attestation);

  assert.equal(verification.integrityValid, true);
  assert.equal(verification.verdict, 'trusted');
  assert.equal(verification.policySatisfied, true);
  assert.match(attestation.attestationId, /^att-/);
});

test('failing evidence generates a rejected attestation', () => {
  const evidence = loadJson('../examples/failing-evidence.json');
  const attestation = createAttestation(evidence);
  const verification = verifyAttestation(attestation);

  assert.equal(verification.integrityValid, true);
  assert.equal(verification.verdict, 'reject');
  assert.equal(verification.policySatisfied, false);
  assert.ok(verification.warnings.length > 0);
});
