module.exports = {
    preset: 'ts-jest',
    transform: {
      '^.+\\.svelte$': 'svelte-jester',
      '^.+\\.ts$': 'ts-jest',
    },
    moduleFileExtensions: ['js', 'ts', 'svelte'],
    // setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  };
  