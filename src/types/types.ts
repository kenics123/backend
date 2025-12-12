export type CloudinaryUploadResponse = {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  asset_folder: string;
  display_name: string;
  original_filename: string;
  api_key: string;
};

export interface FlutterwaveResponse {
  status: string;
  message: string;
  data?: any;
  [key: string]: any;
}

export interface FlutterwaveAuthResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  'not-before-policy': number;
  scope: string;
}

export interface FlutterwaveCardInfo {
  first_6digits: string;
  last_4digits: string;
  issuer: string;
  country: string;
  type: string;
  expiry: string;
}

export interface FlutterwaveCustomer {
  id: number;
  name: string;
  phone_number: string;
  email: string;
  created_at: string;
}

export interface FlutterwaveWebhookData {
  id: number;
  tx_ref: string;
  flw_ref: string;
  device_fingerprint: string;
  amount: number;
  currency: string;
  charged_amount: number;
  app_fee: number;
  merchant_fee: number;
  processor_response: string;
  auth_model: string;
  ip: string;
  narration: string;
  status: string;
  payment_type: string; // 'card' | 'ussd' | others
  created_at: string;
  account_id: number;
  customer: FlutterwaveCustomer;

  // Optional for USSD
  card?: FlutterwaveCardInfo;
}

export interface FlutterwaveWebhookEvent {
  event: string; // 'charge.completed'
  data: FlutterwaveWebhookData;
  meta_data?: Record<string, any>;
  'event.type': string; // 'CARD_TRANSACTION' | 'USSD_TRANSACTION'
}
