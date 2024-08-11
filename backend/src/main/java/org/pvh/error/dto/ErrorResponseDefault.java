package org.pvh.error.dto;

import java.util.Date;

public class ErrorResponseDefault {

    private final int status;
    private final String message;
    private final Date timestamp;

    public ErrorResponseDefault(int status, String message, Date timestamp) {
        this.status = status;
        this.message = message;
        this.timestamp = timestamp;
    }

    public int getStatus() {
        return status;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    public String getMessage() {
        return message;
    }
}
