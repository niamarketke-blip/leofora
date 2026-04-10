# Petale E-commerce System - File Map

## Homepage Components
- `app/page.tsx` - Main homepage assembling all sections
- `components/HeroSlider.tsx` + `HeroSlider.module.css` - Full-screen sliding hero with Ken Burns effect
- `components/Marquee.tsx` - Top announcement bar
- `components/TrustStrip.tsx` - Trust badges and guarantees
- `components/ProductCarousel.tsx` + `ProductCarousel.module.css` - Draggable product carousel
- `components/Categories.tsx` - Product category grid
- `components/BrandStory.tsx` - About section
- `components/Testimonials.tsx` - Customer reviews
- `components/Newsletter.tsx` - Email signup form

## API Routes
- `app/api/images/route.ts` - Image upload to Supabase Storage
- `app/api/products/route.ts` - Product CRUD operations
- `app/api/dropship/route.ts` - Supplier catalog integration
- `app/api/checkout/route.ts` - PayPal order creation
- `app/api/orders/capture/route.ts` - PayPal payment capture
- `app/api/webhooks/paypal/route.ts` - PayPal webhook handler

## Libraries
- `lib/paypal.ts` - PayPal API client
- `lib/email.ts` - Email service (mock)
- `lib/schema.sql` - Database schema

## Components
- `components/ImageManager.tsx` + `ImageManager.module.css` - Admin image uploader
- `components/checkout/PayPalButton.tsx` + `PayPalButton.module.css` - PayPal checkout button

## Pages
- `app/order/confirm/page.tsx` + `Confirm.module.css` - Order confirmation page

## Configuration
- `.env.example` - Environment variables template

## Setup Instructions
1. Run `lib/schema.sql` in Supabase SQL Editor
2. Copy `.env.example` to `.env.local` and fill in values
3. Set up PayPal app and webhook as described in `.env.example`
4. Install dependencies: `npm install @supabase/supabase-js`
5. Run the development server: `npm run dev`