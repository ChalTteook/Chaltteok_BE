package backend.chalduok.controller;

import backend.chalduok.model.Users;
import backend.chalduok.service.UsersService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Controller
@RequestMapping("/auth")
public class AuthController {

    private final UsersService usersService;

    public AuthController(UsersService usersService) {
        this.usersService = usersService;
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @PostMapping("/login")
    public String login(@RequestParam("username") String username) {
        Users user = usersService.findByUsername(username);
        return "";
    }


    @GetMapping("/register")
    public String register(Model model) {
        model.addAttribute("users", new Users());
        return "register";
    }


    @PostMapping("/register")
    public String registerUser(@ModelAttribute Users user, Model model) {
        usersService.register(user);
        model.addAttribute("message", "Registration successful!");
        return "redirect:/auth/login";
    }
}