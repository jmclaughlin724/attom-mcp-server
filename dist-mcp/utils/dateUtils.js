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
export function getCurrentYear() {
    return new Date().getFullYear();
}
/**
 * Get a date formatted as YYYY-MM-DD
 * @param date Date to format (defaults to current date)
 * @returns Formatted date string
 */
export function formatDateYYYYMMDD(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
/**
 * Get the date from N days ago
 * @param days Number of days to go back
 * @returns Date object for N days ago
 */
export function getDateDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
}
/**
 * Get a date range for sales history (last 365 days)
 * @returns Object with start and end dates formatted as YYYY-MM-DD
 */
export function getSalesDateRange() {
    const endDate = formatDateYYYYMMDD();
    const startDate = formatDateYYYYMMDD(getDateDaysAgo(365));
    return {
        startDate,
        endDate
    };
}
/**
 * Get a year range for sales trends (last 5 years)
 * @returns Object with start and end years as numbers
 */
export function getSalesTrendYearRange() {
    const endYear = getCurrentYear();
    const startYear = endYear - 5;
    return {
        startYear,
        endYear
    };
}
//# sourceMappingURL=dateUtils.js.map