// User Types and Interfaces

/**
 * @typedef {Object} Role
 * @property {number} id
 * @property {string} name
 * @property {string} guard_name
 * @property {string} created_at
 * @property {string} updated_at
 * @property {{model_type: string, model_id: number, role_id: number}=} pivot
 */

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {string|null} email_verified_at
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} user_type
 * @property {Role[]} roles
 * @property {string|null=} onedrive_token
 * @property {string|null=} onedrive_refresh_token
 * @property {string|null=} onedrive_token_expires_at
 */

/**
 * @typedef {Object} ApiResponse
 * @property {User[]} data
 */