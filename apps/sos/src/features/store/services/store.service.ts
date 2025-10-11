import { apiFetch } from '@/utils/apiFetch';
import { GetStoreDetailsResponseDto } from '../types/store.types';

const STORE_ENDPOINT_BASE = '/stores';

export async function getStoreDetails(
  id: string
): Promise<GetStoreDetailsResponseDto> {
  const res = await apiFetch<GetStoreDetailsResponseDto>(
    `${STORE_ENDPOINT_BASE}/${id}`
  );
  if (!res.data) {
    throw new Error(
      'Failed to retrieve store details: No data returned by API.'
    );
  }
  return res.data;
}
