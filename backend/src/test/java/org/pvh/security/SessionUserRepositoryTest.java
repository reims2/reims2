package org.pvh.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.DeferredSecurityContext;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SessionUserRepositoryTest {

    private final SessionUserRepository repository = new SessionUserRepository(username -> {
        if (!username.equals("ana"))
            throw new UsernameNotFoundException(username);
        return User.withUsername("ana").password("hash").roles("USER").build();
    });

    private static MockHttpServletRequest withUser(String username) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpSession session = new MockHttpSession();
        session.setAttribute(SessionUserRepository.USERNAME, username);
        request.setSession(session);
        return request;
    }

    @Test
    void loadsTheUserFromTheDatabase() {
        DeferredSecurityContext context = repository.loadDeferredContext(withUser("ana"));
        assertFalse(context.isGenerated());
        assertEquals("ana", context.get().getAuthentication().getName());
        assertEquals(AuthorityUtils.createAuthorityList("ROLE_USER"), context.get().getAuthentication().getAuthorities());
    }

    @Test
    void isEmptyWithoutSessionOrUsername() {
        MockHttpServletRequest noSession = new MockHttpServletRequest();
        assertTrue(repository.loadDeferredContext(noSession).isGenerated());
        assertNull(noSession.getSession(false));
        assertFalse(repository.containsContext(noSession));

        MockHttpServletRequest emptySession = new MockHttpServletRequest();
        emptySession.setSession(new MockHttpSession());
        assertNull(repository.loadDeferredContext(emptySession).get().getAuthentication());
        assertFalse(repository.containsContext(emptySession));
    }

    @Test
    void endsTheSessionOfAnUnknownUser() {
        MockHttpServletRequest request = withUser("gone");
        MockHttpSession session = (MockHttpSession) request.getSession(false);
        assertTrue(repository.containsContext(request));
        assertTrue(repository.loadDeferredContext(request).isGenerated());
        assertTrue(session.isInvalid());
    }

    @Test
    void savesOnlyTheUsername() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        var authentication = UsernamePasswordAuthenticationToken.authenticated("ana", null, AuthorityUtils.NO_AUTHORITIES);
        repository.saveContext(new SecurityContextImpl(authentication), request, new MockHttpServletResponse());
        assertEquals("ana", request.getSession().getAttribute(SessionUserRepository.USERNAME));

        repository.saveContext(new SecurityContextImpl(), request, new MockHttpServletResponse());
        assertNull(request.getSession().getAttribute(SessionUserRepository.USERNAME));

        MockHttpServletRequest noSession = new MockHttpServletRequest();
        repository.saveContext(new SecurityContextImpl(), noSession, new MockHttpServletResponse());
        assertNull(noSession.getSession(false));
    }
}
