package src.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import src.DTO.LoginUserDTO;
import src.DTO.RegisterUserDTO;
import src.models.User;
import src.response.LoginResponse;
import src.service.AuthenticationService;
import src.service.JwtService;

/**
 * Controller for handling authentication-related requests. Note that all
 * requests that
 * are sent to this controller do not require authentication.
 */
@RequestMapping("/auth")
@RestController
public class AuthenticationController {

    private final JwtService jwtService;

    private final AuthenticationService authenticationService;

    /**
     * Constructs an instance of AuthenticationController with the given services.
     * 
     * @param jwtService            The JWT service
     * @param authenticationService The authentication service
     */
    @Autowired
    public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
    }


    /**
     * Handles user registration request
     * 
     * @param registerUserDto The registration details
     * @return LoginResponse containing the login token
     */
    @PostMapping("/signup")
    public ResponseEntity<LoginResponse> register(@RequestBody RegisterUserDTO registerUserDto) {
    try {
    
        User registeredUser = authenticationService.signup(registerUserDto);
        String jwtToken = jwtService.generateToken(registeredUser);

        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setToken(jwtToken);
        loginResponse.setExpiresIn(jwtService.getExpirationTime());

        return ResponseEntity.ok(loginResponse);
    } catch (Exception e) {
        throw e; 
    }
}


    /**
     * Handles user login requests.
     * 
     * @param loginUserDto The login details
     * @return ResponseEntity containing the login response with JWT token
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticate(@RequestBody LoginUserDTO loginUserDto) {
        /*
         * Authenticate the user using the authentication service. This is essentially
         * what it means to "login"
         */
        User authenticatedUser = authenticationService.authenticate(loginUserDto);

        /*
         * Generate a JWT token for the authenticated user. This token will be used by
         * the user for all subsequent requests to implicitly identify themselves
         */
        String jwtToken = jwtService.generateToken(authenticatedUser);

        /* Create a login response with the JWT token and its expiration time */
        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setToken(jwtToken);
        loginResponse.setExpiresIn(jwtService.getExpirationTime());

        return ResponseEntity.ok(loginResponse);
    }
}