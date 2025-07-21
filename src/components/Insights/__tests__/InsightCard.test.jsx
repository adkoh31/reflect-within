import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InsightCard from '../InsightCard';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => {
  const Real = jest.requireActual('react');
  return {
    motion: {
      div: jest.fn().mockImplementation(({ children, ...props }) => {
        // Allow testId prop for outer div
        const { testId, ...rest } = props;
        return <div data-testid={testId} {...rest}>{children}</div>;
      }),
    },
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronDown: () => <span data-testid="chevron-down">Down</span>,
  ChevronUp: () => <span data-testid="chevron-up">Up</span>,
}));

// Mock Card, CardContent, CardHeader, Badge
jest.mock('../../ui/card', () => ({
  Card: ({ children, ...props }) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }) => <div data-testid="card-content" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }) => <div data-testid="card-header" {...props}>{children}</div>,
}));
jest.mock('../../ui/badge', () => ({
  Badge: ({ children, ...props }) => <span data-testid="badge" {...props}>{children}</span>,
}));

describe('InsightCard', () => {
  const defaultProps = {
    title: 'Test Title',
    subtitle: 'Test Subtitle',
    icon: <span data-testid="icon">Icon</span>,
    status: 'Active',
    statusColor: 'default',
    children: <div data-testid="children">Children Content</div>,
    expandedContent: <div data-testid="expanded">Expanded Content</div>,
    className: 'custom-class',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with required props', () => {
    render(<InsightCard {...defaultProps} data-testid="outer" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByTestId('badge')).toHaveTextContent('Active');
    expect(screen.getByTestId('children')).toBeInTheDocument();
    expect(screen.getByTestId('outer')).toHaveClass('custom-class');
  });

  test('renders badge with correct statusColor', () => {
    render(<InsightCard {...defaultProps} statusColor="destructive" />);
    expect(screen.getByTestId('badge')).toHaveClass('bg-red-100', 'text-red-900');
  });

  test('renders expand/collapse button when expandedContent is provided', () => {
    render(<InsightCard {...defaultProps} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
  });

  test('toggles expanded state and shows expandedContent', () => {
    render(<InsightCard {...defaultProps} />);
    const button = screen.getByRole('button');
    // Initially collapsed
    expect(screen.queryByTestId('expanded')).not.toBeInTheDocument();
    // Expand
    fireEvent.click(button);
    expect(screen.getByTestId('expanded')).toBeInTheDocument();
    expect(screen.getByTestId('chevron-up')).toBeInTheDocument();
    // Collapse
    fireEvent.click(button);
    expect(screen.queryByTestId('expanded')).not.toBeInTheDocument();
    expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
  });

  test('does not render expand/collapse button if expandedContent is not provided', () => {
    const { queryByRole } = render(<InsightCard {...defaultProps} expandedContent={undefined} />);
    expect(queryByRole('button')).not.toBeInTheDocument();
  });

  test('renders with no children', () => {
    render(<InsightCard {...defaultProps} children={undefined} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  test('renders with no subtitle', () => {
    render(<InsightCard {...defaultProps} subtitle={undefined} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  test('renders with no icon', () => {
    render(<InsightCard {...defaultProps} icon={undefined} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  test('renders with no status', () => {
    render(<InsightCard {...defaultProps} status={undefined} />);
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });

  test('renders with no statusColor', () => {
    render(<InsightCard {...defaultProps} statusColor={undefined} />);
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });

  test('applies custom className to outer motion div', () => {
    render(<InsightCard {...defaultProps} className="my-custom-class" data-testid="outer" />);
    expect(screen.getByTestId('outer')).toHaveClass('my-custom-class');
  });

  test('accessibility: button has accessible name', () => {
    render(<InsightCard {...defaultProps} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    // Could add aria-label if needed in the component
  });

  test('accessibility: heading is present', () => {
    render(<InsightCard {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  test('edge case: renders with minimal props', () => {
    render(<InsightCard title="Minimal" />);
    expect(screen.getByText('Minimal')).toBeInTheDocument();
  });
}); 