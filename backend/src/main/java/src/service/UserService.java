package src.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import src.exception.CustomException;
import src.exception.ErrorMessage;
import src.models.User;
import src.repository.UserRepository;
import src.response.UserResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Retrieves all users from the database.
     *
     * @return A list of all users.
     */
    public List<User> allUsers() {
        List<User> users = new ArrayList<>();

        /* Fetch all users from the repository and add them to the list */
        userRepository.findAll().forEach(users::add);

        return users;
    }

    /**
     * Retrieves the profile of the currently authenticated user. This is
     * essentially a function to identify the current interacting user
     * 
     * @return ResponseEntity with the current user's details
     */
    public User getAuthenticatedUser() {
        /* Retrieves the authentication object from the SecurityContext */
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        /* Extracts the currently authenticated user */
        User currentUser = (User) authentication.getPrincipal();

        return currentUser;
    }
    
    /**
     * Updates an existing provider's details.
     * 
     * @param id          ID of the provider to update
     * @param email       New email address
     * @param phoneNumber New phone number
     * @param companyName New company name
     * @return ResponseEntity with a message and the updated provider
     */
    public UserResponse updateUser(String email, String phoneNumber,
            String firstName, String lastName) {
        try {
            /* Find provider by email */
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (!userOpt.isPresent()) { /* If they don't exist */
                throw new CustomException(ErrorMessage.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND);
            }

            User existingUser = userOpt.get();
            existingUser.setEmail(email);
            existingUser.setPhoneNumber(phoneNumber);
            existingUser.setFirstName(firstName);
            existingUser.setLastName(lastName);
            userRepository.save(existingUser);

            return new UserResponse("User updated successfully", existingUser);
        } catch (DataIntegrityViolationException e) {
            /* Handle case where user already exists */
            throw new CustomException(ErrorMessage.USER_ALREADY_EXISTS, HttpStatus.CONFLICT);
        }
    }
}