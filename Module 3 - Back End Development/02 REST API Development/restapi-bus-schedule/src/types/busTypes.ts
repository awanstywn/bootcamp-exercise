/**
 * Type contract (interface) for the Bus Route schedule.
 * Defines the specific properties required for a bus object to ensure
 * strict Type Safety when writing code or fetching data from configuration files.
 */
export interface BusRoute {
  id: string; // Unique route ID (e.g., JKT-SUB)
  origin: string; // Departure city code
  destination: string; // Destination city code
  departureDate: string; // Time of departure (ISO8601 string)
  arrivalDate: string; // Estimated arrival time (ISO8601 string)
  quota: number; // Remaining bus seat quota
  active: boolean; // Operational status of the bus
}