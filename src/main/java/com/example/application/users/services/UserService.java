package com.example.application.users.services;

import com.example.application.users.models.CreateUserDto;
import com.example.application.users.models.Role;
import com.example.application.users.models.User;
import com.example.application.users.repositories.UserRepository;
import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.BrowserCallable;
import jakarta.validation.Valid;
import jakarta.validation.ValidationException;
import java.util.Set;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

@Service
@BrowserCallable
public class UserService {
    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    @AnonymousAllowed
    public User create(@Valid CreateUserDto userToCreate) {
        if (this.repository.existsUserByEmail(userToCreate.getEmail())) {
            throw new ValidationException();
        }

        User user = new User();

        user.setEmail(userToCreate.getEmail());
        user.setHashedPassword(BCrypt.hashpw(userToCreate.getPassword(), BCrypt.gensalt()));
        user.setFirstName(userToCreate.getFirstName());
        user.setLastName(userToCreate.getLastName());
        user.setRoles(Set.of(Role.USER));

        return repository.save(user);
    }
}
