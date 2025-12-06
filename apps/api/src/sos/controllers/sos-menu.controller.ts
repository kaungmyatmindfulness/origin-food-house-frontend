import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { CategoryService } from 'src/category/category.service';
import { CategoryResponseDto } from 'src/category/dto/category-response.dto';
import { ApiUuidParam } from 'src/common/decorators/api-crud.decorator';
import { ApiSuccessResponse } from 'src/common/decorators/api-success-response.decorator';
import { StandardApiResponse } from 'src/common/dto/standard-api-response.dto';
import { MenuItem } from 'src/generated/prisma/client';
import { MenuItemResponseDto } from 'src/menu/dto/menu-item-response.dto';
import { MenuService } from 'src/menu/menu.service';

/**
 * SOS Menu Controller
 *
 * Provides menu browsing capabilities for self-ordering customers.
 * All endpoints are PUBLIC (no authentication required).
 */
@ApiTags('SOS / Menu')
@Controller('sos/stores/:storeId')
export class SosMenuController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly menuService: MenuService
  ) {}

  @Get('menu')
  @ApiOperation({
    summary: 'Get full menu (categories with items)',
    description:
      'Returns all categories with their menu items for the store. Optimized for initial menu load.',
  })
  @ApiUuidParam('storeId', 'Store ID')
  @ApiSuccessResponse(CategoryResponseDto, {
    isArray: true,
    description: 'Full menu retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Store not found' })
  async getFullMenu(
    @Param('storeId', new ParseUUIDPipe({ version: '7' })) storeId: string
  ): Promise<StandardApiResponse<CategoryResponseDto[]>> {
    const categories = await this.categoryService.findAll(
      { storeId },
      true // includeItems = true
    );
    return StandardApiResponse.success(categories);
  }

  @Get('categories')
  @ApiOperation({
    summary: 'Get categories only',
    description:
      'Returns categories without menu items. Useful for category navigation.',
  })
  @ApiUuidParam('storeId', 'Store ID')
  @ApiSuccessResponse(CategoryResponseDto, {
    isArray: true,
    description: 'Categories retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Store not found' })
  async getCategories(
    @Param('storeId', new ParseUUIDPipe({ version: '7' })) storeId: string
  ): Promise<StandardApiResponse<CategoryResponseDto[]>> {
    const categories = await this.categoryService.findAll(
      { storeId },
      false // includeItems = false
    );
    return StandardApiResponse.success(categories);
  }

  @Get('menu-items')
  @ApiOperation({
    summary: 'Get all menu items for store',
    description:
      'Returns all active menu items for the store with full details.',
  })
  @ApiUuidParam('storeId', 'Store ID')
  @ApiSuccessResponse(MenuItemResponseDto, {
    isArray: true,
    description: 'Menu items retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Store not found' })
  async getMenuItems(
    @Param('storeId', new ParseUUIDPipe({ version: '7' })) storeId: string
  ): Promise<StandardApiResponse<MenuItem[]>> {
    const menuItems = await this.menuService.getStoreMenuItems(storeId);
    return StandardApiResponse.success(menuItems);
  }

  @Get('menu-items/:itemId')
  @ApiOperation({
    summary: 'Get single menu item details',
    description:
      'Returns detailed information for a specific menu item including customization options.',
  })
  @ApiUuidParam('storeId', 'Store ID')
  @ApiUuidParam('itemId', 'Menu item ID')
  @ApiSuccessResponse(MenuItemResponseDto, {
    description: 'Menu item retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async getMenuItem(
    @Param('storeId', new ParseUUIDPipe({ version: '7' })) _storeId: string,
    @Param('itemId', new ParseUUIDPipe({ version: '7' })) itemId: string
  ): Promise<StandardApiResponse<MenuItem>> {
    const menuItem = await this.menuService.getMenuItemById(itemId);
    return StandardApiResponse.success(menuItem);
  }
}
