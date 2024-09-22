package src.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import src.DTO.LoginUserDTO;
import src.DTO.RegisterUserDTO;
import src.exception.CustomException;
import src.exception.ErrorMessage;
import src.models.Role;
import src.models.User;
import src.repository.UserRepository;
import src.repository.RoleRepository;

import java.util.Optional;
import java.util.Set;

/**
 * Service class for handling user authentication and registration.
 */
@Service
public class AuthenticationService {

    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

    private final PasswordEncoder passwordEncoder; /* Password encoder for hashing passwords */

    private final AuthenticationManager authenticationManager; /* Authentication manager for user authentication */

    /**
     * Constructs an instance of AuthenticationService with the given dependencies.
     * 
     * @param userRepository        The User repository
     * @param roleRepository        The Role repository
     * @param authenticationManager The authentication manager
     * @param passwordEncoder       The password encoder
     * @param customerService       The customer service
     * @param providerService       The provider service
     */
    @Autowired
    public AuthenticationService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            AuthenticationManager authenticationManager,
            PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Registers a new user with the given registration details.
     * 
     * @param input The registration details
     * @return The registered User entity
     * @throws CustomException if a user with the same email or phone number already
     *                         exists
     */
    @Transactional
    public User signup(RegisterUserDTO input) {
        String email, phoneNumber, firstName, lastName;
        Set<String> roles;
    
        firstName = input.getFirstName();
        lastName = input.getLastName();
        email = input.getEmail();
        phoneNumber = input.getPhoneNumber();
        roles = input.getRoles();
    
        // Check for existing user by email
        Optional<User> existingUserByEmail = userRepository.findByEmail(email);
    
        // Check for existing user by phone number
        Optional<User> existingUserByPhoneNumber = userRepository.findByPhoneNumber(phoneNumber);
    
        if (existingUserByEmail.isPresent() || existingUserByPhoneNumber.isPresent()) {
            throw new CustomException(ErrorMessage.USER_ALREADY_EXISTS, HttpStatus.CONFLICT);
        }
    
        /* Create a new user and set the appropriate details */
        User user = new User();
        user.setEmail(email);
        user.setPhoneNumber(phoneNumber);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPasswordHash(passwordEncoder.encode(input.getPassword())); /* Encode and set password */
    
        // Assign roles to the user without using a lambda
        for (String roleName : roles) {
            Optional<Role> roleOpt = roleRepository.findByName(roleName);
            if (roleOpt.isPresent()) {
                Role role = roleOpt.get();
                user.addRole(role);
            }
        }
        user = userRepository.save(user); /* Save user */
        return user;
    }
    
    

    /**
     * Authenticates a user with the given login details. This method is executed
     * when a user logs in to establish a session
     * 
     * @param input The login details
     * @return The authenticated User entity
     * @throws org.springframework.security.core.AuthenticationException if
     *                                                                   authentication
     *                                                                   fails
     */
    public User authenticate(LoginUserDTO input) {
        /*
         * Authenticate user with email and password. Spring Security takes care of
         * this, you can read up on it if you're interested, but not vital to
         * understanding the code
         */
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        input.getEmail(),
                        input.getPassword()));

        /* Find and return the user by email */
        return userRepository.findByEmail(input.getEmail())
                .orElseThrow(); /*
                                 * Throw an exception if user is not found. We should customize these exceptions
                                 */
    }
}