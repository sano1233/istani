import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Products from '../src/components/Products';

describe('ISTANI Digital Products', () => {
  test('Renders digital product header', () => {
    render(<Products />);
    expect(screen.getByText('ISTANI Digital Products')).toBeInTheDocument();
  });
  test('Displays all 3 digital products', async () => {
    render(<Products />);
    await waitFor(() => {
      expect(screen.getByText('ISTANI Smart Bands Digital Protocol')).toBeInTheDocument();
      expect(screen.getByText('ISTANI HIIT Audio Neuro-Pack')).toBeInTheDocument();
      expect(screen.getByText('ISTANI Behavior Tracking OS')).toBeInTheDocument();
    });
  });
  test('Filters work correctly', async () => {
    render(<Products />);
    fireEvent.click(screen.getByText('audio'));
    await waitFor(() => {
      expect(screen.queryByText('ISTANI Smart Bands Digital Protocol')).not.toBeInTheDocument();
      expect(screen.getByText('ISTANI HIIT Audio Neuro-Pack')).toBeInTheDocument();
    });
  });
});
