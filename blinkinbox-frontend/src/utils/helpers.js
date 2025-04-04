export const generateRandomEmail = () => {
    // Generate a readable prefix with current timestamp and random number
    const prefix = 'user';
    const timestamp = Date.now() % 10000; // Last 4 digits of current timestamp
    const randomNumber = Math.floor(Math.random() * 10000); // Random 4-digit number
    
    // Combine both for uniqueness
    return `${prefix}${timestamp}${randomNumber}@blinkinbox.club`;
  };