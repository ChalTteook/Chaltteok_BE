package backend.chalduok.repository;

import backend.chalduok.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;


public interface UsersRepository extends JpaRepository<Users, Long> {
    Users findByUsername(String username);
}