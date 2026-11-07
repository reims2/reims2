package org.pvh.service;

import org.junit.jupiter.api.Test;
import org.pvh.IntegrationTest;
import org.pvh.error.BadRequestException;
import org.pvh.error.ConflictException;
import org.pvh.model.dto.EyeDTO;
import org.pvh.model.dto.GlassesRequestDTO;
import org.pvh.model.entity.Eye;
import org.pvh.model.entity.Glasses;
import org.pvh.model.enums.AppearanceEnum;
import org.pvh.model.enums.DispenseReasonEnum;
import org.pvh.model.enums.GlassesSizeEnum;
import org.pvh.model.enums.GlassesTypeEnum;
import org.pvh.model.enums.LocationEnum;
import org.pvh.repository.GlassesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.Callable;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertTrue;

// stations at one site write at the same time, these race real transactions against each other
@IntegrationTest
public class ConcurrencyIntegrationTest {

    private static final int THREADS = 8;

    @Autowired
    private GlassesService glassesService;

    @Autowired
    private GlassesRepository glassesRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private record Outcome<T>(T value, Throwable error) {
    }

    // starts all tasks at once and waits for every outcome
    private static <T> List<Outcome<T>> race(List<Callable<T>> tasks) throws Exception {
        CyclicBarrier start = new CyclicBarrier(tasks.size());
        try (ExecutorService pool = Executors.newFixedThreadPool(tasks.size())) {
            List<Future<Outcome<T>>> futures = new ArrayList<>();
            for (Callable<T> task : tasks) {
                futures.add(pool.submit(() -> {
                    start.await(10, TimeUnit.SECONDS);
                    try {
                        return new Outcome<>(task.call(), null);
                    } catch (Exception e) {
                        return new Outcome<T>(null, e);
                    }
                }));
            }
            List<Outcome<T>> outcomes = new ArrayList<>();
            for (Future<Outcome<T>> future : futures)
                outcomes.add(future.get(30, TimeUnit.SECONDS));
            return outcomes;
        }
    }

    private static Glasses newGlasses(LocationEnum location) {
        Eye eye = new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE);
        Eye other = new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE);
        return new Glasses(GlassesTypeEnum.multifocal, GlassesSizeEnum.medium, AppearanceEnum.neutral, location, eye, other);
    }

    private static GlassesRequestDTO editWithSphere(Glasses glasses, BigDecimal sphere) {
        EyeDTO eye = new EyeDTO(sphere, BigDecimal.valueOf(-2), 2, BigDecimal.ONE);
        return new GlassesRequestDTO(glasses.getGlassesType(), glasses.getGlassesSize(), glasses.getAppearance(),
            glasses.getLocation(), eye, eye);
    }

    private Glasses reload(Glasses glasses) {
        return glassesRepository.findById(glasses.getId()).orElseThrow();
    }

    @Test
    public void concurrentAdds_getDistinctSkus() throws Exception {
        List<Callable<Integer>> adds = new ArrayList<>();
        for (int i = 0; i < THREADS * 3; i++)
            adds.add(() -> glassesService.saveGlasses(newGlasses(LocationEnum.sm)).getSku());

        List<Outcome<Integer>> outcomes = race(adds);

        outcomes.forEach(o -> assertEquals(null, o.error(), "add failed"));
        assertEquals(adds.size(), outcomes.stream().map(Outcome::value).distinct().count());
    }

    @Test
    public void concurrentDispenses_dispenseOnce() throws Exception {
        Glasses glasses = glassesService.saveGlasses(newGlasses(LocationEnum.sa));
        List<Callable<Optional<Glasses>>> dispenses = new ArrayList<>();
        for (int i = 0; i < THREADS; i++)
            dispenses.add(() -> glassesService.dispense(glasses.getId(), DispenseReasonEnum.DISPENSED));

        List<Outcome<Optional<Glasses>>> outcomes = race(dispenses);

        outcomes.forEach(o -> assertEquals(null, o.error(), "dispense failed"));
        assertEquals(1, outcomes.stream().filter(o -> o.value().isPresent()).count());
    }

    @Test
    public void editRacingDispense_isKeptOnlyIfItWon() throws Exception {
        for (int i = 0; i < 10; i++) {
            Glasses glasses = glassesService.saveGlasses(newGlasses(LocationEnum.sa));
            BigDecimal edited = BigDecimal.valueOf(i + 2);
            List<Outcome<Object>> outcomes = race(List.of(
                () -> glassesService.editGlasses(glasses.getId(), editWithSphere(glasses, edited)),
                () -> glassesService.dispense(glasses.getId(), DispenseReasonEnum.DISPENSED)));

            assertEquals(null, outcomes.get(1).error(), "dispense failed");
            Glasses stored = reload(glasses);
            assertTrue(stored.isDispensed());
            if (outcomes.get(0).error() == null)
                assertEquals(0, edited.compareTo(stored.getOd().getSphere()), "edit lost");
            else {
                assertInstanceOf(ConflictException.class, outcomes.get(0).error());
                assertEquals(0, BigDecimal.ONE.compareTo(stored.getOd().getSphere()), "edit applied after dispense");
            }
        }
    }

    // the add can only take the SKU while the undo hasn't, so one of them has to step aside
    @Test
    public void undispenseRacingAdd_neverSharesTheSku() throws Exception {
        for (int i = 0; i < 10; i++) {
            Glasses glasses = glassesService.saveGlasses(newGlasses(LocationEnum.sm));
            int sku = glasses.getSku();
            glassesService.dispense(glasses.getId(), DispenseReasonEnum.DISPENSED);
            // lets add hand the SKU out again, it was the lowest free one when the pair got it
            jdbcTemplate.update("UPDATE dispense d JOIN glasses g ON g.dispense_id = d.id "
                + "SET d.modify_date = d.modify_date - INTERVAL 11 MINUTE WHERE g.id = ?", glasses.getId());

            List<Outcome<Object>> outcomes = race(List.of(
                () -> glassesService.undispense(glasses.getId()),
                () -> glassesService.saveGlasses(newGlasses(LocationEnum.sm))));

            assertEquals(null, outcomes.get(1).error(), "add failed");
            int addedSku = ((Glasses) outcomes.get(1).value()).getSku();
            if (outcomes.get(0).error() == null) {
                assertFalse(reload(glasses).isDispensed());
                assertTrue(addedSku != sku, "add took the restored SKU");
            } else {
                assertInstanceOf(BadRequestException.class, outcomes.get(0).error());
                assertEquals(sku, addedSku);
            }
        }
    }
}
