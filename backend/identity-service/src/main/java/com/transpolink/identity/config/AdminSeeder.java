package com.transpolink.identity.config;

/**
 * AdminSeeder disabled — DataSeeder (dev profile) seeds all users including admin.
 * This class was causing DataSeeder to be skipped because ApplicationRunner runs
 * before CommandLineRunner, inserting one user and making count() > 0.
 */
public class AdminSeeder {
    // intentionally empty — not a Spring component
}
