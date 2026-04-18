/**
 * Service Layer (BusServices)
 * Contains the Business Rules and Data structural processing logic.
 * Only this file is permitted to communicate with the database (bus-schedule.json file).
 */
import fs from 'fs/promises';
import path from 'path';
import type { BusRoute } from '../types/busTypes.js';
import { fileURLToPath } from 'url';

// A standard approach in ES Modules to get the current file's directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Relative location of the JSON data file from this JS file's path
const dataPath = path.join(__dirname, '../data/bus-schedule.json');

/**
 * Standard internal function to retrieve ALL bus routes by reading the local JSON text file.
 */
export const getBusData = async (): Promise<BusRoute[]> => {
    // Read the raw string content inside the JSON file
    const data = await fs.readFile(dataPath, 'utf8');
    // Parse the raw text string to convert it into actual JS objects
    const parsed = JSON.parse(data);
    return parsed.routes;
};

/**
 * Function to retrieve all routes dynamically based on query string filters (if any).
 * @param query Query string object from the user request (e.g., ?count=5&origin=JKT)
 */
export const getRoutes = async (query: any): Promise<BusRoute[]> => {
    let routes = await getBusData();
    
    // Filter the routes by destination if the parameter is provided
    if (query.destination) {
        routes = routes.filter(r => r.destination === query.destination);
    }
    
    // Filter the routes by origin if the parameter is provided
    if (query.origin) {
         routes = routes.filter(r => r.origin === query.origin);
    }
    
    // Check Date strings by matching the slice/start of the string
    // Useful when users input dates like ?arrival=2026-05-01 over the exact 2026-05-01T08:00Z value
    if (query.arrival) {
        routes = routes.filter(r => r.arrivalDate.startsWith(query.arrival));
    }
    
    // Limit the resulting array length if the 'count' parameter is active
    if (query.count !== undefined) {
        const count = parseInt(query.count as string, 10);
        // Ensure successful conversion into integers
        if (!isNaN(count)) {
            // Slice the array sequentially (from 0 up to the 'count' bounds)
            routes = routes.slice(0, count);
        }
    }
    
    // Return exclusively filtered routes back to the Controller
    return routes;
};

/**
 * Identify a single specific Route row object by its "ID".
 * @param id  The unique Primary Key string of the bus
 */
export const getRouteById = async (id: string): Promise<BusRoute | undefined> => {
    const routes = await getBusData();
    // find() returns 1 exact value if the condition identically matches the id parameter
    return routes.find(r => r.id === id);
};
