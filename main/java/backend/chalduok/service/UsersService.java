package backend.chalduok.service;

import backend.chalduok.model.Users;
import backend.chalduok.repository.UsersRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UsersService {

    private final UsersRepository usersRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UsersService(UsersRepository usersRepository) {
        this.usersRepository = usersRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public Users register(Users user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        System.out.println("저장완료");
        return usersRepository.save(user);
    }

    public Users findByUsername(String username) {
        return usersRepository.findByUsername(username);
    }
}
