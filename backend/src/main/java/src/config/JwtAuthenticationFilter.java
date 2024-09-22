package src.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import src.service.JwtService;

import java.io.IOException;

/**
 * A filter for handling JWT authentication in HTTP requests.
 * <p>
 * This filter is used to validate the JWT token included in incoming requests.
 * It extracts the token from the request, validates it, and sets the
 * authentication
 * in the Spring Security context if the token is valid.
 * </p>
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final HandlerExceptionResolver handlerExceptionResolver;

    private final JwtService jwtService;

    private final UserDetailsService userDetailsService;

    @Autowired
    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserDetailsService userDetailsService,
            HandlerExceptionResolver handlerExceptionResolver) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.handlerExceptionResolver = handlerExceptionResolver;
    }

    /**
     * The main method for filtering requests and handling JWT authentication.
     * <p>
     * This method extracts the JWT token from the request, validates it, and sets
     * the authentication in the Spring Security context if the token is valid.
     * </p>
     *
     * @param request     the HTTP request to filter
     * @param response    the HTTP response
     * @param filterChain the filter chain to pass the request and response to
     * @throws ServletException if an error occurs during the filtering process
     * @throws IOException      if an I/O error occurs
     */
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        /* Check for Authorization Header */
        final String authHeader = request.getHeader("Authorization");

        /*
         * If no header or the header doesn't start with 'Bearer ', skip authentication
         */
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            /* Extract JWT token from the header */
            final String jwt = authHeader.substring(7);
            final String userEmail = jwtService.extractUsername(jwt);

            /*
             * Check if the user is already authenticated in the SecurityContext. This is
             * unlikely to be the case in our application
             */
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            /*
             * If the user is not authenticated, validate the token and set SecurityContext
             */
            if (userEmail != null && authentication == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                /* Validate the JWT token */
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());

                    /* Set the authentication in the SecurityContextHolder */
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }

            /* Continue the filter chain (either authenticated or not) */
            filterChain.doFilter(request, response);
        } catch (Exception exception) {
            handlerExceptionResolver.resolveException(request, response, null, exception);
        }
    }
}
