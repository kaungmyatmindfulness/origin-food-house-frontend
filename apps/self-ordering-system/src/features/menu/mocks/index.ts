// src/features/menu/mock/index.ts

import { Cart } from '@/features/cart/types/cart.types';
import { Category } from '@/features/menu/types/menu.types';

export const MOCK_STORE_DETAILS = {
  information: { name: 'Demo Cafe', logoUrl: '/placeholder-logo.png' },
  setting: { currency: 'USD' },
};

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'cat1',
    name: 'Appetizers',
    storeId: 'store1',
    sortOrder: 1,
    menuItems: [
      {
        id: 'item1',
        name: 'Spring Rolls',
        description: 'Crispy fried rolls with vegetable filling.',
        basePrice: '6.50',
        imageUrl:
          'https://images.unsplash.com/photo-1685381980702-6140133c3cbb?q=80&w=3750&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        categoryId: 'cat1',
        storeId: 'store1',
        sortOrder: 1,
        customizationGroups: [], // Ensure customizationGroups is always present
      },
      {
        id: 'item2',
        name: 'Garlic Bread',
        description: 'Toasted bread with garlic butter.',
        basePrice: '4.00',
        imageUrl:
          'https://images.unsplash.com/photo-1685381980702-6140133c3cbb?q=80&w=3750&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        categoryId: 'cat1',
        storeId: 'store1',
        sortOrder: 2,
        customizationGroups: [],
      },
    ],
  },
  {
    id: 'cat2',
    name: 'Main Courses',
    storeId: 'store1',
    sortOrder: 2,
    menuItems: [
      {
        id: 'item3',
        name: 'Cheeseburger',
        description: 'Classic beef burger with cheese, lettuce, and tomato.',
        basePrice: '12.99',
        imageUrl:
          'https://images.unsplash.com/photo-1685381980702-6140133c3cbb?q=80&w=3750&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        categoryId: 'cat2',
        storeId: 'store1',
        sortOrder: 1,
        customizationGroups: [
          {
            id: 'cg1',
            name: 'Cheese Type',
            minSelectable: 1,
            maxSelectable: 1,
            menuItemId: 'item3',
            customizationOptions: [
              {
                id: 'co1a',
                name: 'Cheddar',
                additionalPrice: null,
                customizationGroupId: 'cg1',
              },
              {
                id: 'co1b',
                name: 'Swiss',
                additionalPrice: '0.50',
                customizationGroupId: 'cg1',
              },
              {
                id: 'co1c',
                name: 'Pepper Jack',
                additionalPrice: '0.75',
                customizationGroupId: 'cg1',
              },
            ],
          },
          {
            id: 'cg2',
            name: 'Add Ons',
            minSelectable: 0,
            maxSelectable: 2,
            menuItemId: 'item3',
            customizationOptions: [
              {
                id: 'co2a',
                name: 'Bacon',
                additionalPrice: '1.50',
                customizationGroupId: 'cg2',
              },
              {
                id: 'co2b',
                name: 'Extra Patty',
                additionalPrice: '3.00',
                customizationGroupId: 'cg2',
              },
              {
                id: 'co2c',
                name: 'Avocado',
                additionalPrice: '1.00',
                customizationGroupId: 'cg2',
              },
            ],
          },
        ],
      },
      {
        id: 'item4',
        name: 'Margherita Pizza',
        description: 'Simple pizza with tomato, mozzarella, and basil.',
        basePrice: '14.50',
        imageUrl:
          'https://images.unsplash.com/photo-1685381980702-6140133c3cbb?q=80&w=3750&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        categoryId: 'cat2',
        storeId: 'store1',
        sortOrder: 2,
        customizationGroups: [],
      },
      {
        id: 'item5',
        name: 'Pasta Carbonara',
        description: 'Creamy pasta with bacon and parmesan.',
        basePrice: '15.00',
        imageUrl:
          'https://images.unsplash.com/photo-1685381980702-6140133c3cbb?q=80&w=3750&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        categoryId: 'cat2',
        storeId: 'store1',
        sortOrder: 3,
        customizationGroups: [],
      },
    ],
  },
  {
    id: 'cat3',
    name: 'Desserts',
    storeId: 'store1',
    sortOrder: 3,
    menuItems: [
      {
        id: 'item6',
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake slice.',
        basePrice: '7.00',
        imageUrl:
          'https://images.unsplash.com/photo-1685381980702-6140133c3cbb?q=80&w=3750&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        categoryId: 'cat3',
        storeId: 'store1',
        sortOrder: 1,
        customizationGroups: [],
      },
    ],
  },
  {
    id: 'cat4',
    name: 'Drinks',
    storeId: 'store1',
    sortOrder: 4,
    menuItems: [
      {
        id: 'item7',
        name: 'Cola',
        description: 'Refreshing cola drink.',
        basePrice: '2.50',
        imageUrl:
          'https://images.unsplash.com/photo-1685381980702-6140133c3cbb?q=80&w=3750&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        categoryId: 'cat4',
        storeId: 'store1',
        sortOrder: 1,
        customizationGroups: [],
      },
      {
        id: 'item8',
        name: 'Orange Juice',
        description: 'Freshly squeezed orange juice.',
        basePrice: '3.50',
        imageUrl:
          'https://images.unsplash.com/photo-1685381980702-6140133c3cbb?q=80&w=3750&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        categoryId: 'cat4',
        storeId: 'store1',
        sortOrder: 2,
        customizationGroups: [],
      },
    ],
  },
];

export const INITIAL_CART_STATE: Cart = {
  id: 'local-cart', // Use a placeholder ID for local state
  activeTableSessionId: 'local-session', // Placeholder
  items: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
