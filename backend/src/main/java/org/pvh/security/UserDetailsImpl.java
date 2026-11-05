package org.pvh.security;

import org.pvh.model.entity.User;
import org.springframework.security.core.authority.AuthorityUtils;

import java.io.Serial;

public class UserDetailsImpl extends org.springframework.security.core.userdetails.User {
    @Serial
    private static final long serialVersionUID = 1L;

    private final Long id;

    public UserDetailsImpl(User user) {
        super(user.getUsername(), user.getPassword(),
            AuthorityUtils.createAuthorityList(user.getRoles().stream().map(role -> role.getName().name()).toList()));
        this.id = user.getId();
    }

    public Long getId() {
        return id;
    }
}
