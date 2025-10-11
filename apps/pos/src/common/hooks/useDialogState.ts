import { useState, useCallback } from 'react';

/**
 * Custom hook for managing dialog/modal open/close state.
 * Eliminates the need for multiple boolean states and handlers.
 *
 * @param initialState - Initial open state (default: false)
 * @returns Tuple of [isOpen, open, close, toggle]
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [itemFormOpen, openItemForm, closeItemForm] = useDialogState();
 *   const [deleteDialogOpen, openDeleteDialog, closeDeleteDialog] = useDialogState();
 *
 *   return (
 *     <>
 *       <Button onClick={openItemForm}>Add Item</Button>
 *       <Dialog open={itemFormOpen} onOpenChange={closeItemForm}>
 *         ...
 *       </Dialog>
 *     </>
 *   );
 * }
 * ```
 */
export function useDialogState(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return [isOpen, open, close, toggle] as const;
}

/**
 * Alternative version that accepts a value to set the state.
 * Useful when you need to pass the setter directly to a component.
 *
 * @param initialState - Initial open state (default: false)
 * @returns Tuple of [isOpen, setIsOpen]
 */
export function useDialog(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  return [isOpen, setIsOpen] as const;
}
