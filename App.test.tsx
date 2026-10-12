import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

const SAMPLE = [
  '12/03/2024, 09:12 - Messages and calls are end-to-end encrypted.',
  '12/03/2024, 09:13 - Aarav Mehta: Morning! Did you see the *new* build?',
  '12/03/2024, 09:14 - Priya Nair: Yes! Looks gorgeous',
  '12/03/2024, 09:15 - Priya Nair: Sending you the export now',
  '12/03/2024, 09:16 - Priya Nair: <Media omitted>',
  '12/03/2024, 09:17 - Aarav Mehta: Perfect, thanks!',
].join('\n');

const bubbles = () => Array.from(document.querySelectorAll('.bubble'));
const outgoing = () =>
  bubbles().filter((bubble) => bubble.parentElement?.className.includes('justify-end'));

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, '', '/?chat=/sample-chat.txt');
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(SAMPLE, { status: 200, headers: { 'Content-Type': 'text/plain' } }))
  );
});

const renderLoadedChat = async () => {
  render(<App />);
  await waitFor(() => expect(bubbles().length).toBeGreaterThan(0));
};

describe('App (Android shell)', () => {
  it('loads a chat from the URL, showing every message and a load confirmation', async () => {
    await renderLoadedChat();
    // One of the six entries is a system notice, which renders as a chip.
    expect(bubbles()).toHaveLength(5);
    expect(screen.getByText(/Loaded 6 messages from 2 participants/)).toBeTruthy();
  });

  it('renders the other participant as the chat title', async () => {
    await renderLoadedChat();
    expect(screen.getAllByText('Aarav Mehta').length).toBeGreaterThan(0);
  });

  it('renders the most active participant\'s messages on the right (WhatsApp style)', async () => {
    await renderLoadedChat();
    // Priya (3 messages) is assumed to be the device owner.
    expect(outgoing()).toHaveLength(3);
    expect(outgoing()[0].className).toContain('d9fdd3');
  });

  it('filters the conversation and highlights matches while searching', async () => {
    await renderLoadedChat();
    fireEvent.change(screen.getByPlaceholderText('Search chat'), { target: { value: 'export' } });
    await waitFor(() => expect(bubbles()).toHaveLength(1));
    expect(document.querySelectorAll('mark')).toHaveLength(1);
  });

  it('lets the user switch identity from the details sheet and flips the bubble sides', async () => {
    await renderLoadedChat();
    fireEvent.click(screen.getByLabelText('Chat details'));
    fireEvent.click(await screen.findByLabelText('Set Aarav Mehta as you'));

    await waitFor(() => expect(outgoing()).toHaveLength(2));
    expect(screen.getByText(/Your messages now appear on the right as Aarav Mehta/)).toBeTruthy();
  });

  it('copies a message on long press (context menu) and reports it in a snackbar', async () => {
    await renderLoadedChat();
    fireEvent.contextMenu(bubbles()[0]);
    await waitFor(() => expect(screen.getByText('Message copied to clipboard.')).toBeTruthy());
  });

  it('shows the welcome call to action when no chat is available', async () => {
    window.history.replaceState({}, '', '/');
    render(<App />);
    expect(screen.getByText('TSun Chat Viewer')).toBeTruthy();
    expect(screen.getByText('Load chat from URL')).toBeTruthy();
    expect(screen.getByText('Try a sample chat')).toBeTruthy();
  });

  it('surfaces fetch failures with a retry action', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 500 })));
    render(<App />);
    await waitFor(() =>
      expect(screen.getAllByText(/Could not load that chat/).length).toBeGreaterThan(0)
    );
    expect(screen.getAllByText('Try again').length).toBeGreaterThan(0);
  });
});
