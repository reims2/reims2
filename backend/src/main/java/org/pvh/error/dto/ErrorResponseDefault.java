package org.pvh.error.dto;

import java.util.Date;

public class ErrorResponseDefault {

    private int status;
    private String message;
    private Date timestamp;

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
