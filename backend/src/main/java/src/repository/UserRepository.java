package src.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import src.models.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);
}