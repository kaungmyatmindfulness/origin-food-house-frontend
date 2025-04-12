import { Store } from '@/features/store/types/store.types';

export type UserRole = 'OWNER' | 'ADMIN' | 'CASHIER' | 'CHEF';

/**
{
    "status": "success",
    "data": {
        "id": "019624ae-1af7-71e2-91d5-37231a705d9c",
        "email": "owner@test.com",
        "name": "Alonzo Hammes",
        "verified": true,
        "createdAt": "2025-04-11T11:48:32.080Z",
        "updatedAt": "2025-04-11T11:48:32.080Z",
        "userStores": [
            {
                "id": "019624ae-1b49-72c3-a4ff-96b491fde93f",
                "userId": "019624ae-1af7-71e2-91d5-37231a705d9c",
                "storeId": "019624ae-1b3f-7e43-bdac-71eafd4d4ff7",
                "role": "OWNER",
                "store": {
                    "id": "019624ae-1b3f-7e43-bdac-71eafd4d4ff7",
                    "slug": "demo-cafe",
                    "createdAt": "2025-04-11T11:48:32.191Z",
                    "updatedAt": "2025-04-11T11:48:32.191Z",
                    "information": {
                        "id": "019624ae-1b3f-7e43-bdac-7205d5efeeb7",
                        "storeId": "019624ae-1b3f-7e43-bdac-71eafd4d4ff7",
                        "name": "Demo Cafe (Info)",
                        "address": "453 N Cedar Street",
                        "phone": "(497) 785-2047 x456",
                        "email": "Reid.Robel@yahoo.com",
                        "website": "https://honored-gripper.com",
                        "createdAt": "2025-04-11T11:48:32.191Z",
                        "updatedAt": "2025-04-11T11:48:32.191Z"
                    }
                }
            },
            {
                "id": "019624ae-1b61-7b92-b7fa-a840d2507219",
                "userId": "019624ae-1af7-71e2-91d5-37231a705d9c",
                "storeId": "019624ae-1b3f-7e43-bdac-71c5e22dd7a3",
                "role": "ADMIN",
                "store": {
                    "id": "019624ae-1b3f-7e43-bdac-71c5e22dd7a3",
                    "slug": "nulla-velit-usus",
                    "createdAt": "2025-04-11T11:48:32.191Z",
                    "updatedAt": "2025-04-11T11:48:32.191Z",
                    "information": {
                        "id": "019624ae-1b3f-7e43-bdac-71faa2413dd7",
                        "storeId": "019624ae-1b3f-7e43-bdac-71c5e22dd7a3",
                        "name": "Waelchi, Feeney and Heller Info",
                        "address": "640 Woodside",
                        "phone": "644-673-4384 x3698",
                        "email": "Ignacio.Schinner@gmail.com",
                        "website": "https://ashamed-premeditation.info",
                        "createdAt": "2025-04-11T11:48:32.191Z",
                        "updatedAt": "2025-04-11T11:48:32.191Z"
                    }
                }
            },
            {
                "id": "019624ae-1b49-72c3-a4ff-96c7db2827ad",
                "userId": "019624ae-1af7-71e2-91d5-37231a705d9c",
                "storeId": "019624ae-1b3f-7e43-bdac-71dafdecd4be",
                "role": "OWNER",
                "store": {
                    "id": "019624ae-1b3f-7e43-bdac-71dafdecd4be",
                    "slug": "averto-ambitus-cum",
                    "createdAt": "2025-04-11T11:48:32.191Z",
                    "updatedAt": "2025-04-11T11:48:32.191Z",
                    "information": {
                        "id": "019624ae-1b3f-7e43-bdac-721ad03d006e",
                        "storeId": "019624ae-1b3f-7e43-bdac-71dafdecd4be",
                        "name": "Corkery - Beer Info",
                        "address": "9618 Fritsch Knoll",
                        "phone": "475.327.7704 x13602",
                        "email": "Maudie.Langworth1@gmail.com",
                        "website": "https://essential-discourse.org",
                        "createdAt": "2025-04-11T11:48:32.191Z",
                        "updatedAt": "2025-04-11T11:48:32.191Z"
                    }
                }
            }
        ],
        "selectedStoreRole": null
    },
    "message": "Profile retrieved successfully.",
    "errors": null
}
 */

export interface UserStore {
  id: string;
  userId: string;
  storeId: string;
  role: UserRole;
  store: Store;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
}

export interface AddUserToStoreDto {
  userId: string;
  storeId: string;
  role: UserRole;
}

/** For POST /user/register */
export interface RegisterUserData {
  id: string;
  email: string;
}

/** For POST /user/add-to-store */
export interface AddUserToStoreData {
  id: string;
  userId: string;
  storeId: string;
  role: string;
}

/** For GET /user/{id}/stores */
export interface UserStoreRole {
  id: string;
  userId: string;
  storeId: string;
  role: string;
}

/** For GET /user/me */
export interface CurrentUserData {
  id: string;
  email: string;
  name: string;
  userStores: UserStore[];
  currentRole: UserRole | null;
}
