package org.pvh.error;

import org.springframework.http.HttpStatus;

public class NoSkusLeftException extends PVHException {

    public NoSkusLeftException() {
        super("No free SKUs left in this location.", HttpStatus.CONFLICT);
    }

}
