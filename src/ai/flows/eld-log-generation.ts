'use server';

/**
 * @fileOverview A flow for generating ELD daily log sheets with a visual timeline.
 *
 * - generateEldLog - A function that handles the ELD log generation process.
 * - EldLogInput - The input type for the generateEldLog function.
 * - EldLogOutput - The return type for the generateEldLog function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EldLogInputSchema = z.object({
  currentLocation: z.string().describe('The current location of the truck driver.'),
  pickupLocation: z.string().describe('The pickup location for the current trip.'),
  dropoffLocation: z.string().describe('The dropoff location for the current trip.'),
  cycleHoursUsed: z.number().describe('The number of cycle hours already used.'),
  driverName: z.string().describe('The name of the truck driver.'),
  date: z.string().describe('The date for the log sheet (month/day/year).'),
  truckNumber: z.string().describe('The truck/tractor number.'),
  trailerNumber: z.string().describe('The trailer number.'),
  carrierName: z.string().describe('The carrier name.'),
  homeTerminalTimezone: z.string().describe('The home terminal timezone.'),
  shippingDocumentNumbers: z.string().describe('The shipping document numbers or commodity description.'),
  dutyStatusChanges: z.array(z.object({
    time: z.string().describe('The time of the duty status change.'),
    location: z.string().describe('The city/town and state abbreviation (or nearest highway/milepost).'),
    status: z.enum(['Off Duty', 'Sleeper Berth', 'Driving', 'On Duty (Not Driving)']).describe('The duty status.'),
  })).describe('An array of duty status changes throughout the day.'),
});
export type EldLogInput = z.infer<typeof EldLogInputSchema>;

const EldLogOutputSchema = z.object({
  logSheet: z.string().describe('A formatted ELD daily log sheet with a visual timeline representation.'),
  remainingHours: z.object({
    drivingHours: z.number().describe('The remaining driving hours available.'),
    onDutyHours: z.number().describe('The remaining on-duty hours available.'),
  }).describe('The remaining driving and on-duty hours available to the driver.'),
});
export type EldLogOutput = z.infer<typeof EldLogOutputSchema>;

export async function generateEldLog(input: EldLogInput): Promise<EldLogOutput> {
  return eldLogGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'eldLogPrompt',
  input: {schema: EldLogInputSchema},
  output: {schema: EldLogOutputSchema},
  prompt: `You are an expert in trucking regulations and ELD log sheet generation.

  Based on the provided information, create an accurate ELD daily log sheet with a visual timeline representation.
  Ensure the log sheet complies with all federal regulations and includes all required information.
  Also, calculate and provide the remaining driving and on-duty hours available to the driver.

  Driver Information:
  - Name: {{{driverName}}}
  - Date: {{{date}}}
  - Truck Number: {{{truckNumber}}}
  - Trailer Number: {{{trailerNumber}}}
  - Carrier Name: {{{carrierName}}}
  - Home Terminal Timezone: {{{homeTerminalTimezone}}}
  - Shipping Document Numbers: {{{shippingDocumentNumbers}}}

  Duty Status Changes:
  {{#each dutyStatusChanges}}
  - Time: {{{time}}}, Location: {{{location}}}, Status: {{{status}}}
  {{/each}}

  Current Location: {{{currentLocation}}}
  Pickup Location: {{{pickupLocation}}}
  Dropoff Location: {{{dropoffLocation}}}
  Cycle Hours Used: {{{cycleHoursUsed}}}

  Output the log sheet in a readable format and provide the remaining driving and on-duty hours.
  `,
});

const eldLogGenerationFlow = ai.defineFlow(
  {
    name: 'eldLogGenerationFlow',
    inputSchema: EldLogInputSchema,
    outputSchema: EldLogOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
