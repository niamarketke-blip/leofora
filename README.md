# Leofora — Botanical E-commerce Platform

**Next.js + Shopify Integration | Dropship Catalog | Leofora Theme Design**

Leofora is a modern e-commerce platform built with Next.js 16.2.2 and fully integrated with Shopify Admin API. Features include a curated dropship catalog (12 EU plants), theme synchronization, and a botanical-inspired design system.

---

## Features

✅ **Shopify Integration**
- Admin API authentication and session management
- Product sync and import (dropship catalog)
- Theme design application (Leofora botanical presets)
- Store details dashboard

✅ **Dropship Catalog**
- 12 premium EU botanical products with full descriptions
- Smart sequential import with rate limiting
- Failure tracking and recovery

✅ **Theme & Design**
- Leofora signature botanical color scheme (#2d7f4f, #1a3d0a, #ffe066)
- Vine animations and botanical ornaments
- Responsive design system

✅ **Admin Features**
- EU product import dashboard
- Order management
- PayPal integration

✅ **Deployment Ready**
- Vercel.json configured for Vercel deployment
- GitHub Actions CI/CD pipeline
- Environment variable management

---

## Quick Start

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/niamarketke-blip/leofora.git
cd leofora

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit with your Shopify credentials (see Configuration below)

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## Configuration

Create `.env.local` file:

```env
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_your_admin_api_token
SHOPIFY_API_KEY=your_app_api_key
SHOPIFY_API_SECRET=your_app_api_secret
SHOPIFY_APP_URL=http://localhost:3000
SHOPIFY_API_VERSION=2026-04
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

### Getting Shopify Credentials

1. Shopify Admin → Settings → Apps and sales channels → Develop apps
2. Create or open your app
3. Enable Admin API scopes: `read_products`, `write_products`, `read_themes`, `write_themes`
4. Install the app and copy the **Admin API access token** (starts with `shpat_`)

---

## Deployment (Vercel)

1. Push to GitHub: `git push origin main`
2. Go to https://vercel.com/new
3. Connect your GitHub repo
4. Add environment variables from `.env.local`
5. Click Deploy — auto-deploys on every push

---

## API Endpoints

**Shopify Connection**
- POST `/api/shopify/connect` — Connect with token
- GET `/api/shopify/session` — Check connection status
- POST `/api/shopify/import-dropship` — Import 12 products
- POST `/api/shopify/theme-sync` — Apply Leofora theme

**Admin**
- GET `/api/admin/products` — List products
- POST `/api/admin/import-eu-products` — Import EU catalog

---

## Dropship Catalog

12 premium EU botanical products, each with:
- Vendor info (FauxGreen EU, BotanicDrop IE)
- SKU, pricing, inventory
- Full HTML descriptions
- Shipping & weight specs

Products range from €16.99 (Eucalyptus) to €89.99 (Fiddle Leaf Fig).

---

## Leofora Theme

Color scheme:
- Primary: #2d7f4f (Forest Green)
- Secondary: #1a3d0a (Deep Forest)
- Accent: #ffe066 (Golden)
- Background: #f8fcf7 (Soft Mint)

Animations: Vine sway effect + fade-in-up transitions

---

## GitHub Actions CI/CD

Automatic builds on every push to main:
- Node.js 20.x
- ESLint checks
- Full production build
- View status: https://github.com/niamarketke-blip/leofora/actions

---

## Versions

- Node.js: 18+
- TypeScript: 5.x
- React: 19.2.4
- Next.js: 16.2.2
- Shopify API: 2026-04

---

## Support

**Store**: j6rnun-fy.myshopify.com  
**Contact**: niamarket.ke@gmail.com  
**Repo**: https://github.com/niamarketke-blip/leofora

---

**Made with Leofora** 🌿