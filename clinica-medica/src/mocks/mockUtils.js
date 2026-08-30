const MOCK_DELAY = 360;

export function waitMock(ms = MOCK_DELAY) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function clone(data) {
  return structuredClone(data);
}

export function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function normalizeSearch(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
