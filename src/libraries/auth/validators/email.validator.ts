export interface EmailValidationResult {
    errors: string[];
}

export function validateEmail(email: string): EmailValidationResult {
    const errors: string[] = [];
    if(email.length === 0) {
        errors.push("Email cannot be empty.")
    } else {
        // Regular expression for email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            errors.push("Invalid email address.");
        }

    }

    return {
        errors,
    };
}