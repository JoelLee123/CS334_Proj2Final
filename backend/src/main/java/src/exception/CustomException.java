package src.exception;

import org.springframework.http.HttpStatus;

public class CustomException extends RuntimeException {

    private final HttpStatus status;
    private final ErrorMessage errorMessage;

    public CustomException(ErrorMessage errorMessage, HttpStatus status) {
        super(errorMessage.getMessage());
        this.errorMessage = errorMessage;
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public ErrorMessage getErrorMessage() {
        return errorMessage;
    }
}
