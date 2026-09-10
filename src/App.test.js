import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import { STORAGE_KEY } from './data/board';

beforeEach(() => {
  window.localStorage.removeItem(STORAGE_KEY);
});

test('renders last week production and the live board', () => {
  render(<App />);
  expect(screen.getByText(/G-UNIT SALES BOARD/i)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /this week team goal/i })).toBeInTheDocument();
  expect(screen.getByText(/Last week apps/i)).toBeInTheDocument();
  expect(screen.getByText("56")).toBeInTheDocument();
  expect(screen.getAllByText(/Jordan #23/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Steveo Ramos/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Mackenzie Faith/i).length).toBeGreaterThan(0);
  expect(screen.getByLabelText(/set nl target/i)).toHaveValue(69);
});

test('updates this week from pasted scoreboard text', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /paste a scoreboard/i }));
  fireEvent.change(screen.getByLabelText(/paste slack scoreboard text/i), {
    target: {
      value: 'DG: 1/10 | 27 NL LEFT | Monday\n1. Quay Tyler 2 Apps | 1 CX',
    },
  });
  fireEvent.click(screen.getByRole('button', { name: /update this week/i }));

  expect(screen.getAllByText(/Quay Tyler/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/This week updated from pasted text/i)).toBeInTheDocument();
  expect(screen.getByText("56")).toBeInTheDocument();
});

test('saves a pasted board as last week final without changing this week', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /paste a scoreboard/i }));
  fireEvent.change(screen.getByLabelText(/paste slack scoreboard text/i), {
    target: {
      value: '1. Jordan Aguirre 20 Apps | 9 CX',
    },
  });
  fireEvent.click(screen.getByRole('button', { name: /save as last week final/i }));

  expect(
    screen.getByText(/Last week final updated from Saturday\/Sunday paste/i)
  ).toBeInTheDocument();
  expect(screen.getAllByText("20").length).toBeGreaterThan(0);
  expect(screen.getByText(/This week apps/i).closest("article")).toHaveTextContent("21");
});

test('logs a #g-unit phone sale onto the live board', () => {
  render(<App />);

  fireEvent.change(screen.getByLabelText(/rep or slack name/i), {
    target: { value: "Gigi" },
  });
  fireEvent.change(screen.getByLabelText(/#g-unit post/i), {
    target: { value: "2 phones #g-unit" },
  });
  fireEvent.click(screen.getByRole("button", { name: /log sale/i }));

  expect(screen.getByText(/Gianna Smith \+2 phones from #g-unit/i)).toBeInTheDocument();
  expect(screen.getByText(/Live #g-unit sales/i)).toBeInTheDocument();
  expect(screen.getByText(/2 phones #g-unit/i)).toBeInTheDocument();
});
