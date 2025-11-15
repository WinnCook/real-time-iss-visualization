# Automated Tests

## Setup

Install test dependencies:
```bash
npm install
```

## Running Tests

### Run all tests:
```bash
npm test
```

### Run tests in watch mode (auto-rerun on file changes):
```bash
npm run test:watch
```

### Run tests with coverage report:
```bash
npm run test:coverage
```

## Test Structure

```
tests/
├── utils/           # Tests for utility modules
│   ├── time.test.js
│   ├── coordinates.test.js
│   ├── orbital.test.js
│   └── api.test.js
├── core/            # Tests for core Three.js modules
└── modules/         # Tests for feature modules
```

## Coverage Goals

- **Statements:** 50%
- **Branches:** 40%
- **Functions:** 50%
- **Lines:** 50%

## Writing New Tests

1. Create a new `.test.js` file in the appropriate directory
2. Import the module you want to test
3. Use Jest's `describe`, `test`, and `expect` functions
4. Run tests with `npm test`

### Example:
```javascript
import { describe, test, expect } from '@jest/globals';

describe('My Module', () => {
  test('should do something', async () => {
    const module = await import('../../src/utils/myModule.js');
    expect(module.myFunction()).toBe(42);
  });
});
```

## Current Test Coverage

### Utility Modules (4 test files)
- ✅ time.test.js - Time management and simulation
- ✅ coordinates.test.js - Geographic to 3D coordinate conversion
- ✅ orbital.test.js - Keplerian orbital mechanics
- ✅ api.test.js - ISS API integration

### To Do
- [ ] Core modules (scene, camera, renderer, animation)
- [ ] Feature modules (sun, planets, moon, ISS, etc.)
- [ ] UI module (event handlers, controls)
- [ ] Integration tests (full system tests)
