/**
 * @file addresses.service.ts
 * @description Business Logic Service for the Server (Backend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for addresses.service operations.
 * 
 * @relations
 * Interacts with: ../lib/prisma.
 * 
 * @howItWorks
 * Interacts directly with the database (e.g., Prisma) or external APIs to execute core application rules. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import prisma from "../lib/prisma";

interface AddressInput {
  title: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault?: boolean;
}

export async function getUserAddresses(userId: string) {
  return prisma.userAddress.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function createAddress(userId: string, data: AddressInput) {
  // Check limit
  const count = await prisma.userAddress.count({ where: { userId } });
  if (count >= 5) {
    const error: any = new Error("Maximum of 5 addresses allowed");
    error.statusCode = 400;
    throw error;
  }

  // If first address, make it default automatically
  let makeDefault = data.isDefault || count === 0;

  if (makeDefault) {
    // Unset other defaults
    await prisma.userAddress.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  return prisma.userAddress.create({
    data: {
      userId,
      title: data.title,
      address: data.address,
      city: data.city,
      province: data.province,
      postalCode: data.postalCode,
      isDefault: makeDefault,
    },
  });
}

export async function deleteAddress(userId: string, id: string) {
  // Ensure it belongs to user
  const address = await prisma.userAddress.findFirst({
    where: { id, userId },
  });

  if (!address) {
    const error: any = new Error("Address not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.userAddress.delete({ where: { id } });

  // If we deleted the default, set another one as default if any exists
  if (address.isDefault) {
    const nextAddress = await prisma.userAddress.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    if (nextAddress) {
      await prisma.userAddress.update({
        where: { id: nextAddress.id },
        data: { isDefault: true },
      });
    }
  }

  return { message: "Address deleted" };
}

export async function setDefaultAddress(userId: string, id: string) {
  const address = await prisma.userAddress.findFirst({
    where: { id, userId },
  });

  if (!address) {
    const error: any = new Error("Address not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.userAddress.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false },
  });

  return prisma.userAddress.update({
    where: { id },
    data: { isDefault: true },
  });
}
