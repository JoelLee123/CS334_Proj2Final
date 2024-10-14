import { act } from 'react';  // Import `act` from react
import { render, screen } from '@testing-library/react';
import App from './frontend/pages/App'; // Adjust the path according to your project structure

test('renders the welcome message parts', () => {
    render(<App />);
  const welcomePart = screen.getByText(/Welcome to/i);
  const scribeMarkPart = screen.getByText(/ScribeMark/i);
  expect(welcomePart).toBeInTheDocument();
  expect(scribeMarkPart).toBeInTheDocument();
});
