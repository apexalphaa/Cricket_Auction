// List of email addresses that have Admin privileges
export const ADMIN_EMAILS = [
    "admin@sambalpur.com", // Example
    "f17121221@gmail.com",
];

// Map specific emails to Team IDs for Owners
// In a real app, this would be in the DB.
export const OWNER_EMAILS = {
    "owner1@team.com": "t1",
    "owner2@team.com": "t2",
    "ankit.sharma.cd.civ21@itbhu.ac.in": "t1", // Default to t1, can switch in UI
};
