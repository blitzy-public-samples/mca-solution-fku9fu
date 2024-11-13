// @testing-library/react v14.0.0
// @testing-library/jest-dom v5.16.5
// @testing-library/user-event v14.0.0

import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import Button, { ButtonProps } from './Button';
import { renderWithProviders } from '../../../utils/test.utils';

/*
Human Tasks:
1. Verify color contrast ratios using automated accessibility testing tools
2. Run manual screen reader testing across different devices/browsers
3. Test touch target sizes on various mobile devices
4. Validate focus behavior across different browser/OS combinations
*/

describe('Button component', () => {
  // Requirement: Component Library - Tests for Material Design button component with consistent theming
  describe('Default rendering', () => {
    it('renders correctly with default props', () => {
      renderWithProviders(<Button>Click me</Button>);
      
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('MuiButton-contained');
      expect(button).toHaveClass('MuiButton-sizeMedium');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('renders with custom props', () => {
      renderWithProviders(
        <Button
          variant="outlined"
          size="large"
          color="secondary"
          fullWidth
          ariaLabel="Custom button"
        >
          Custom Button
        </Button>
      );

      const button = screen.getByRole('button', { name: /custom button/i });
      expect(button).toHaveClass('MuiButton-outlined');
      expect(button).toHaveClass('MuiButton-sizeLarge');
      expect(button).toHaveClass('MuiButton-fullWidth');
      expect(button).toHaveAttribute('aria-label', 'Custom button');
    });
  });

  describe('Click handling', () => {
    it('handles click events correctly', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      renderWithProviders(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button', { name: /click me/i });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it('prevents click when disabled', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      renderWithProviders(
        <Button onClick={handleClick} disabled>
          Disabled Button
        </Button>
      );
      
      const button = screen.getByRole('button', { name: /disabled button/i });
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  // Requirement: Component Library - Verifying all variants and sizes
  describe('Variants and sizes', () => {
    it('applies contained variant styles correctly', () => {
      renderWithProviders(<Button variant="contained">Contained</Button>);
      
      const button = screen.getByRole('button', { name: /contained/i });
      expect(button).toHaveClass('MuiButton-contained');
      expect(button).not.toHaveClass('MuiButton-outlined');
      expect(button).not.toHaveClass('MuiButton-text');
    });

    it('applies outlined variant styles correctly', () => {
      renderWithProviders(<Button variant="outlined">Outlined</Button>);
      
      const button = screen.getByRole('button', { name: /outlined/i });
      expect(button).toHaveClass('MuiButton-outlined');
      expect(button).not.toHaveClass('MuiButton-contained');
    });

    it('applies text variant styles correctly', () => {
      renderWithProviders(<Button variant="text">Text</Button>);
      
      const button = screen.getByRole('button', { name: /text/i });
      expect(button).toHaveClass('MuiButton-text');
      expect(button).not.toHaveClass('MuiButton-contained');
    });

    it('applies different size classes correctly', () => {
      const { rerender } = renderWithProviders(
        <Button size="small">Small</Button>
      );
      
      expect(screen.getByRole('button')).toHaveClass('MuiButton-sizeSmall');

      rerender(<Button size="medium">Medium</Button>);
      expect(screen.getByRole('button')).toHaveClass('MuiButton-sizeMedium');

      rerender(<Button size="large">Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('MuiButton-sizeLarge');
    });
  });

  // Requirement: Accessibility - Tests for WCAG 2.1 Level AA compliance
  describe('Accessibility features', () => {
    it('applies proper ARIA attributes', () => {
      renderWithProviders(
        <Button ariaLabel="Accessible button">
          Click me
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Accessible button');
      expect(button).toHaveAttribute('role', 'button');
      expect(button).toHaveAttribute('tabIndex', '0');
    });

    it('handles keyboard navigation correctly', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      renderWithProviders(
        <Button onClick={handleClick}>
          Keyboard Navigation
        </Button>
      );
      
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();

      await user.keyboard('[Enter]');
      expect(handleClick).toHaveBeenCalledTimes(1);

      await user.keyboard('[Space]');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('maintains proper tab index when disabled', () => {
      renderWithProviders(
        <Button disabled>
          Disabled Button
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabIndex', '-1');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('uses text content as aria-label when not explicitly provided', () => {
      renderWithProviders(
        <Button>
          Button Text
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAccessibleName('Button Text');
    });
  });

  describe('Icon support', () => {
    it('renders with start and end icons', () => {
      const StartIcon = () => <span data-testid="start-icon">Start</span>;
      const EndIcon = () => <span data-testid="end-icon">End</span>;

      renderWithProviders(
        <Button
          startIcon={<StartIcon />}
          endIcon={<EndIcon />}
        >
          Icon Button
        </Button>
      );
      
      expect(screen.getByTestId('start-icon')).toBeInTheDocument();
      expect(screen.getByTestId('end-icon')).toBeInTheDocument();
    });
  });
});