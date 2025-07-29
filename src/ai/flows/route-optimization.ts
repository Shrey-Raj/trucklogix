'use server';

/**
 * @fileOverview Optimizes a route for truck drivers, including mandatory stops for fuel and rest breaks.
 *
 * - optimizeRoute - A function that handles the route optimization process.
 * - OptimizeRouteInput - The input type for the optimizeRoute function.
 * - OptimizeRouteOutput - The return type for the optimizeRoute function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeRouteInputSchema = z.object({
  currentLocation: z.string().describe('The current location of the truck driver.'),
  pickupLocation: z.string().describe('The pickup location for the load.'),
  dropoffLocation: z.string().describe('The dropoff location for the load.'),
  currentCycleHoursUsed: z
    .number()
    .describe('The number of hours the driver has already used in the current cycle.'),
});
export type OptimizeRouteInput = z.infer<typeof OptimizeRouteInputSchema>;

const OptimizeRouteOutputSchema = z.object({
  optimizedRoute: z.string().describe('The optimized route, including fuel and rest stops.'),
  fuelStops: z.array(z.string()).describe('List of fuel stop locations.'),
  restBreakStops: z.array(z.string()).describe('List of rest break locations.'),
  estimatedTravelTime: z.string().describe('The estimated travel time for the optimized route.'),
  estimatedFuelConsumption: z
    .string()
    .describe('The estimated fuel consumption for the optimized route.'),
  coordinates: z.object({
    current: z.tuple([z.number(), z.number()]).describe('Coordinates [longitude, latitude] of the current location.'),
    pickup: z.tuple([z.number(), z.number()]).describe('Coordinates [longitude, latitude] of the pickup location.'),
    dropoff: z.tuple([z.number(), z.number()]).describe('Coordinates [longitude, latitude] of the dropoff location.'),
  }).describe('Geographical coordinates for current, pickup, and dropoff locations.'),
  directions: z.object({}).describe('List of latitudes and longitudes as per the optimised route.'),
});
export type OptimizeRouteOutput = z.infer<typeof OptimizeRouteOutputSchema>;

export async function optimizeRoute(input: OptimizeRouteInput): Promise<OptimizeRouteOutput> {
  return optimizeRouteFlow(input);
}

const getRoute = ai.defineTool({
  name: 'getRoute',
  description: 'Returns an optimized route between a pickup and dropoff location, including mandatory stops for fuel and rest breaks.  Considers hours of service regulations when generating routes.',
  inputSchema: z.object({
    currentLocation: z.string().describe('The current location of the truck driver.'),
    pickupLocation: z.string().describe('The pickup location for the load.'),
    dropoffLocation: z.string().describe('The dropoff location for the load.'),
    currentCycleHoursUsed: z
      .number()
      .describe('The number of hours the driver has already used in the current cycle.'),
  }),
  outputSchema: z.object({
    optimizedRoute: z.string().describe('The optimized route, including fuel and rest stops.'),
    fuelStops: z.array(z.string()).describe('List of fuel stop locations.'),
    restBreakStops: z.array(z.string()).describe('List of rest break locations.'),
    estimatedTravelTime: z.string().describe('The estimated travel time for the optimized route.'),
    estimatedFuelConsumption: z
      .string()
      .describe('The estimated fuel consumption for the optimized route.'),
  }),
}, async (input) => {
  // In a real implementation, this would call a routing API like Google Maps, Mapbox, or OpenStreetMap.
  // This is a placeholder implementation that returns a dummy route.
  const dummyRoute = `Current Location: ${input.currentLocation}, Pickup: ${input.pickupLocation}, Dropoff: ${input.dropoffLocation}.  Route: Current -> Fuel Stop -> Pickup -> Rest Stop -> Dropoff`;
  const dummyFuelStops = ['Fuel Stop 1'];
  const dummyRestStops = ['Rest Stop 1'];
  const dummyTravelTime = '6 hours';
  const dummyFuelConsumption = '100 gallons';

  return {
    optimizedRoute: dummyRoute,
    fuelStops: dummyFuelStops,
    restBreakStops: dummyRestStops,
    estimatedTravelTime: dummyTravelTime,
    estimatedFuelConsumption: dummyFuelConsumption,
  };
});

const prompt = ai.definePrompt({
  name: 'optimizeRoutePrompt',
  tools: [getRoute],
  input: {schema: OptimizeRouteInputSchema},
  output: {schema: OptimizeRouteOutputSchema},
  prompt: `You are a route optimization expert for truck drivers. You will take the current location, pickup location, dropoff location, and current cycle hours used to generate an optimized route that includes mandatory stops for fuel and rest breaks. Make use of the getRoute tool.

  Current Location: {{{currentLocation}}}
  Pickup Location: {{{pickupLocation}}}
  Dropoff Location: {{{dropoffLocation}}}
  Current Cycle Hours Used: {{{currentCycleHoursUsed}}}
  `,
  system: `Use the getRoute tool to generate the optimized route. Be sure to consider Hours of Service (HOS) regulations.`, 
});

const optimizeRouteFlow = ai.defineFlow(
  {
    name: 'optimizeRouteFlow',
    inputSchema: OptimizeRouteInputSchema,
    outputSchema: OptimizeRouteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
