import { NextRequest, NextResponse } from 'next/server';
import { getShopifySession, getShopifyAccessToken } from '../../../../lib/shopify';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

type ThemePreset = {
  color_button: string;
  color_background: string;
  color_foreground: string;
  color_accent: string;
  button_radius?: number;
  card_radius?: number;
  badge_radius?: number;
  input_radius?: number;
};

const PRESETS: Record<string, ThemePreset> = {
  'leofora-signature': {
    color_button: '#2d7f4f',
    color_background: '#f8fcf7',
    color_foreground: '#1a3d0a',
    color_accent: '#ffe066',
    button_radius: 14,
    card_radius: 24,
    badge_radius: 12,
    input_radius: 14,
  },
  botanical: {
    color_button: '#0f766e',
    color_background: '#f2fbf8',
    color_foreground: '#103b35',
    color_accent: '#df6d14',
    button_radius: 10,
    card_radius: 14,
    badge_radius: 8,
    input_radius: 8,
  },
  modern: {
    color_button: '#1d4ed8',
    color_background: '#f8fbff',
    color_foreground: '#0f172a',
    color_accent: '#0284c7',
    button_radius: 6,
    card_radius: 10,
    badge_radius: 6,
    input_radius: 6,
  },
  luxury: {
    color_button: '#7c2d12',
    color_background: '#fff9f2',
    color_foreground: '#3f1d0d',
    color_accent: '#b45309',
    button_radius: 2,
    card_radius: 8,
    badge_radius: 4,
    input_radius: 4,
  },
};

async function fetchShopifyTheme(shop: string, accessToken: string): Promise<any> {
  try {
    const response = await fetch(
      `https://${shop}/admin/api/2026-04/themes.json`,
      {
        headers: { 'X-Shopify-Access-Token': accessToken },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch themes:', await response.text());
      return null;
    }

    const data = await response.json();
    const activeTheme = data.themes?.find((t: any) => t.role === 'main');
    return activeTheme;
  } catch (error) {
    console.error('Error fetching Shopify theme:', error);
    return null;
  }
}

async function fetchThemeSettings(shop: string, accessToken: string, themeId: string): Promise<any> {
  try {
    const response = await fetch(
      `https://${shop}/admin/api/2026-04/themes/${themeId}/assets.json?asset[key]=config/settings_data.json`,
      {
        headers: { 'X-Shopify-Access-Token': accessToken },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch theme settings:', await response.text());
      return null;
    }

    const data = await response.json();
    const asset = data.asset;
    
    if (asset && asset.value) {
      return JSON.parse(asset.value);
    }
    return null;
  } catch (error) {
    console.error('Error fetching theme settings:', error);
    return null;
  }
}

async function fetchThemeAsset(shop: string, accessToken: string, themeId: string, assetKey: string): Promise<string | null> {
  const response = await fetch(
    `https://${shop}/admin/api/2026-04/themes/${themeId}/assets.json?asset[key]=${encodeURIComponent(assetKey)}`,
    {
      headers: { 'X-Shopify-Access-Token': accessToken },
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data?.asset?.value || null;
}

async function updateThemeSettings(shop: string, accessToken: string, themeId: string, settingsData: any) {
  const response = await fetch(
    `https://${shop}/admin/api/2026-04/themes/${themeId}/assets.json`,
    {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        asset: {
          key: 'config/settings_data.json',
          value: JSON.stringify(settingsData),
        },
      }),
    }
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Theme update failed: ${details}`);
  }
}

async function updateThemeAsset(shop: string, accessToken: string, themeId: string, assetKey: string, value: string) {
  const response = await fetch(
    `https://${shop}/admin/api/2026-04/themes/${themeId}/assets.json`,
    {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        asset: {
          key: assetKey,
          value,
        },
      }),
    }
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Theme asset update failed for ${assetKey}: ${details}`);
  }
}

const LEOFORA_MOTION_START = '/* LEOFORA_MOTION_START */';
const LEOFORA_MOTION_END = '/* LEOFORA_MOTION_END */';

function buildLeoforaMotionCss(preset: ThemePreset) {
  return `${LEOFORA_MOTION_START}
.card, .card-wrapper .card, .product-card-wrapper .card, .collection .card, .banner__box, .rich-text__blocks, .multicolumn-card, .slider__slide .card {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  border-radius: ${preset.card_radius ?? 24}px;
}

.card::before, .card-wrapper .card::before, .product-card-wrapper .card::before, .collection .card::before, .banner__box::before, .rich-text__blocks::before, .multicolumn-card::before, .slider__slide .card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 2px;
  background:
    radial-gradient(16px 8px at 8% 12%, rgba(55, 128, 81, 0.85) 0 45%, transparent 50%),
    radial-gradient(14px 7px at 78% 14%, rgba(128, 184, 94, 0.78) 0 45%, transparent 50%),
    radial-gradient(14px 7px at 14% 84%, rgba(45, 127, 79, 0.78) 0 45%, transparent 50%),
    radial-gradient(16px 8px at 88% 86%, rgba(181, 215, 132, 0.82) 0 45%, transparent 50%),
    linear-gradient(120deg, rgba(67, 144, 90, 0.92), rgba(181, 215, 132, 0.86), rgba(52, 116, 74, 0.92));
  background-size: 180% 180%;
  animation: leofora-vine-drift 8s linear infinite;
  pointer-events: none;
  z-index: 0;
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.card > *, .card-wrapper .card > *, .product-card-wrapper .card > *, .collection .card > *, .banner__box > *, .rich-text__blocks > *, .multicolumn-card > *, .slider__slide .card > * {
  position: relative;
  z-index: 1;
}

.button, .shopify-payment-button__button, .button--primary {
  border-radius: ${preset.button_radius ?? 14}px !important;
  box-shadow: 0 14px 30px rgba(45, 127, 79, 0.18);
}

@keyframes leofora-vine-drift {
  0% {
    background-position: 0% 50%;
    filter: hue-rotate(0deg);
  }
  50% {
    background-position: 100% 50%;
    filter: hue-rotate(8deg);
  }
  100% {
    background-position: 0% 50%;
    filter: hue-rotate(0deg);
  }
}
${LEOFORA_MOTION_END}`;
}

async function applyLeoforaMotionToTheme(shop: string, accessToken: string, themeId: string, preset: ThemePreset) {
  const candidateAssets = ['assets/base.css', 'assets/theme.css', 'assets/component-card.css'];
  const motionCss = buildLeoforaMotionCss(preset);

  for (const assetKey of candidateAssets) {
    const existing = await fetchThemeAsset(shop, accessToken, themeId, assetKey);
    if (existing === null) {
      continue;
    }

    const stripped = existing.replace(new RegExp(`${LEOFORA_MOTION_START}[\\s\\S]*?${LEOFORA_MOTION_END}`, 'g'), '').trimEnd();
    const nextValue = `${stripped}\n\n${motionCss}\n`;
    await updateThemeAsset(shop, accessToken, themeId, assetKey, nextValue);
    return assetKey;
  }

  throw new Error('No supported Shopify stylesheet asset was found to apply Leofora motion styles.');
}

function applyPresetToSettings(settings: any, preset: ThemePreset) {
  const next = JSON.parse(JSON.stringify(settings || {}));
  next.current = next.current || {};

  // Common Dawn-like keys used by Shopify themes.
  next.current.color_button = preset.color_button;
  next.current.color_background = preset.color_background;
  next.current.color_foreground = preset.color_foreground;
  next.current.color_accent = preset.color_accent;

  // Existing keys used elsewhere in this app.
  next.current.colors_background_1 = preset.color_background;
  next.current.colors_background_2 = preset.color_foreground;
  next.current.colors_text = preset.color_foreground;
  next.current.colors_text_field = preset.color_accent;

  // Common style knobs available in many Shopify themes.
  if (typeof preset.button_radius === 'number') {
    next.current.buttons_radius = preset.button_radius;
    next.current.buttons_border_radius = preset.button_radius;
  }
  if (typeof preset.card_radius === 'number') {
    next.current.card_corner_radius = preset.card_radius;
    next.current.cards_radius = preset.card_radius;
  }
  if (typeof preset.badge_radius === 'number') {
    next.current.badges_corner_radius = preset.badge_radius;
  }
  if (typeof preset.input_radius === 'number') {
    next.current.inputs_radius = preset.input_radius;
  }

  return next;
}

function extractColors(shopifySettings: any): ThemeColors {
  const current = shopifySettings?.current || {};
  
  // Extract colors from Shopify settings
  return {
    primary: current?.colors_background_1 || '#2d7f4f',
    secondary: current?.colors_background_2 || '#1a3d0a',
    accent: current?.colors_text_field || '#2f7e52',
    background: current?.colors_background_1 || '#f6faf3',
    text: current?.colors_text || '#1d4d22',
  };
}

export async function POST(request: NextRequest) {
  const session = getShopifySession();
  const body = await request.json().catch(() => ({}));
  
  const requestShop = String(body?.shop || '').trim();
  const requestToken = String(body?.accessToken || '').trim();

  const shopDomain = session.shopDomain || requestShop;
  const accessToken = getShopifyAccessToken() || requestToken;

  if (!shopDomain || !accessToken) {
    return NextResponse.json(
      { error: 'Shopify store not connected. Connect first at /setup or provide shop and accessToken.' },
      { status: 400 }
    );
  }

  try {
    const action = body?.action || 'apply-store-makeover';
    const presetKey = String(body?.preset || 'leofora-signature').toLowerCase();
    const selectedPreset = PRESETS[presetKey] || PRESETS['leofora-signature'];

    // Fetch active theme
    const theme = await fetchShopifyTheme(shopDomain, accessToken);
    if (!theme) {
      return NextResponse.json(
        { error: 'No active theme found on Shopify store.' },
        { status: 404 }
      );
    }

    // Fetch theme settings
    const settings = await fetchThemeSettings(
      shopDomain,
      accessToken,
      theme.id
    );

    if (!settings) {
      return NextResponse.json(
        { error: 'Unable to load current Shopify theme settings.' },
        { status: 500 }
      );
    }

    if (action === 'apply-store-makeover') {
      const updatedSettings = applyPresetToSettings(settings, selectedPreset);
      await updateThemeSettings(shopDomain, accessToken, theme.id, updatedSettings);
      await applyLeoforaMotionToTheme(shopDomain, accessToken, theme.id, selectedPreset);
    }

    // Extract color palette
    const refreshedSettings = await fetchThemeSettings(shopDomain, accessToken, theme.id);
    const colors = extractColors(refreshedSettings || settings);

    // Generate CSS variables
    const cssVariables = `
:root {
  --color-primary: ${colors.primary};
  --color-secondary: ${colors.secondary};
  --color-accent: ${colors.accent};
  --color-background: ${colors.background};
  --color-text: ${colors.text};
}

body {
  background: var(--color-background);
  color: var(--color-text);
}

button, a.button {
  background: var(--color-primary);
}

h1, h2, h3 {
  color: var(--color-secondary);
}

input, select, textarea {
  border-color: var(--color-accent);
}
    `;

    return NextResponse.json({
      success: true,
      message: action === 'apply-store-makeover'
        ? 'Shopify storefront theme was updated successfully.'
        : 'Shopify theme synced successfully',
      theme: {
        name: theme.name,
        id: theme.id,
        appliedPreset: action === 'apply-store-makeover' ? presetKey : null,
        colors,
        cssVariables,
      },
    });
  } catch (error) {
    console.error('Theme sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync Shopify theme.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const session = getShopifySession();

  if (!session.installed || !session.shopDomain) {
    return NextResponse.json(
      { error: 'Shopify store not connected.' },
      { status: 400 }
    );
  }

  const accessToken = getShopifyAccessToken();
  if (!accessToken) {
    return NextResponse.json(
      { error: 'Missing Shopify access token.' },
      { status: 400 }
    );
  }

  try {
    const theme = await fetchShopifyTheme(session.shopDomain, accessToken);
    if (!theme) {
      return NextResponse.json(
        { error: 'No active theme found.' },
        { status: 404 }
      );
    }

    const settings = await fetchThemeSettings(
      session.shopDomain,
      accessToken,
      theme.id
    );

    const colors = extractColors(settings);

    return NextResponse.json({
      theme: {
        name: theme.name,
        id: theme.id,
        colors,
      },
    });
  } catch (error) {
    console.error('Error fetching theme:', error);
    return NextResponse.json(
      { error: 'Failed to fetch theme.' },
      { status: 500 }
    );
  }
}
