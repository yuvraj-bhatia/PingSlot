/**
 * Test fixtures for scraper service testing
 */

export const FIXTURES = {
  // Available appointment page
  AVAILABLE_ACUITY: `
# Book an Appointment

DMV License Renewal - Phoenix Office

Available Times for February 2025:

**Monday, February 10**
- 9:00 AM - Available
- 10:30 AM - Available
- 2:00 PM - Available

**Tuesday, February 11**
- 9:00 AM - Available
- 11:00 AM - Available

Select a time to continue with your booking.

[Continue to Book]
`,

  // No availability page
  UNAVAILABLE_GENERIC: `
# Appointments

We're sorry, but there are no appointments available at this time.

All slots for the next 60 days are fully booked.

Please check back later or join our waitlist to be notified 
when new appointments become available.

[Join Waitlist]

Last updated: February 1, 2025
`,

  // Calendly style page
  AVAILABLE_CALENDLY: `
# Schedule a Meeting

Select a Date & Time

February 2025
Su Mo Tu We Th Fr Sa
                  1
2  3  4  5  6  7  8
9  10 11 12 13 14 15

Available times for February 10:
• 9:00am
• 9:30am  
• 10:00am
• 10:30am
• 11:00am

Timezone: America/Phoenix

Powered by Calendly
`,

  // Ambiguous page (should return low confidence)
  AMBIGUOUS: `
# Contact Us

To schedule an appointment, please fill out the form below 
and we will get back to you within 24-48 hours.

Name: [___________]
Email: [___________]
Phone: [___________]
Preferred Date: [___________]

[Submit Request]

Note: Submitting this form does not guarantee an appointment.
`,
};

/**
 * Expected analysis results for testing
 */
export const EXPECTED_RESULTS = {
  AVAILABLE_ACUITY: {
    hasAvailability: true,
    minConfidence: 0.8,
    minSlots: 3,
  },
  UNAVAILABLE_GENERIC: {
    hasAvailability: false,
    maxConfidence: 0.3,
  },
  AVAILABLE_CALENDLY: {
    hasAvailability: true,
    minConfidence: 0.7,
    minSlots: 3,
  },
  AMBIGUOUS: {
    hasAvailability: false,
    maxConfidence: 0.5,
  },
};
