package org.pvh.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.context.HttpRequestResponseHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.session.FindByIndexNameSessionRepository;

/**
 * Keeps only the username in the session and loads the user on every request, so deleting a user applies right
 * away, and a Spring Security upgrade can't make stored sessions unreadable.
 */
public class SessionUserRepository implements SecurityContextRepository {
    // indexed, so UserService can end a deleted user's sessions
    static final String USERNAME = FindByIndexNameSessionRepository.PRINCIPAL_NAME_INDEX_NAME;

    private final UserDetailsService userDetailsService;

    public SessionUserRepository(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    // Spring Security wraps this in a deferred context, null means not logged in
    @Override
    @Deprecated
    public SecurityContext loadContext(HttpRequestResponseHolder holder) {
        HttpSession session = holder.getRequest().getSession(false);
        Object username = session == null ? null : session.getAttribute(USERNAME);
        if (!(username instanceof String name))
            return null;
        try {
            UserDetails user = userDetailsService.loadUserByUsername(name);
            return new SecurityContextImpl(UsernamePasswordAuthenticationToken.authenticated(user, null, user.getAuthorities()));
        } catch (UsernameNotFoundException e) {
            session.invalidate();
            return null;
        }
    }

    @Override
    public void saveContext(SecurityContext context, HttpServletRequest request, HttpServletResponse response) {
        Authentication authentication = context.getAuthentication();
        if (authentication != null) {
            request.getSession().setAttribute(USERNAME, authentication.getName());
            return;
        }
        HttpSession session = request.getSession(false);
        if (session != null)
            session.removeAttribute(USERNAME);
    }

    @Override
    public boolean containsContext(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        return session != null && session.getAttribute(USERNAME) != null;
    }
}
