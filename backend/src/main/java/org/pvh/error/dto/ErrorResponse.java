package org.pvh.error.dto;

import java.util.Date;

public class ErrorResponse extends ErrorResponseDefault {

    private final String error;
    private final String path;

    public ErrorResponse(int status, String error, String message, String path, Date timestamp) {
        super(status, message, timestamp);
        this.error = error;
        this.path = path;
    }


    public String getError() {
        return error;
    }

    public String getPath() {
        return path;
    }

}
