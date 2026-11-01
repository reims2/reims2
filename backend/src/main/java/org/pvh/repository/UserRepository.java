package org.pvh.repository;

import org.pvh.model.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // runs on every authenticated request, see WebSecurityConfig
    @EntityGraph(attributePaths = "roles")
    Optional<User> findByUsername(String username);

    @Override
    @EntityGraph(attributePaths = "roles")
    List<User> findAll();

    boolean existsByUsername(String username);

}
