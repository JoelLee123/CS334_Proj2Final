package src.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import src.models.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
}