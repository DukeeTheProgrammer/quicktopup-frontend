import { render, screen } from '@testing-library/react';
import App from './App';

test('renders QuickTopUp application without crashing', () => {
  render(<App />);
});
