'use client';

import React from 'react';
import {
  CreateCategoryDialog,
  CreateItemDialog,
} from '@/features/menu/ui/create-forms';
import { CategoryCard } from '@/features/menu/ui/category-card';
import { ItemModal } from '@/features/menu/ui/item-modal';
import { Category } from '@/features/menu/types/category.types';
import { MenuItem } from '@/features/menu/types/menu-item.types';

export default function MenuPage() {
  const [categories, setCategories] = React.useState<Category[]>([
    {
      id: 10,
      name: 'spicy',
      storeId: 1,
      createdAt: '2025-04-01T18:05:42.401Z',
      updatedAt: '2025-04-01T18:05:42.401Z',
      menuItems: [
        {
          id: 13,
          name: 'Apricot-glazed Emu Skewers',
          description:
            'A succulent turkey steak, encased in a spicy ajwan seed crust, served with a side of garlic mashed sweet potato.',
          basePrice: 13.09,
          imageKey: 'uploads/fd9d6802-095b-4d4c-95f7-79e9aa6d9125-original',
          categoryId: 10,
          storeId: 1,
          createdAt: '2025-03-26T21:03:34.504Z',
          updatedAt: '2025-03-26T21:03:34.504Z',
        },
        {
          id: 12,
          name: 'Lasagne',
          description:
            'A special plum chickpea from Taiwan. To support the strong flavor it is sided with a tablespoon of tikka masala.',
          basePrice: 10.72,
          imageKey: 'uploads/ae30eb46-b5ef-4d90-88e9-c7e6477bd2bf-original',
          categoryId: 10,
          storeId: 1,
          createdAt: '2025-03-26T21:03:34.500Z',
          updatedAt: '2025-03-26T21:03:34.500Z',
        },
        {
          id: 11,
          name: 'Spicy Goose With Peppers',
          description:
            'Hearty cardamom and turkey stew, slow-cooked with chamomile and chilli pepper for a comforting, flavorful meal.',
          basePrice: 11.45,
          imageKey: 'uploads/8bdd9fb7-42ec-4c49-8926-5e025a736c75-original',
          categoryId: 10,
          storeId: 1,
          createdAt: '2025-03-26T21:03:34.496Z',
          updatedAt: '2025-03-26T21:03:34.496Z',
        },
      ],
    },
    {
      id: 9,
      name: 'smoky',
      storeId: 1,
      createdAt: '2025-03-26T21:03:34.442Z',
      updatedAt: '2025-03-26T21:03:34.442Z',
      menuItems: [
        {
          id: 22,
          name: 'Som Tam',
          description:
            'A classic pie filled with delicious chicken and rich wheat, baked in a savory pastry crust and topped with a golden-brown lattice.',
          basePrice: 18.27,
          imageKey: 'uploads/dd5f1aa9-6402-4ed0-86f1-3a473c5520c8-original',
          categoryId: 9,
          storeId: 6,
          createdAt: '2025-03-26T21:03:34.541Z',
          updatedAt: '2025-03-26T21:03:34.541Z',
        },
        {
          id: 23,
          name: 'Golden Turkey With Raspberry',
          description:
            'A classic pie filled with delicious goose and sour juniper berries, baked in a tangy pastry crust and topped with a golden-brown lattice.',
          basePrice: 14.85,
          imageKey: 'uploads/a3486401-acba-4f2d-9003-a698b23b5f9b-original',
          categoryId: 9,
          storeId: 6,
          createdAt: '2025-03-26T21:03:34.546Z',
          updatedAt: '2025-03-26T21:03:34.546Z',
        },
        {
          id: 26,
          name: 'French Toast',
          description:
            'Tenderly braised chicken in a rich ajwan seed and sweet potato sauce, served with a side of creamy snowpea sprouts.',
          basePrice: 16.39,
          imageKey: 'uploads/391e05d5-ef95-40d8-8aff-ab623eb559a4-original',
          categoryId: 9,
          storeId: 6,
          createdAt: '2025-03-26T21:03:34.558Z',
          updatedAt: '2025-03-26T21:03:34.558Z',
        },
        {
          id: 27,
          name: 'Chicken Fajitas',
          description: 'A simple strawberry pie. No fancy stuff. Just pie.',
          basePrice: 13.55,
          imageKey: 'uploads/5fcd17bd-5a6f-4f33-a656-25f44378d7ea-original',
          categoryId: 9,
          storeId: 6,
          createdAt: '2025-03-26T21:03:34.562Z',
          updatedAt: '2025-03-26T21:03:34.562Z',
        },
        {
          id: 30,
          name: 'Fish And Chips',
          description:
            'Tenderly braised kangaroo in a rich balti stir fry mix and cucumber sauce, served with a side of creamy jerusalem artichoke.',
          basePrice: 15.89,
          imageKey: 'uploads/38986950-bbc5-4563-99e5-d6de5d5d4eb4-original',
          categoryId: 9,
          storeId: 6,
          createdAt: '2025-03-26T21:03:34.575Z',
          updatedAt: '2025-03-26T21:03:34.575Z',
        },
        {
          id: 10,
          name: 'Seafood Paella',
          description:
            'Fresh nori with a pinch of lavender, topped by a caramelized peach with whipped cream',
          basePrice: 8.1,
          imageKey: 'uploads/d9aa0285-4926-4611-ab73-c4d2602efa68-original',
          categoryId: 9,
          storeId: 1,
          createdAt: '2025-03-26T21:03:34.491Z',
          updatedAt: '2025-03-26T21:03:34.491Z',
        },
        {
          id: 9,
          name: 'California Maki',
          description:
            'Three parmesan cheese with onion, dried chinese broccoli, jicama, chinese cabbage and oyster sauce. With a side of baked jarrahdale pumpkin, and your choice of guava or figs.',
          basePrice: 7.45,
          imageKey: 'uploads/457ddbde-c9c4-4d3d-9971-876e445c7394-original',
          categoryId: 9,
          storeId: 1,
          createdAt: '2025-03-26T21:03:34.487Z',
          updatedAt: '2025-03-26T21:03:34.487Z',
        },
        {
          id: 8,
          name: 'Teriyaki Chicken Donburi',
          description:
            'Tender salmon skewers, glazed with a sweet and tangy lychee sauce, served over a bed of fragrant jasmine rice.',
          basePrice: 10.1,
          imageKey: 'uploads/6ce13607-bc7a-410e-a805-3c6735a8d76e-original',
          categoryId: 9,
          storeId: 1,
          createdAt: '2025-03-26T21:03:34.483Z',
          updatedAt: '2025-03-26T21:03:34.483Z',
        },
      ],
    },
    {
      id: 8,
      name: 'european',
      storeId: 1,
      createdAt: '2025-03-26T21:03:34.441Z',
      updatedAt: '2025-03-26T21:03:34.441Z',
      menuItems: [
        {
          id: 25,
          name: 'Galangal-rubbed Lamb Salad',
          description:
            'Crispy fried ostrich bites, seasoned with sweet laurel and served with a tangy cavalo dipping sauce.',
          basePrice: 16.89,
          imageKey: 'uploads/312163f9-ea73-4698-ab27-85faae6c70df-original',
          categoryId: 8,
          storeId: 6,
          createdAt: '2025-03-26T21:03:34.554Z',
          updatedAt: '2025-03-26T21:03:34.554Z',
        },
        {
          id: 7,
          name: 'Prune-infused Turkey Roast',
          description:
            'An exquisite salmon roast, infused with the essence of honeydew melon, slow-roasted to bring out its natural flavors and served with a side of creamy arugula',
          basePrice: 18.65,
          imageKey: 'uploads/34443dab-2990-4cd5-bd11-353c187d2475-original',
          categoryId: 8,
          storeId: 1,
          createdAt: '2025-03-26T21:03:34.478Z',
          updatedAt: '2025-03-26T21:03:34.478Z',
        },
        {
          id: 6,
          name: 'Pappardelle Alla Bolognese',
          description:
            'Crispy fried quail bites, seasoned with chives and served with a tangy blood orange dipping sauce.',
          basePrice: 15.95,
          imageKey: 'uploads/ae0df93d-5c0b-4ad0-89ff-6e0472db769b-original',
          categoryId: 8,
          storeId: 1,
          createdAt: '2025-03-26T21:03:34.474Z',
          updatedAt: '2025-03-26T21:03:34.474Z',
        },
        {
          id: 5,
          name: 'Spinach Salad',
          description:
            'Baked turkey-stuffed ostrich, seasoned with lemon grass and creamy herbs, accompanied by roasted kale medley.',
          basePrice: 6.75,
          imageKey: 'uploads/fa93d392-b13d-4676-8185-de440ac0a08d-original',
          categoryId: 8,
          storeId: 1,
          createdAt: '2025-03-26T21:03:34.469Z',
          updatedAt: '2025-03-26T21:03:34.469Z',
        },
        {
          id: 4,
          name: "Loy's Special Basil Basmati Rice",
          description:
            'A classic pie filled with delicious chicken and moist grapefruit, baked in a creamy pastry crust and topped with a golden-brown lattice.',
          basePrice: 7.09,
          imageKey: 'uploads/aea3005d-2429-4508-9049-df73b8ae46fa-original',
          categoryId: 8,
          storeId: 1,
          createdAt: '2025-03-26T21:03:34.464Z',
          updatedAt: '2025-03-26T21:03:34.464Z',
        },
      ],
    },
    {
      id: 7,
      name: 'eastern',
      storeId: 1,
      createdAt: '2025-03-26T21:03:34.440Z',
      updatedAt: '2025-03-26T21:03:34.440Z',
      menuItems: [
        {
          id: 21,
          name: 'Pasta With Tomato And Basil',
          description:
            'A robust sweet stew featuring British flavors, loaded with fluffy meat, rich vegetables, and a tangy, juicy broth.',
          basePrice: 19.53,
          imageKey: 'uploads/889d4242-618f-4ff3-bee6-180bdb069923-original',
          categoryId: 7,
          storeId: 6,
          createdAt: '2025-03-26T21:03:34.538Z',
          updatedAt: '2025-03-26T21:03:34.538Z',
        },
        {
          id: 24,
          name: 'Blueberry-infused Ostrich Roast',
          description:
            'Three olive oil with rhubarb, raspberry, iceberg lettuce, jerusalem artichoke and ricemilk. With a side of baked watermelon, and your choice of starfruit or pepitas.',
          basePrice: 11.55,
          imageKey: 'uploads/846ea1f8-5414-4a74-82aa-95f8da2c5650-original',
          categoryId: 7,
          storeId: 6,
          createdAt: '2025-03-26T21:03:34.550Z',
          updatedAt: '2025-03-26T21:03:34.550Z',
        },
        {
          id: 28,
          name: 'Poutine',
          description:
            'Fresh mixed greens tossed with oregano-rubbed pigeon, peppers, and a light dressing.',
          basePrice: 16.59,
          imageKey: 'uploads/72140733-3ab6-4253-9d26-74a2ddb96ef1-original',
          categoryId: 7,
          storeId: 6,
          createdAt: '2025-03-26T21:03:34.566Z',
          updatedAt: '2025-03-26T21:03:34.566Z',
        },
        {
          id: 29,
          name: 'Balti Masala-crusted Crocodile',
          description:
            'Fresh soy sauce with a pinch of fennel seed, topped by a caramelized pomegranate with whipped cream',
          basePrice: 19.25,
          imageKey: 'uploads/ada44f9c-a99a-49f3-858e-bf3c02c8c890-original',
          categoryId: 7,
          storeId: 6,
          createdAt: '2025-03-26T21:03:34.571Z',
          updatedAt: '2025-03-26T21:03:34.571Z',
        },
        {
          id: 3,
          name: 'Venison With Cumquat Sauce',
          description:
            'Tender venison skewers, glazed with a sweet and tangy pineapple sauce, served over a bed of fragrant jasmine rice.',
          basePrice: 13.55,
          imageKey: 'uploads/667d1751-2b83-4351-85fc-0cdf61ac7e65-original',
          categoryId: 7,
          storeId: 1,
          createdAt: '2025-03-26T21:03:34.458Z',
          updatedAt: '2025-03-26T21:03:34.458Z',
        },
        {
          id: 2,
          name: 'Banana-glazed Emu Skewers',
          description:
            'A robust juicy stew featuring Thai flavors, loaded with juicy meat, tender vegetables, and a crunchy, salty broth.',
          basePrice: 7.59,
          imageKey: 'uploads/ab77e67f-1a40-453c-a802-708c0b95cfa7-original',
          categoryId: 7,
          storeId: 1,
          createdAt: '2025-03-26T21:03:34.453Z',
          updatedAt: '2025-03-26T21:03:34.453Z',
        },
        {
          id: 1,
          name: 'Chilli Con Carne',
          description:
            'A robust creamy stew featuring Cajun flavors, loaded with crispy meat, creamy vegetables, and a tangy, moist broth.',
          basePrice: 19.05,
          imageKey: 'uploads/d13c1300-3a73-47ff-9c59-175d1d02f0c5-original',
          categoryId: 7,
          storeId: 1,
          createdAt: '2025-03-26T21:03:34.443Z',
          updatedAt: '2025-03-26T21:03:34.443Z',
        },
      ],
    },
  ]);

  const [createItemOpen, setCreateItemOpen] = React.useState(false);
  const [createCategoryOpen, setCreateCategoryOpen] = React.useState(false);
  const [viewItem, setViewItem] = React.useState<MenuItem | null>(null);

  function onCreateItemSubmit(data: {
    name: string;
    description: string;
    price: number;
  }) {
    console.log('Creating item with data:', data);
    setCreateItemOpen(false);
  }

  function onCreateCategorySubmit(data: { name: string }) {
    console.log('Creating category with data:', data);
    setCreateCategoryOpen(false);
  }

  function handleEditCategory(categoryId: number) {
    console.log('Editing category:', categoryId);
  }

  function handleDeleteCategory(categoryId: number) {
    console.log('Deleting category:', categoryId);
  }

  function handleSelectItem(item: MenuItem) {
    setViewItem(item);
  }

  return (
    <div className="space-y-6 p-4">
      <nav className="mb-4 text-sm text-gray-500">
        Home &gt; <span className="text-gray-800">Menu</span>
      </nav>

      <div className="flex items-center space-x-2">
        <CreateItemDialog
          open={createItemOpen}
          onOpenChange={setCreateItemOpen}
          onSubmit={onCreateItemSubmit}
        />
        <CreateCategoryDialog
          open={createCategoryOpen}
          onOpenChange={setCreateCategoryOpen}
          onSubmit={onCreateCategorySubmit}
        />
      </div>

      <div>
        {categories.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onSelectItem={handleSelectItem}
          />
        ))}
      </div>

      {viewItem && (
        <ItemModal item={viewItem} onClose={() => setViewItem(null)} />
      )}
    </div>
  );
}
