import { canonicalize } from './canonical-json.mjs';
import { validateArtifactBundle } from './artifact-bundle.mjs';

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function createAdapterArtifact({
  artifactId,
  kind,
  generatedAt,
  producer,
  subjectRef,
  mediaType = 'application/json',
  payload,
  locator
}) {
  return canonicalize({
    artifactId,
    kind,
    generatedAt,
    producer,
    subjectRef,
    mediaType,
    ...(locator ? { locator } : {}),
    payload
  });
}

export function defineRuntimeAdapter(definition) {
  const errors = [];

  if (!definition || typeof definition !== 'object') {
    throw new Error('Runtime adapter definition must be an object.');
  }
  if (!isNonEmptyString(definition.adapterId)) {
    errors.push('adapterId must be a non-empty string.');
  }
  if (!isNonEmptyString(definition.runtime)) {
    errors.push('runtime must be a non-empty string.');
  }
  if (!isNonEmptyString(definition.version)) {
    errors.push('version must be a non-empty string.');
  }
  if (typeof definition.adapt !== 'function') {
    errors.push('adapt must be a function.');
  }

  if (errors.length > 0) {
    throw new Error(`Invalid runtime adapter definition:\n- ${errors.join('\n- ')}`);
  }

  return Object.freeze({
    description: '',
    ...definition
  });
}

function buildAdapterMetadata(adapter) {
  return {
    adapterId: adapter.adapterId,
    runtime: adapter.runtime,
    version: adapter.version,
    description: adapter.description || ''
  };
}

export function adaptRuntimeSnapshot({ adapter, snapshot }) {
  const bundle = canonicalize({
    ...adapter.adapt(snapshot),
    adapter: buildAdapterMetadata(adapter)
  });

  const validation = validateArtifactBundle(bundle);
  if (!validation.valid) {
    throw new Error(`Adapter output is not a valid artifact bundle:\n- ${validation.errors.join('\n- ')}`);
  }

  return bundle;
}
