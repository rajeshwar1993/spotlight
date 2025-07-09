import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup MSW server for testing
export const server = setupServer(...handlers);

// Reset handlers between tests
export function resetHandlers() {
  server.resetHandlers();
}

// Add custom handlers for specific tests
export function addHandlers(...newHandlers: Parameters<typeof server.use>) {
  server.use(...newHandlers);
}

// Remove all handlers
export function removeHandlers() {
  server.resetHandlers();
}

export { handlers };