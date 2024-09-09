import '@testing-library/jest-dom/jest-globals'

// Allow router mocks.
// eslint-disable-next-line no-undef, global-require
jest.mock('next/router', () => require('next-router-mock'))
