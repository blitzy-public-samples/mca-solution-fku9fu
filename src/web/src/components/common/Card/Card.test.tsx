// @testing-library/react v14.0.0
import { render, screen, fireEvent } from '@testing-library/react';
// @jest/globals v29.0.0
import { describe, it, expect } from '@jest/globals';

import { Card, CardProps } from './Card';
import { renderWithProviders } from '../../../utils/test.utils';

/*
Human Tasks:
1. Verify color contrast ratios meet WCAG 2.1 Level AA requirements using a color contrast analyzer
2. Test with multiple screen readers to ensure proper ARIA label announcement
3. Validate touch target sizes on various mobile devices
4. Cross-browser testing for keyboard navigation
*/

describe('Card Component', () => {
  // Requirement: Component Library - Test Material Design card component functionality and reusability
  it('should render with title and subtitle', () => {
    const props: CardProps = {
      title: 'Test Title',
      subtitle: 'Test Subtitle',
      children: <div>Card content</div>
    };

    renderWithProviders(<Card {...props} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Test Title');
  });

  // Requirement: Visual Hierarchy - Verify card-based layout implementation with consistent spacing
  it('should render children content', () => {
    const testContent = 'Test child content';
    const props: CardProps = {
      children: <div>{testContent}</div>
    };

    renderWithProviders(<Card {...props} />);

    expect(screen.getByText(testContent)).toBeInTheDocument();
    // Verify content is wrapped in CardContent
    expect(screen.getByText(testContent).closest('.MuiCardContent-root')).toBeInTheDocument();
  });

  it('should render actions when provided', () => {
    const actionText = 'Action Button';
    const props: CardProps = {
      children: <div>Content</div>,
      actions: <button>{actionText}</button>
    };

    renderWithProviders(<Card {...props} />);

    expect(screen.getByText(actionText)).toBeInTheDocument();
    expect(screen.getByText(actionText).closest('.MuiCardActions-root')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    const props: CardProps = {
      children: <div>Clickable content</div>,
      onClick: handleClick
    };

    renderWithProviders(<Card {...props} />);
    
    const card = screen.getByRole('button');
    fireEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(card).toHaveStyle({ cursor: 'pointer' });
  });

  // Requirement: Accessibility - Validate WCAG 2.1 Level AA compliance and ARIA label implementation
  it('should apply correct accessibility attributes', () => {
    const props: CardProps = {
      children: <div>Content</div>,
      ariaLabel: 'Test card',
      onClick: jest.fn()
    };

    renderWithProviders(<Card {...props} />);

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label', 'Test card');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('should handle keyboard interactions', () => {
    const handleClick = jest.fn();
    const props: CardProps = {
      children: <div>Interactive content</div>,
      onClick: handleClick
    };

    renderWithProviders(<Card {...props} />);
    
    const card = screen.getByRole('button');
    
    // Test Enter key
    fireEvent.keyPress(card, { key: 'Enter', code: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    // Test Space key
    fireEvent.keyPress(card, { key: ' ', code: 'Space' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('should render as article when not interactive', () => {
    const props: CardProps = {
      children: <div>Non-interactive content</div>
    };

    renderWithProviders(<Card {...props} />);
    
    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const customClass = 'custom-card';
    const props: CardProps = {
      children: <div>Content</div>,
      className: customClass
    };

    renderWithProviders(<Card {...props} />);
    
    expect(screen.getByRole('article')).toHaveClass(customClass);
  });

  it('should apply correct elevation', () => {
    const props: CardProps = {
      children: <div>Content</div>,
      elevation: 3
    };

    const { container } = renderWithProviders(<Card {...props} />);
    
    // MUI applies elevation classes in the format 'MuiPaper-elevation{number}'
    expect(container.firstChild).toHaveClass('MuiPaper-elevation3');
  });
});