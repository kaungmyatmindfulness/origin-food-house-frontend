import { apiFetch } from '@/utils/apiFetch';
import { StandardApiResponse } from '@/common/types/api.types';
import {
  CreateStoreDto,
  Store,
  StoreSettingResponseDto,
  UpdateStoreSettingDto,
  GetStoreDetailsResponseDto,
  UpdateStoreInformationDto,
} from '../types/store.types';

const STORE_ENDPOINT_BASE = '/stores';

export async function getStoreDetails(
  id: string
): Promise<GetStoreDetailsResponseDto> {
  const res = await apiFetch<GetStoreDetailsResponseDto>(
    `${STORE_ENDPOINT_BASE}/${id}`
  );

  if (!res.data) {
    console.error(
      `API Error: getStoreDetails(id: ${id}) succeeded but returned null data.`
    );
    throw new Error(
      'Failed to retrieve store details: No data returned by API.'
    );
  }
  return res.data;
}

export async function updateStoreInformation(
  id: string,
  storeIdQuery: string,
  data: UpdateStoreInformationDto
): Promise<void> {
  await apiFetch<null>(
    {
      path: `${STORE_ENDPOINT_BASE}/${id}/information`,
      query: { storeId: storeIdQuery },
    },
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
}

export async function updateStoreSettings(
  id: string,
  data: UpdateStoreSettingDto
): Promise<StoreSettingResponseDto> {
  const res = await apiFetch<StoreSettingResponseDto>(
    `${STORE_ENDPOINT_BASE}/${id}/settings`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );

  if (!res.data) {
    console.error(
      `API Error: updateStoreSettings(id: ${id}) succeeded but returned null data.`
    );
    throw new Error(
      'Failed to update store settings: No data returned by API.'
    );
  }
  return res.data;
}

export async function createStore(data: CreateStoreDto): Promise<Store> {
  const res: StandardApiResponse<Store> = await apiFetch<Store>(
    STORE_ENDPOINT_BASE,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  if (res.status === 'error' || !res.data) {
    throw new Error(
      res.errors?.[0]?.message || res.message || 'Failed to create store'
    );
  }
  return res.data;
}
