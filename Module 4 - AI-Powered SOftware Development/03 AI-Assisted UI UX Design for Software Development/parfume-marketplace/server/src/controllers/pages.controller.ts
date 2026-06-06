/**
 * @file pages.controller.ts
 * @description API Controller for the Server (Backend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for pages.controller operations.
 * 
 * @relations
 * Interacts with: express, ../lib/prisma, shared.
 * 
 * @howItWorks
 * Extracts request payloads/params, delegates business logic to services, and formats the HTTP response. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { ContentPageUpdateInput } from "shared";

// Public: Get page by slug
export const getPageBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const page = await prisma.contentPage.findUnique({
      where: { slug },
    });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: page,
    });
  } catch (error) {
    console.error("Error fetching page:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch page",
    });
  }
};

// Admin: List all pages
export const listPages = async (req: Request, res: Response) => {
  try {
    const pages = await prisma.contentPage.findMany({
      orderBy: { title: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: pages,
    });
  } catch (error) {
    console.error("Error fetching pages:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pages",
    });
  }
};

// Admin: Update page content
export const updatePage = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { title, content } = req.body as ContentPageUpdateInput;

    const page = await prisma.contentPage.update({
      where: { slug },
      data: { title, content },
    });

    return res.status(200).json({
      success: true,
      message: "Page updated successfully",
      data: page,
    });
  } catch (error: any) {
    console.error("Error updating page:", error);
    if (error.code === 'P2025') { // Prisma RecordNotFound
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update page",
    });
  }
};
