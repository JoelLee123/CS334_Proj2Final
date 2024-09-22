package src.exception;

public enum ErrorMessage {
    USER_ALREADY_EXISTS("A user with this email or phone number already exists."),
    CUSTOMER_NOT_IN_Q("Invalid operation: The customer cannot be removed because they are not currently in the queue."),
    CUSTOMER_ALREADY_IN_Q("Invalid operation: The customer cannot be added because they are already in the queue."),
    UNEXPECTED_ERROR("An unexpected error occurred while performing the operation."),
    RESOURCE_NOT_FOUND("Resource not found: The requested operation could not locate the specified resource."),
    INVALID_CREDENTIALS("Incorrect password");

    private final String message;

    ErrorMessage(String message) {
        this.message = message;
    }

    public String getMessage() {
        return this.message;
    }
}