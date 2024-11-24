
export interface PasswordValidationResult {
    errors: string[];
}

export function validatePasswordDetailed(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if(password.length === 0) {
        errors.push("Password cannot be empty")
    } else {
        if (password.length < 8) {
            errors.push("Password must be at least 8 characters long.");
        }
        if (!/[A-Z]/.test(password)) {
            errors.push("Password must contain at least one uppercase letter.");
        }
        if (!/[0-9]/.test(password)) {
            errors.push("Password must contain at least one number.");
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) {
            errors.push("Password must contain at least one symbol.");
        }
    }

    return {
        errors
    };
}