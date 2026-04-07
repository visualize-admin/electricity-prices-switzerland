// Export it here for use in tests code for clarity and to avoid
// hardcoding the base URL in multiple places.
const BASE_URL = process.env.DEPLOYMENT_BASE_URL || "http://localhost:3000";

export { BASE_URL };
