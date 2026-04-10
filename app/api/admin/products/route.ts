import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { adminProducts, getNextAdminProductId } from '../../../../lib/admin-products-store';

type AdminUser = { username: string; role: 'admin' | 'manager' } | null;

async function sendAdminNotification(subject: string, message: string) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: 'niamarket.ke',
      subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent');
  } catch (error) {
    console.error('Failed to send admin email:', error);
  }
}

function decodeToken(token: string): AdminUser {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parsed = JSON.parse(decoded);
    return { username: parsed.username, role: parsed.role };
  } catch {
    return null;
  }
}

function requireAuth(request: NextRequest): AdminUser {
  const header = request.headers.get('authorization') || '';
  const token = header.replace(/^Bearer\s+/i, '');
  if (!token) {
    return null;
  }
  return decodeToken(token);
}

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(adminProducts);
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const nextId = getNextAdminProductId();
    const newProduct = {
      id: nextId,
      name: body.name || 'New product',
      price: Number(body.price) || 0,
      sku: body.sku || `SKU-${nextId}`,
      shopifyId: body.shopifyId || `prod-${nextId}`,
      inStock: body.inStock !== false,
      stock: Number(body.stock) || 0,
      supplierId: body.supplierId || 'unassigned',
      supplierName: body.supplierName || 'Unassigned',
    };
    adminProducts.push(newProduct);
    await sendAdminNotification(
      'New Product Added',
      `A new product has been added: ${newProduct.name} (SKU: ${newProduct.sku}) by ${auth.username}`
    );
    return NextResponse.json({ success: true, product: newProduct });
  } catch {
    return NextResponse.json({ error: 'Unable to create product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const product = adminProducts.find((item) => item.id === Number(body.id));
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    product.name = body.name || product.name;
    product.price = Number(body.price) || product.price;
    product.sku = body.sku || product.sku;
    product.shopifyId = body.shopifyId || product.shopifyId;
    product.inStock = body.inStock !== undefined ? body.inStock : product.inStock;
    product.stock = Number(body.stock) || product.stock;
    product.supplierId = body.supplierId || product.supplierId;
    product.supplierName = body.supplierName || product.supplierName;
    await sendAdminNotification(
      'Product Updated',
      `Product updated: ${product.name} (SKU: ${product.sku}) by ${auth.username}`
    );
    return NextResponse.json({ success: true, product });
  } catch {
    return NextResponse.json({ error: 'Unable to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (auth.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const id = Number(body.id);
    const index = adminProducts.findIndex((item) => item.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    const product = adminProducts[index];
    adminProducts.splice(index, 1);
    await sendAdminNotification(
      'Product Deleted',
      `Product deleted: ${product.name} (SKU: ${product.sku}) by ${auth.username}`
    );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete product' }, { status: 500 });
  }
}
