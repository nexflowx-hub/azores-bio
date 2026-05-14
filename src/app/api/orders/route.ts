import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface OrderItemInput {
  productId: number;
  quantity: number;
}

interface CreateOrderBody {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerVat?: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  notes?: string;
  locale?: string;
  currency?: string;
  items: OrderItemInput[];
}

const FREE_SHIPPING_THRESHOLD = 75;
const SHIPPING_COST = 9.99;

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderBody = await request.json();

    // Validate required fields
    if (!body.customerName || !body.customerEmail || !body.shippingAddress || !body.shippingCity || !body.shippingPostalCode || !body.shippingCountry || !body.items?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.customerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Fetch all products in the order
    const productIds = body.items.map((item) => item.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds }, active: true },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'One or more products not found or inactive' },
        { status: 400 }
      );
    }

    // Check stock availability and build order items
    const productMap = new Map(products.map((p) => [p.id, p]));
    let subtotal = 0;
    const orderItemsData: Array<{
      productId: number;
      productName: string;
      productSku: string | null;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }> = [];

    for (const item of body.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product with ID ${item.productId} not found` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${product.name}". Available: ${product.stock}` },
          { status: 400 }
        );
      }

      const unitPrice = product.price;
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });
    }

    // Calculate shipping cost (free above threshold)
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total = subtotal + shippingCost;

    // Generate order number: AZB-{timestamp}-{random4}
    const timestamp = Date.now();
    const random4 = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const orderNumber = `AZB-${timestamp}-${random4}`;

    // Create order with items in a transaction
    const order = await db.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: body.customerName,
          customerEmail: body.customerEmail,
          customerPhone: body.customerPhone,
          customerVat: body.customerVat,
          shippingAddress: body.shippingAddress,
          shippingCity: body.shippingCity,
          shippingPostalCode: body.shippingPostalCode,
          shippingCountry: body.shippingCountry,
          subtotal,
          shippingCost,
          total,
          currency: body.currency || 'EUR',
          notes: body.notes,
          locale: body.locale || 'pt',
          status: 'pending',
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // Generate invoice number: FAT-{year}-{orderId padded 6 digits}
      const year = new Date().getFullYear();
      const orderIdPadded = newOrder.id.toString().padStart(6, '0');
      const invoiceNumber = `FAT-${year}-${orderIdPadded}`;

      // Create invoice
      await tx.invoice.create({
        data: {
          invoiceNumber,
          orderId: newOrder.id,
          customerName: body.customerName,
          customerEmail: body.customerEmail,
          customerVat: body.customerVat,
          customerAddress: `${body.shippingAddress}, ${body.shippingCity} ${body.shippingPostalCode}, ${body.shippingCountry}`,
          subtotal,
          total,
          currency: body.currency || 'EUR',
          status: 'issued',
        },
      });

      // Decrement stock for each product
      for (const item of body.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      return newOrder;
    });

    // Fetch the complete order with invoice
    const completeOrder = await db.order.findUnique({
      where: { id: order.id },
      include: {
        items: true,
        invoice: true,
      },
    });

    return NextResponse.json({
      orderNumber: completeOrder?.orderNumber || orderNumber,
      invoiceNumber: completeOrder?.invoice?.invoiceNumber || `FAT-${new Date().getFullYear()}-${order.id.toString().padStart(6, '0')}`,
      total: completeOrder?.total || total,
      orderId: order.id,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
