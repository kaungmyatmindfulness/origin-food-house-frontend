declare namespace NodeJS {
  interface ProcessEnv {
    // API Configuration
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_CUSTOMER_APP_URL: string;

    // Auth0 Configuration
    NEXT_PUBLIC_AUTH0_DOMAIN: string;
    NEXT_PUBLIC_AUTH0_CLIENT_ID: string;
    NEXT_PUBLIC_AUTH0_AUDIENCE: string;
    NEXT_PUBLIC_AUTH0_REDIRECT_URI: string;

    // HubSpot Configuration
    NEXT_PUBLIC_HUBSPOT_PORTAL_ID: string;
    NEXT_PUBLIC_HUBSPOT_CONTACT_US_FORM_ID: string;
  }
}
