export const Config = {
  API_BASE_URL: 'https://postingautomation.lfvs.in',

  // App version (keep in sync with package.json and android/app/build.gradle)
  APP_VERSION: '1.6.3',
  VERSION_CODE: 11,

  // OAuth callback scheme
  OAUTH_CALLBACK_SCHEME: 'postingautomation',

  // Privacy & Legal
  PRIVACY_POLICY_URL: 'https://postingautomation.lfvs.in/privacy-policy',
  TERMS_OF_SERVICE_URL: 'https://postingautomation.lfvs.in/terms-and-conditions',

  // Upload limits
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_MEDIA_COUNT: 10,
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  SUPPORTED_VIDEO_TYPES: ['video/mp4', 'video/quicktime'],
};
