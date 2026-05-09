module.exports = {
  apps: [{
    name: 'novari-api',
    script: '/home/ubuntu/novari/artifacts/api-server/dist/index.mjs',
    env: {
      NODE_ENV: 'production',
      PORT: '3000',
      DATABASE_URL: 'postgresql://novari:novari_secure_2026!@localhost:5432/novaridb',
      SITE_URL: 'https://novaripartners.com',
      NEXI_ENV: 'production',
      NEXI_API_KEY: '',
      ADMIN_PASSWORD: 'novari_admin_2026!'
    }
  }]
}
