package com.transpolink.transport.seeder;

import com.transpolink.transport.entity.Fleet;
import com.transpolink.transport.entity.Schedule;
import com.transpolink.transport.entity.TransportRoute;
import com.transpolink.transport.enums.*;
import com.transpolink.transport.repository.FleetRepository;
import com.transpolink.transport.repository.ScheduleRepository;
import com.transpolink.transport.repository.TransportRouteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final TransportRouteRepository routeRepository;
    private final ScheduleRepository scheduleRepository;
    private final FleetRepository fleetRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        patchMissingRegistrationNumbers();

        if (routeRepository.count() > 0) {
            log.info("Transport seeder skipped — data already exists.");
            return;
        }

        Long operatorId = getUserId("transport@transpolink.com");
        if (operatorId == null) {
            log.warn("Transport seeder skipped — transport user not found in identity DB.");
            return;
        }

        List<TransportRoute> routes = List.of(
            TransportRoute.builder().operatorId(operatorId).type(RouteType.BUS).startPoint("Central Station").endPoint("Airport Terminal").status(RouteStatus.ACTIVE).build(),
            TransportRoute.builder().operatorId(operatorId).type(RouteType.BUS).startPoint("North District").endPoint("City Center").status(RouteStatus.ACTIVE).build(),
            TransportRoute.builder().operatorId(operatorId).type(RouteType.TRAIN).startPoint("Main Terminal").endPoint("South Suburb").status(RouteStatus.ACTIVE).build(),
            TransportRoute.builder().operatorId(operatorId).type(RouteType.TRAIN).startPoint("East Station").endPoint("West Station").status(RouteStatus.INACTIVE).build(),
            TransportRoute.builder().operatorId(operatorId).type(RouteType.BUS).startPoint("University Campus").endPoint("Shopping Mall").status(RouteStatus.ACTIVE).build(),
            TransportRoute.builder().operatorId(operatorId).type(RouteType.BUS).startPoint("Industrial Zone").endPoint("Residential Area B").status(RouteStatus.SUSPENDED).build()
        );

        List<TransportRoute> savedRoutes = routeRepository.saveAll(routes);
        log.info("Seeded {} transport routes.", savedRoutes.size());

        LocalDateTime base = LocalDateTime.now().withMinute(0).withSecond(0).withNano(0);

        List<Schedule> schedules = List.of(
            Schedule.builder().routeId(savedRoutes.get(0).getRouteId()).departureTime(base.plusHours(1)).arrivalTime(base.plusHours(2)).status(ScheduleStatus.SCHEDULED).build(),
            Schedule.builder().routeId(savedRoutes.get(0).getRouteId()).departureTime(base.plusHours(3)).arrivalTime(base.plusHours(4)).status(ScheduleStatus.SCHEDULED).build(),
            Schedule.builder().routeId(savedRoutes.get(1).getRouteId()).departureTime(base.plusMinutes(30)).arrivalTime(base.plusMinutes(75)).status(ScheduleStatus.ON_TIME).build(),
            Schedule.builder().routeId(savedRoutes.get(1).getRouteId()).departureTime(base.plusHours(2)).arrivalTime(base.plusHours(2).plusMinutes(45)).status(ScheduleStatus.DELAYED).build(),
            Schedule.builder().routeId(savedRoutes.get(2).getRouteId()).departureTime(base.plusHours(1)).arrivalTime(base.plusHours(3)).status(ScheduleStatus.SCHEDULED).build(),
            Schedule.builder().routeId(savedRoutes.get(4).getRouteId()).departureTime(base.plusMinutes(15)).arrivalTime(base.plusMinutes(50)).status(ScheduleStatus.ON_TIME).build(),
            Schedule.builder().routeId(savedRoutes.get(4).getRouteId()).departureTime(base.plusHours(4)).arrivalTime(base.plusHours(4).plusMinutes(35)).status(ScheduleStatus.CANCELLED).build()
        );

        scheduleRepository.saveAll(schedules);
        log.info("Seeded {} schedules.", schedules.size());

        List<Fleet> fleets = List.of(
            Fleet.builder().registrationNumber("TN01AB1234").vehicleType("Standard Bus").capacity(50).status(FleetStatus.IN_SERVICE).build(),
            Fleet.builder().registrationNumber("TN01AB1235").vehicleType("Standard Bus").capacity(50).status(FleetStatus.AVAILABLE).build(),
            Fleet.builder().registrationNumber("TN01CD5678").vehicleType("Double Decker Bus").capacity(90).status(FleetStatus.IN_SERVICE).build(),
            Fleet.builder().registrationNumber("TN02EF9012").vehicleType("Mini Bus").capacity(25).status(FleetStatus.AVAILABLE).build(),
            Fleet.builder().registrationNumber("TN03GH3456").vehicleType("Electric Train").capacity(300).status(FleetStatus.IN_SERVICE).build(),
            Fleet.builder().registrationNumber("TN03GH3457").vehicleType("Electric Train").capacity(300).status(FleetStatus.AVAILABLE).build(),
            Fleet.builder().registrationNumber("TN04IJ7890").vehicleType("Standard Bus").capacity(50).status(FleetStatus.RETIRED).build()
        );

        fleetRepository.saveAll(fleets);
        log.info("Seeded {} fleet vehicles.", fleets.size());
    }

    private void patchMissingRegistrationNumbers() {
        int updated = 0;
        String[][] data = {
            {"Standard Bus",      "TN01AB1234"},
            {"Standard Bus",      "TN01AB1235"},
            {"Double Decker Bus", "TN01CD5678"},
            {"Mini Bus",          "TN02EF9012"},
            {"Electric Train",    "TN03GH3456"},
            {"Electric Train",    "TN03GH3457"},
            {"Standard Bus",      "TN04IJ7890"}
        };
        for (String[] row : data) {
            int rows = jdbcTemplate.update(
                "UPDATE transpolink_transport.fleets SET registration_number = ? " +
                "WHERE vehicle_type = ? AND registration_number IS NULL LIMIT 1",
                row[1], row[0]
            );
            updated += rows;
        }
        if (updated > 0) log.info("Patched {} fleet rows with registration numbers.", updated);
    }

    private Long getUserId(String email) {
        try {
            return jdbcTemplate.queryForObject(
                "SELECT user_id FROM transpolink_identity.users WHERE email = ?",
                Long.class, email
            );
        } catch (Exception e) {
            log.warn("User not found for email: {}", email);
            return null;
        }
    }
}
