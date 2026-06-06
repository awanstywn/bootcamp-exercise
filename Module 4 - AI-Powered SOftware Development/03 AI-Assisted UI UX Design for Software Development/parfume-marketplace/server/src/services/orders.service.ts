/**
 * @file orders.service.ts
 * @description Business Logic Service for the Server (Backend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for orders.service operations.
 * 
 * @relations
 * Interacts with: ../lib/prisma, @prisma/client, shared.
 * 
 * @howItWorks
 * Interacts directly with the database (e.g., Prisma) or external APIs to execute core application rules. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";
import type { OrderCreateInput, OrderQueryInput } from "shared";

function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${dateStr}-${random}`;
}

function serializeOrder(order: any) {
  return {
    ...order,
    shippingCost: Number(order.shippingCost),
    subtotal: Number(order.subtotal),
    total: Number(order.total),
    items: order.items?.map((item: any) => ({
      ...item,
      price: Number(item.price),
    })) || [],
  };
}

export async function createOrder(data: OrderCreateInput, userId?: string) {
  // Fetch all products in the order to validate stock and get current prices
  const productIds = data.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, status: "ACTIVE" },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  if (products.length !== productIds.length) {
    const error: any = new Error("One or more products are not available");
    error.statusCode = 400;
    throw error;
  }

  // Validate stock
  for (const item of data.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      const error: any = new Error(`Product ${item.productId} not found`);
      error.statusCode = 400;
      throw error;
    }
    if (product.stock < item.quantity) {
      const error: any = new Error(
        `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
      );
      error.statusCode = 400;
      throw error;
    }
  }

  // Calculate totals
  let subtotal = 0;
  const orderItems = data.items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    const itemTotal = Number(product.price) * item.quantity;
    subtotal += itemTotal;

    return {
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      imageUrl: product.images[0]?.url || product.imageUrl,
      price: product.price,
      volumeMl: product.volumeMl,
      quantity: item.quantity,
    };
  });

  const shippingCost = 0; // Free shipping
  const total = subtotal + shippingCost;

  // Create order and decrement stock in a transaction
  const order = await prisma.$transaction(async (tx) => {
    // Decrement stock for each product
    for (const item of data.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Create the order
    return tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        address: data.address,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        note: data.note || null,
        shippingMethod: data.shippingMethod,
        shippingCost: new Prisma.Decimal(shippingCost),
        subtotal: new Prisma.Decimal(subtotal),
        total: new Prisma.Decimal(total),
        userId: userId || null,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });
  });

  return serializeOrder(order);
}

export async function getOrderById(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
    },
  });

  if (!order) {
    const error: any = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  return serializeOrder(order);
}

export async function getOrdersByUserId(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return orders.map(serializeOrder);
}

export async function listOrders(query: OrderQueryInput) {
  const { status, page, limit } = query;

  const where: Prisma.OrderWhereInput = {};
  if (status) where.status = status as any;

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders: orders.map(serializeOrder),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateOrderStatus(id: string, status: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    const error: any = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  // If canceling, restore stock
  if (status === "CANCELED" && order.status !== "CANCELED") {
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      await tx.order.update({
        where: { id },
        data: { status: status as any },
      });
    });
  } else {
    await prisma.order.update({
      where: { id },
      data: { status: status as any },
    });
  }

  const updated = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  return serializeOrder(updated);
}

export async function cancelOrderByCustomer(orderId: string, userId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    const error: any = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  if (order.userId !== userId) {
    const error: any = new Error("You can only cancel your own orders");
    error.statusCode = 403;
    throw error;
  }

  // Customer can only cancel before PROCESSING
  const cancellableStatuses = ["PENDING_PAYMENT", "CONFIRMED"];
  if (!cancellableStatuses.includes(order.status)) {
    const error: any = new Error("Order cannot be canceled at this stage");
    error.statusCode = 400;
    throw error;
  }

  return updateOrderStatus(orderId, "CANCELED");
}

export async function uploadPaymentProof(orderId: string, userId: string, paymentProofUrl: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    const error: any = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  if (order.userId !== userId) {
    const error: any = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }

  if (order.status !== "PENDING_PAYMENT") {
    const error: any = new Error("Order is not pending payment");
    error.statusCode = 400;
    throw error;
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "PAID",
      paymentProofUrl,
      paidAt: new Date(),
    },
    include: { items: true },
  });

  return serializeOrder(updated);
}
