/**
 * API Routing Map Layer (Endpoints).
 * Primarily bridges which specific URL addresses possess the right 
 * to execute designated handler functions nested inside Controller modules.
 */
import { Router } from 'express';
import { getAllBusRoutes, getBusRouteById } from '../controllers/busController.js';
import { validateQueryParameters } from '../middlewares/validation.js';

const router = Router();

// Base extraction endpoints ('/' translates realistically to '/routes' globally when mapped in index.ts)
// The sequence calls upon the `validateQueryParameters` guardian first to filter data, before eventually proceeding to `getAllBusRoutes`.
router.get('/', validateQueryParameters, getAllBusRoutes);

// Parameterized endpoint designated to fetching a distinct element using route IDs strictly passed as URL API variables.
router.get('/:id', getBusRouteById);

export default router;
