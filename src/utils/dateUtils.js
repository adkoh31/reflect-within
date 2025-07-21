/**
 * Centralized Date Utilities with Validation
 * Prevents Date serialization errors and provides consistent date handling
 */

/**
 * Safely create a Date object with validation
 * @param {any} dateInput - Date string, Date object, or timestamp
 * @returns {Date|null} - Valid Date object or null if invalid
 */
export const safeCreateDate = (dateInput) => {
  if (!dateInput) return null;
  
  // If already a Date object, validate it
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }
  
  // Try to create a new Date
  try {
    const date = new Date(dateInput);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.warn('Invalid date input:', dateInput, error);
    return null;
  }
};

/**
 * Safely format a date for display
 * @param {any} dateInput - Date string, Date object, or timestamp
 * @param {Object} options - Intl.DateTimeFormatOptions
 * @returns {string} - Formatted date string or 'Invalid Date'
 */
export const safeFormatDate = (dateInput, options = {}) => {
  const date = safeCreateDate(dateInput);
  if (!date) return 'Invalid Date';
  
  try {
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Safely format a time for display
 * @param {any} dateInput - Date string, Date object, or timestamp
 * @param {Object} options - Intl.DateTimeFormatOptions
 * @returns {string} - Formatted time string or 'Invalid Time'
 */
export const safeFormatTime = (dateInput, options = {}) => {
  const date = safeCreateDate(dateInput);
  if (!date) return 'Invalid Time';
  
  try {
    return date.toLocaleTimeString('en-US', options);
  } catch (error) {
    console.warn('Time formatting error:', error);
    return 'Invalid Time';
  }
};

/**
 * Safely convert date to ISO string
 * @param {any} dateInput - Date string, Date object, or timestamp
 * @returns {string|null} - ISO string or null if invalid
 */
export const safeToISOString = (dateInput) => {
  const date = safeCreateDate(dateInput);
  if (!date) return null;
  
  try {
    return date.toISOString();
  } catch (error) {
    console.warn('ISO string conversion error:', error);
    return null;
  }
};

/**
 * Safely get date key (YYYY-MM-DD format)
 * @param {any} dateInput - Date string, Date object, or timestamp
 * @returns {string|null} - Date key or null if invalid
 */
export const safeGetDateKey = (dateInput) => {
  const isoString = safeToISOString(dateInput);
  if (!isoString) return null;
  
  return isoString.split('T')[0];
};

/**
 * Check if two dates are the same day
 * @param {any} date1 - First date
 * @param {any} date2 - Second date
 * @returns {boolean} - True if same day
 */
export const isSameDay = (date1, date2) => {
  const d1 = safeCreateDate(date1);
  const d2 = safeCreateDate(date2);
  
  if (!d1 || !d2) return false;
  
  return d1.toDateString() === d2.toDateString();
};

/**
 * Check if date is today
 * @param {any} dateInput - Date to check
 * @returns {boolean} - True if today
 */
export const isToday = (dateInput) => {
  return isSameDay(dateInput, new Date());
};

/**
 * Check if date is yesterday
 * @param {any} dateInput - Date to check
 * @returns {boolean} - True if yesterday
 */
export const isYesterday = (dateInput) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(dateInput, yesterday);
};

/**
 * Get relative date string (Today, Yesterday, or formatted date)
 * @param {any} dateInput - Date to format
 * @returns {string} - Relative date string
 */
export const getRelativeDate = (dateInput) => {
  if (isToday(dateInput)) return 'Today';
  if (isYesterday(dateInput)) return 'Yesterday';
  
  return safeFormatDate(dateInput, { 
    month: 'short', 
    day: 'numeric' 
  });
};

/**
 * Get days difference between two dates
 * @param {any} date1 - First date
 * @param {any} date2 - Second date
 * @returns {number} - Days difference
 */
export const getDaysDifference = (date1, date2) => {
  const d1 = safeCreateDate(date1);
  const d2 = safeCreateDate(date2);
  
  if (!d1 || !d2) return 0;
  
  const timeDiff = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

/**
 * Get current timestamp in safe format
 * @returns {string} - Current timestamp
 */
export const getCurrentTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Get current date key
 * @returns {string} - Current date key (YYYY-MM-DD)
 */
export const getCurrentDateKey = () => {
  return safeGetDateKey(new Date());
};

/**
 * Validate date range
 * @param {any} startDate - Start date
 * @param {any} endDate - End date
 * @returns {boolean} - True if valid range
 */
export const isValidDateRange = (startDate, endDate) => {
  const start = safeCreateDate(startDate);
  const end = safeCreateDate(endDate);
  
  if (!start || !end) return false;
  
  return start <= end;
}; 