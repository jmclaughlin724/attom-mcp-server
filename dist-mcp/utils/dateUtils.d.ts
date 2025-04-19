/**
 * Date Utility Functions
 *
 * This module provides utility functions for date calculations and formatting
 * used across the ATTOM MCP server.
 */
/**
 * Get the current year as a number
 * @returns Current year (e.g., 2025)
 */
export declare function getCurrentYear(): number;
/**
 * Get a date formatted as YYYY-MM-DD
 * @param date Date to format (defaults to current date)
 * @returns Formatted date string
 */
export declare function formatDateYYYYMMDD(date?: Date): string;
/**
 * Get the date from N days ago
 * @param days Number of days to go back
 * @returns Date object for N days ago
 */
export declare function getDateDaysAgo(days: number): Date;
/**
 * Get a date range for sales history (last 365 days)
 * @returns Object with start and end dates formatted as YYYY-MM-DD
 */
export declare function getSalesDateRange(): {
    startDate: string;
    endDate: string;
};
/**
 * Get a year range for sales trends (last 5 years)
 * @returns Object with start and end years as numbers
 */
export declare function getSalesTrendYearRange(): {
    startYear: number;
    endYear: number;
};
