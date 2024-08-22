package org.pvh.security.model;

import org.springframework.stereotype.Component;

@Component
public class Roles {

    public final String USER = "ROLE_USER";
    public final String MODERATOR = "ROLE_MODERATOR";
    public final String ADMIN = "ROLE_ADMIN";
}
