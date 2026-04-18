/**
 * Analytics Route
 * 
 * Provides exposure enabling administrators visibility examining active metric summaries across mapped URL usages. 
 * Supports both HTML dashboard views rendering formats natively alongside programmatically raw JSON data.
 */

import { Router, Request, Response, NextFunction } from "express";
import { getAnalyticsSummary } from "../services/analyticsService.js";
import { escapeHtml } from "../utils/sanitize.js";

const analyticsRouter = Router();

/**
 * GET /analytics
 * Serves an HTML dashboard populated with visitation statistics.
 */
analyticsRouter.get("/analytics", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await getAnalyticsSummary();
    
    // Construct dynamic rows iterating sequentially building table contents. 
    // Always escape properties originating untrusted contexts.
    const tableRows = summary.summaries.map((item, idx) => {
      return `
        <tr>
          <td>${idx + 1}</td>
          <td>${escapeHtml(item.slug)}</td>
          <td>${item.totalVisits}</td>
          <td>${item.uniqueIps}</td>
          <td>${escapeHtml(Object.keys(item.countries)[0] || "-")}</td>
          <td>${item.lastVisited ? new Date(item.lastVisited).toLocaleString() : "Never"}</td>
        </tr>
      `;
    }).join("");

    // Minimal basic structural layout
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Analytics Dashboard</title>
        <meta charset="utf-8">
        <style>
          body { font-family: sans-serif; padding: 20px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background: #f4f4f4; }
        </style>
      </head>
      <body>
        <h1>Analytics Dashboard</h1>
        <p><strong>Generated:</strong> ${new Date(summary.generatedAt).toLocaleString()}</p>
        <p><strong>Total visits all time:</strong> ${summary.totalVisitsAllTime}</p>
        
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Slug</th>
              <th>Total Visits</th>
              <th>Unique IPs</th>
              <th>Top Country</th>
              <th>Last Visited</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <br>
        <a href="/analytics.json">Lihat raw JSON</a>
      </body>
      </html>
    `;

    res.type("html").send(html);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /analytics.json
 * Feeds structured objects natively providing parsing compatibility allowing third-party reporting processing.
 */
analyticsRouter.get("/analytics.json", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await getAnalyticsSummary();
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

export default analyticsRouter;
