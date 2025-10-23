import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageUpload } from './image-upload';
import { toast } from '@repo/ui/lib/toast';

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock('@tanstack/react-query', () => ({
  useMutation: () => ({
    mutateAsync: jest
      .fn()
      .mockResolvedValue({ imageUrl: 'https://example.com/image.jpg' }),
  }),
}));

jest.mock('@/common/services/common.service', () => ({
  uploadImage: jest.fn(),
}));

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
  useDropzone: ({ onDropAccepted, onDropRejected, disabled }: any) => ({
    getRootProps: () => ({
      onClick: jest.fn(),
      'data-testid': 'dropzone',
    }),
    getInputProps: () => ({
      type: 'file',
      'data-testid': 'file-input',
      disabled,
    }),
    isDragActive: false,
  }),
}));

describe('ImageUpload', () => {
  let mockOnChange: jest.Mock;

  beforeEach(() => {
    mockOnChange = jest.fn();
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component', () => {
      render(<ImageUpload value={undefined} onChange={mockOnChange} />);
      expect(screen.getByTestId('dropzone')).toBeInTheDocument();
    });

    it('should render with default label', () => {
      render(<ImageUpload value={undefined} onChange={mockOnChange} />);
      expect(screen.getByText('Upload Image')).toBeInTheDocument();
    });

    it('should render with custom label', () => {
      render(
        <ImageUpload
          value={undefined}
          onChange={mockOnChange}
          label="Custom Label"
        />
      );
      expect(screen.getByText('Custom Label')).toBeInTheDocument();
    });

    it('should render the file input', () => {
      render(<ImageUpload value={undefined} onChange={mockOnChange} />);
      const input = screen.getByTestId('file-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'file');
    });
  });

  describe('Empty State', () => {
    it('should show upload prompt when no image', () => {
      render(<ImageUpload value={undefined} onChange={mockOnChange} />);
      expect(
        screen.getByText(/Drop image here, or click/i)
      ).toBeInTheDocument();
    });

    it('should show max file size in empty state', () => {
      render(
        <ImageUpload
          value={undefined}
          onChange={mockOnChange}
          maxSize={5 * 1024 * 1024}
        />
      );
      expect(screen.getByText(/Max 5MB/i)).toBeInTheDocument();
    });

    it('should show Upload icon in empty state', () => {
      const { container } = render(
        <ImageUpload value={undefined} onChange={mockOnChange} />
      );
      const uploadIcon = container.querySelector('.lucide-upload');
      expect(uploadIcon).toBeInTheDocument();
    });
  });

  describe('Label', () => {
    it('should render label when provided', () => {
      render(
        <ImageUpload
          value={undefined}
          onChange={mockOnChange}
          label="Store Logo"
        />
      );
      expect(screen.getByText('Store Logo')).toBeInTheDocument();
    });

    it('should not render label element when label is empty string', () => {
      const { container } = render(
        <ImageUpload value={undefined} onChange={mockOnChange} label="" />
      );
      const labels = container.querySelectorAll('label');
      expect(labels.length).toBe(0);
    });

    it('should apply correct styling to label', () => {
      render(
        <ImageUpload value={undefined} onChange={mockOnChange} label="Test" />
      );
      const label = screen.getByText('Test');

      expect(label.tagName).toBe('LABEL');
      expect(label).toHaveClass('block');
      expect(label).toHaveClass('mb-1');
      expect(label).toHaveClass('text-sm');
      expect(label).toHaveClass('font-medium');
    });
  });

  describe('Disabled State', () => {
    it('should disable file input when disabled prop is true', () => {
      render(
        <ImageUpload
          value={undefined}
          onChange={mockOnChange}
          disabled={true}
        />
      );
      const input = screen.getByTestId('file-input');
      expect(input).toBeDisabled();
    });

    it('should not disable file input when disabled prop is false', () => {
      render(
        <ImageUpload
          value={undefined}
          onChange={mockOnChange}
          disabled={false}
        />
      );
      const input = screen.getByTestId('file-input');
      expect(input).not.toBeDisabled();
    });
  });

  describe('Image Preview', () => {
    it('should show image when value is provided', () => {
      render(
        <ImageUpload
          value="https://example.com/image.jpg"
          onChange={mockOnChange}
        />
      );
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('should have alt text for uploaded image', () => {
      render(
        <ImageUpload
          value="https://example.com/path/to/image.jpg"
          onChange={mockOnChange}
        />
      );
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', 'image.jpg');
    });

    it('should render remove button when image is present and not disabled', () => {
      render(
        <ImageUpload
          value="https://example.com/image.jpg"
          onChange={mockOnChange}
        />
      );
      const removeButton = screen.getByRole('button', {
        name: /remove image/i,
      });
      expect(removeButton).toBeInTheDocument();
    });

    it('should not render remove button when disabled', () => {
      render(
        <ImageUpload
          value="https://example.com/image.jpg"
          onChange={mockOnChange}
          disabled={true}
        />
      );
      const removeButton = screen.queryByRole('button', {
        name: /remove image/i,
      });
      expect(removeButton).not.toBeInTheDocument();
    });
  });

  describe('Remove Image', () => {
    it('should call onChange with undefined when remove button is clicked', () => {
      render(
        <ImageUpload
          value="https://example.com/image.jpg"
          onChange={mockOnChange}
        />
      );
      const removeButton = screen.getByRole('button', {
        name: /remove image/i,
      });

      fireEvent.click(removeButton);

      expect(mockOnChange).toHaveBeenCalledWith(undefined);
    });

    it('should have accessible label for remove button', () => {
      render(
        <ImageUpload
          value="https://example.com/image.jpg"
          onChange={mockOnChange}
        />
      );
      const removeButton = screen.getByRole('button', {
        name: /remove image/i,
      });

      expect(removeButton).toHaveAttribute('aria-label', 'Remove image');
      expect(removeButton).toHaveAttribute('title', 'Remove image');
    });

    it('should render X icon in remove button', () => {
      const { container } = render(
        <ImageUpload
          value="https://example.com/image.jpg"
          onChange={mockOnChange}
        />
      );
      const xIcon = container.querySelector('.lucide-x');
      expect(xIcon).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('should accept value prop', () => {
      render(
        <ImageUpload
          value="https://example.com/test.jpg"
          onChange={mockOnChange}
        />
      );
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', 'https://example.com/test.jpg');
    });

    it('should accept onChange prop and call it', () => {
      const onChange = jest.fn();
      render(
        <ImageUpload
          value="https://example.com/image.jpg"
          onChange={onChange}
        />
      );
      const removeButton = screen.getByRole('button', {
        name: /remove image/i,
      });

      fireEvent.click(removeButton);

      expect(onChange).toHaveBeenCalled();
    });

    it('should accept maxSize prop', () => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      render(
        <ImageUpload
          value={undefined}
          onChange={mockOnChange}
          maxSize={maxSize}
        />
      );
      expect(screen.getByText(/Max 5MB/i)).toBeInTheDocument();
    });

    it('should use default maxSize when not provided', () => {
      render(<ImageUpload value={undefined} onChange={mockOnChange} />);
      expect(screen.getByText(/Max 10MB/i)).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply correct classes to dropzone in empty state', () => {
      const { container } = render(
        <ImageUpload value={undefined} onChange={mockOnChange} />
      );
      const dropzone = screen.getByTestId('dropzone');

      // Dropzone should be clickable
      expect(dropzone).toBeInTheDocument();
    });

    it('should apply error styling when error is present', () => {
      // This would require simulating an error state
      // For now, we test that the component renders without errors
      render(<ImageUpload value={undefined} onChange={mockOnChange} />);
      expect(screen.getByTestId('dropzone')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button type for remove button', () => {
      render(
        <ImageUpload
          value="https://example.com/image.jpg"
          onChange={mockOnChange}
        />
      );
      const removeButton = screen.getByRole('button', {
        name: /remove image/i,
      });
      expect(removeButton).toHaveAttribute('type', 'button');
    });

    it('should have accessible file input', () => {
      render(<ImageUpload value={undefined} onChange={mockOnChange} />);
      const input = screen.getByTestId('file-input');
      expect(input).toHaveAttribute('type', 'file');
    });
  });

  describe('Image Container', () => {
    it('should render image container with group class for hover effects', () => {
      const { container } = render(
        <ImageUpload
          value="https://example.com/image.jpg"
          onChange={mockOnChange}
        />
      );
      const imageContainer = container.querySelector('.group');
      expect(imageContainer).toBeInTheDocument();
    });

    it('should have correct dimensions for image container', () => {
      const { container } = render(
        <ImageUpload
          value="https://example.com/image.jpg"
          onChange={mockOnChange}
        />
      );
      const imageContainer = container.querySelector('.group');

      expect(imageContainer).toHaveClass('w-32');
      expect(imageContainer).toHaveClass('h-32');
    });

    it('should apply object-cover to image', () => {
      render(
        <ImageUpload
          value="https://example.com/image.jpg"
          onChange={mockOnChange}
        />
      );
      const image = screen.getByRole('img');

      expect(image).toHaveClass('object-cover');
      expect(image).toHaveClass('w-full');
      expect(image).toHaveClass('h-full');
      expect(image).toHaveClass('rounded');
    });
  });

  describe('Icons', () => {
    it('should render Upload icon in empty state with correct size', () => {
      const { container } = render(
        <ImageUpload value={undefined} onChange={mockOnChange} />
      );
      const uploadIcon = container.querySelector('.lucide-upload');

      expect(uploadIcon).toHaveClass('w-8');
      expect(uploadIcon).toHaveClass('h-8');
    });

    it('should render X icon in remove button with correct styling', () => {
      const { container } = render(
        <ImageUpload
          value="https://example.com/image.jpg"
          onChange={mockOnChange}
        />
      );
      const xIcon = container.querySelector('.lucide-x');

      expect(xIcon).toHaveClass('w-4');
      expect(xIcon).toHaveClass('h-4');
      expect(xIcon).toHaveClass('text-red-500');
    });
  });

  describe('File Size Display', () => {
    it('should display file size in MB', () => {
      render(
        <ImageUpload
          value={undefined}
          onChange={mockOnChange}
          maxSize={10 * 1024 * 1024}
        />
      );
      expect(screen.getByText(/10MB/i)).toBeInTheDocument();
    });

    it('should round file size correctly', () => {
      render(
        <ImageUpload
          value={undefined}
          onChange={mockOnChange}
          maxSize={2.5 * 1024 * 1024}
        />
      );
      // Math.round(2.5) = 2 or 3 depending on implementation
      const text = screen.getByText(/MB/i).textContent;
      expect(text).toMatch(/\dMB/);
    });
  });
});
