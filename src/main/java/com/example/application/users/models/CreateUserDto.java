package com.example.application.users.models;

import jakarta.annotation.Nonnull;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class CreateUserDto {
    @Email(message = "Email must be valid")
    @Nonnull
    private String email;

    @Size(min = 8, max = 256, message = "Password must be between 8 and 256 characters")
    @Pattern(regexp = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,256}$")
    @Nonnull
    private String password;

    @Size(min = 2, max = 256)
    @Pattern(regexp = "[\\p{L} ,.'-]+")
    @Nonnull
    private String firstName;

    @Size(min = 2, max = 256)
    @Pattern(regexp = "[\\p{L} ,.'-]+")
    @Nonnull
    private String lastName;
}
