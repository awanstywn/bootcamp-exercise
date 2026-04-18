/**
 * Controller Layer
 * Serves as the bridge between the external User Request Endpoints and the backend Service logic.
 * Every HTTP Response formats and Error dispatches (JSON, 200, 400, 404, 500) are handled here.
 */
import type { Request, Response, NextFunction } from 'express';
import { getRoutes, getRouteById } from '../services/busServices.js';

/**
 * Main Controller for the general GET /routes/ collection.
 * Supplies literal string query parameters uniformly to busServices.
 */
export const getAllBusRoutes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Forward query arguments (e.g., ?count=5) to the service layer 
        const routes = await getRoutes(req.query);
        res.status(200).json(routes);
    } catch (error) {
        // In the advent of an internal system crash, pass it on to our global error catcher in the Index Layer
        next(error);
    }
};

/**
 * Controller to fetch 1 isolated & specific Bus Route entity (GET /routes/:id)
 */
export const getBusRouteById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Extract the target ID supplied from the naming `/:id`
        // We inject the `as string` Type Assertion keyword to assure the compiler that this parameter must be a string.
        const id = req.params.id as string;
        const route = await getRouteById(id);
        
        // Ensure that the service actually returned a result before dispatching it to the public payload.
        if (!route) {
            // Evaluated if the ID doesn't correspond to any entity in our JSON records.
            res.status(404).json({ error: "Route not found" });
            return;
        }
        res.status(200).json(route);
    } catch (error) {
        next(error);
    }
};
