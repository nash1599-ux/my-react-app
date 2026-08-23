import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import { STORAGE_KEY } from './data/board';

beforeEach(() => {
  window.localStorage.removeItem(STORAGE_KEY);
});

test('renders the G-Unit salesboard snapshot', () => {
  render(<App />);
  expect(screen.getByText(/G-UNIT SALES BOARD/i)).toBeInTheDocument();
  expect(screen.getByText(/Jordan Aguirre/i)).toBeInTheDocument();
  expect(screen.getByText(/Team goal/i)).toBeInTheDocument();
  expect(screen.getByText(/Cancun bonus/i)).toBeInTheDocument();
  expect(screen.getByText(/Week apps/i)).toBeInTheDocument();
  expect(screen.getByText("56")).toBeInTheDocument();
});

test('updates ranks from pasted scoreboard text', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /paste a new scoreboard/i }));
  fireEvent.change(screen.getByLabelText(/paste slack scoreboard text/i), {
    target: {
      value: 'DG: 4/10 | 3 NL LEFT | Sunday\n1. Quay Tyler 12 Apps | 8 CX',
    },
  });
  fireEvent.click(screen.getByRole('button', { name: /update board/i }));

  expect(screen.getByText(/Quay Tyler/i)).toBeInTheDocument();
  expect(screen.getByText(/Board updated from pasted text/i)).toBeInTheDocument();
});
