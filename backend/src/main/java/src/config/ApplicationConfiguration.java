package src.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import src.repository.UserRepository;

@Configuration
public class ApplicationConfiguration {
    private final UserRepository userRepository;

    @Autowired
    public ApplicationConfiguration(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Bean to provide the UserDetailsService, which is responsible for fetching
     * user-specific data.
     * 
     * @return UserDetailsService that loads a user by their email (username).
     *         Throws UsernameNotFoundException if the user is not found.
     */
    @Bean
    UserDetailsService userDetailsService() {
        return username -> userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    /**
     * Bean to provide the password encoder.
     * 
     * @return BCryptPasswordEncoder used for hashing and checking passwords.
     */
    @Bean
    BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Bean to provide the AuthenticationManager, which handles authentication.
     * 
     * @param config The AuthenticationConfiguration used to get the manager.
     * @return AuthenticationManager for handling authentication.
     * @throws Exception if there's an issue during the configuration.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Bean to provide the AuthenticationProvider, which authenticates using the
     * DaoAuthenticationProvider.
     * 
     * @return AuthenticationProvider for authenticating users via user details
     *         service and password encoder.
     */
    @Bean
    AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

        /*
         * Sets the UserDetailsService as the vector for loading user-specific data
         * during authentication
         */
        authProvider.setUserDetailsService(userDetailsService());

        /* Sets the password encoder (BCrypt) to compare hashed passwords */
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }
}