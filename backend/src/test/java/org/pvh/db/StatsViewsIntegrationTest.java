package org.pvh.db;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.pvh.model.entity.Dispense;
import org.pvh.model.entity.Eye;
import org.pvh.model.entity.Glasses;
import org.pvh.model.entity.SearchLog;
import org.pvh.model.enums.BalLensEnum;
import org.pvh.service.MainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class StatsViewsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MainService mainService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final List<Long> createdGlasses = new ArrayList<>();

    // the DB is shared across test classes and other tests expect free SKUs, e.g. 5001 in sm
    @AfterEach
    void deleteCreatedGlasses() {
        createdGlasses.forEach(id -> mainService.findGlassesById(id).ifPresent(mainService::deleteGlasses));
    }

    private Glasses saveGlasses() throws Exception {
        Glasses glasses = mainService.saveGlasses(
            new Glasses("single", "medium", "neutral", "sm", new Dispense(),
                new Eye(new BigDecimal("-1.50"), new BigDecimal("-0.75"), 170, new BigDecimal("2.25")),
                new Eye(new BigDecimal("1.25"), new BigDecimal("-0.50"), 10, new BigDecimal("2.00"))));
        createdGlasses.add(glasses.getId());
        return glasses;
    }

    private Map<String, Object> glassesRow(long id) {
        return jdbcTemplate.queryForMap("SELECT * FROM stats_glasses WHERE id = ?", id);
    }

    private static void assertDecimal(String expected, Object actual) {
        assertEquals(0, new BigDecimal(expected).compareTo((BigDecimal) actual), "got " + actual);
    }

    @Test
    public void statsGlasses_derivesStatusAndFlattensEyes() throws Exception {
        Glasses inStock = saveGlasses();
        Glasses dispensed = saveGlasses();
        Glasses removed = saveGlasses();
        Glasses undispensed = saveGlasses();

        mockMvc.perform(put("/api/glasses/dispense/sm/" + dispensed.getSku())).andExpect(status().isOk());
        mockMvc.perform(put("/api/glasses/dispense/sm/" + removed.getSku()).param("reason", "BROKEN"))
            .andExpect(status().isOk());
        mockMvc.perform(put("/api/glasses/dispense/sm/" + undispensed.getSku()).param("reason", "BROKEN"))
            .andExpect(status().isOk());
        mockMvc.perform(put("/api/glasses/undispense/" + undispensed.getId())).andExpect(status().isOk());

        Map<String, Object> row = glassesRow(inStock.getId());
        assertEquals("in_stock", row.get("status"));
        assertNull(row.get("dispense_reason"));
        assertNull(row.get("dispense_date"));
        assertEquals("sm", row.get("location"));
        assertEquals("single", row.get("glasses_type"));
        assertDecimal("1.25", row.get("od_sphere"));
        assertDecimal("-0.50", row.get("od_cylinder"));
        assertEquals(10, ((Number) row.get("od_axis")).intValue());
        assertDecimal("2.00", row.get("od_add"));
        assertDecimal("-1.50", row.get("os_sphere"));
        assertDecimal("-0.75", row.get("os_cylinder"));
        assertEquals(170, ((Number) row.get("os_axis")).intValue());
        assertDecimal("2.25", row.get("os_add"));

        row = glassesRow(dispensed.getId());
        assertEquals("dispensed", row.get("status"));
        assertEquals("DISPENSED", row.get("dispense_reason"));
        assertNotNull(row.get("dispense_date"));

        row = glassesRow(removed.getId());
        assertEquals("removed", row.get("status"));
        assertEquals("BROKEN", row.get("dispense_reason"));
        assertNotNull(row.get("dispense_date"));

        // undispense bumps modify_date, the view must hide it for stock rows
        row = glassesRow(undispensed.getId());
        assertEquals("in_stock", row.get("status"));
        assertNull(row.get("dispense_reason"));
        assertNull(row.get("dispense_date"));
    }

    private long saveSearchLog(int resultCount) {
        SearchLog search = new SearchLog();
        search.setGlassesType("multifocal");
        search.setLocation("sm");
        search.setSearchDate(new Date());
        search.setBalLens(BalLensEnum.DISABLE_NONE);
        search.setIncreaseSearchTolerance(false);
        search.setResultCount(resultCount);
        search.setOd(new Eye(new BigDecimal("1.25"), new BigDecimal("-0.50"), 10, new BigDecimal("2.00")));
        search.setOs(new Eye(new BigDecimal("-1.50"), new BigDecimal("-0.75"), 170, new BigDecimal("2.25")));
        return mainService.saveSearchLog(search).getId();
    }

    @Test
    public void statsUnsuccessfulSearch_skipsSearchesWithResults() {
        long id = saveSearchLog(3);

        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM stats_unsuccessful_search WHERE id = ?", Integer.class, id);
        assertEquals(0, count);
    }

    @Test
    public void statsUnsuccessfulSearch_flattensEyes() {
        long id = saveSearchLog(0);

        Map<String, Object> row = jdbcTemplate.queryForMap("SELECT * FROM stats_unsuccessful_search WHERE id = ?", id);
        assertEquals("sm", row.get("location"));
        assertEquals("multifocal", row.get("glasses_type"));
        assertEquals("DISABLE_NONE", row.get("bal_lens"));
        assertNotNull(row.get("search_date"));
        assertDecimal("1.25", row.get("od_sphere"));
        assertDecimal("2.00", row.get("od_add"));
        assertDecimal("-1.50", row.get("os_sphere"));
        assertEquals(170, ((Number) row.get("os_axis")).intValue());
    }
}
