import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

type ShopifyCustomerResponse = {
  customer: {
    id: string;
    email: string;
    accepts_marketing: boolean;
    created_at: string;
    updated_at: string;
    first_name: string;
    last_name: string;
    orders_count: number;
    state: string;
    total_spent: string;
    last_order_id: string | null;
    note: string | null;
    verified_email: boolean;
    tax_exempt: boolean;
    tags: string;
    last_order_name: string | null;
    currency: string;
    phone: string | null;
    addresses: Array<{
      id: number;
      customer_id: number;
      first_name: string;
      last_name: string;
      company: string | null;
      address1: string;
      address2: string | null;
      city: string;
      province: string;
      country: string;
      zip: string;
      phone: string | null;
      province_code: string;
      country_code: string;
      default: boolean;
    }>;
  };
};

type AppLoadContext = {
  env: {
    PUBLIC_STORE_DOMAIN: string;
    SHOPIFY_ADMIN_API_TOKEN: string;
    [key: string]: string | undefined;
  };
};

export async function loader({request, context}: LoaderFunctionArgs & {context: AppLoadContext}) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get('id');

  if (!customerId) {
    throw new Response(
      JSON.stringify({
        success: false,
        error: 'Customer ID is required',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }

  const {env} = context;
  const storeDomain = env.PUBLIC_STORE_DOMAIN;
  const adminApiToken = env.SHOPIFY_ADMIN_API_TOKEN;

  if (!storeDomain || !adminApiToken) {
    throw new Response(
      JSON.stringify({
        success: false,
        error: 'Missing required environment variables',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }

  try {
    const adminResponse = await fetch(
      `https://${storeDomain}/admin/api/2025-01/customers/${customerId}.json`,
      {
        headers: {
          'X-Shopify-Access-Token': adminApiToken,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!adminResponse.ok) {
      throw new Error(`HTTP error! status: ${adminResponse.status}`);
    }

    const data = (await adminResponse.json()) as ShopifyCustomerResponse;

    return {
      success: true,
      customer: data.customer,
    };
  } catch (error: any) {
    throw new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch customer information',
      }),
      {
        status: error.status || 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
} 