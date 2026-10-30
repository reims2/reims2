package org.pvh.util;

import org.junit.jupiter.api.Test;
import org.pvh.model.entity.Dispense;
import org.pvh.model.entity.Eye;
import org.pvh.model.entity.Glasses;
import org.pvh.model.entity.SearchLog;
import org.pvh.model.enums.AppearanceEnum;
import org.pvh.model.enums.BalLensEnum;
import org.pvh.model.enums.DispenseReasonEnum;
import org.pvh.model.enums.GlassesSizeEnum;
import org.pvh.model.enums.GlassesTypeEnum;
import org.pvh.model.enums.LocationEnum;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class CsvExportTest {

    private static final String HEADER = "\"SKU\",\"Location\",\"Type\",\"Appearance\",\"Size\",\"Added date (in CST)\","
        + "\"Is dispensed?\",\"SKU before dispension\",\"dispension date (in CST)\",\"dispense type\",\"isBal\",\"highTolerance\","
        + "\"OD Sphere\",\"OD Cylinder\",\"OD Axis\",\"OD Add\",\"OS Sphere\",\"OS Cylinder\",\"OS Axis\",\"OS Add\"\n";

    private static Eye eye(String sphere, String cylinder, int axis, String add) {
        return new Eye(new BigDecimal(sphere), new BigDecimal(cylinder), axis, new BigDecimal(add));
    }

    private static Glasses glasses() {
        Glasses glasses = new Glasses(GlassesTypeEnum.multifocal, GlassesSizeEnum.small, AppearanceEnum.feminine, LocationEnum.sa,
            eye("1.50", "0.00", 0, "2.00"), eye("-2.25", "-0.50", 90, "2.50"));
        glasses.setSku(12);
        glasses.setCreationDate(Instant.parse("2026-01-15T18:30:00Z"));
        return glasses;
    }

    @Test
    public void glasses_inStock() {
        String csv = CsvExport.glasses(List.of(glasses()));

        assertEquals(HEADER
            + "\"12\",\"sa\",\"multifocal\",\"feminine\",\"small\",\"2026-01-15 12:30:00\",\"false\",\"\",\"\",\"\",\"\",\"\","
            + "\"-2.25\",\"-0.50\",\"90\",\"2.50\",\"1.50\",\"0.00\",\"0\",\"2.00\"\n", csv);
    }

    @Test
    public void glasses_dispensed() {
        Glasses dispensed = glasses();
        dispensed.setSku(null);
        dispensed.setDispensed(true);
        Dispense dispense = new Dispense();
        dispense.setPreviousSku(12);
        // UTC is already the next day
        dispense.setModifyDate(Instant.parse("2026-01-16T02:00:00Z"));
        dispense.setDispenseReason(DispenseReasonEnum.DISPENSED);
        dispensed.setDispense(dispense);

        String csv = CsvExport.glasses(List.of(dispensed));

        assertEquals(HEADER
            + "\"\",\"sa\",\"multifocal\",\"feminine\",\"small\",\"2026-01-15 12:30:00\",\"true\",\"12\",\"2026-01-15 20:00:00\","
            + "\"DISPENSED\",\"\",\"\",\"-2.25\",\"-0.50\",\"90\",\"2.50\",\"1.50\",\"0.00\",\"0\",\"2.00\"\n", csv);

        dispense.setDispenseReason(null);
        String withoutReason = CsvExport.glasses(List.of(dispensed));
        assertEquals(csv.replace("\"DISPENSED\"", "\"\""), withoutReason);
    }

    @Test
    public void searches() {
        SearchLog search = new SearchLog();
        search.setLocation(LocationEnum.sm);
        search.setGlassesType(GlassesTypeEnum.single);
        search.setSearchDate(Instant.parse("2026-01-15T18:30:00Z"));
        search.setBalLens(BalLensEnum.DISABLE_OS);
        search.setIncreaseSearchTolerance(true);
        search.setOd(eye("-3.00", "-1.25", 175, "0.00"));
        search.setOs(eye("0.00", "0.00", 0, "0.00"));

        String csv = CsvExport.searches(List.of(search));

        String row = "\"\",\"sm\",\"single\",\"\",\"\",\"2026-01-15 12:30:00\",\"\",\"\",\"\",\"\",\"DISABLE_OS\",\"true\","
            + "\"-3.00\",\"-1.25\",\"175\",\"0.00\",\"0.00\",\"0.00\",\"0\",\"0.00\"\n";
        assertEquals(HEADER + row, csv);

        search.setIncreaseSearchTolerance(null);
        assertEquals(HEADER + row.replace("\"true\"", "\"false\""), CsvExport.searches(List.of(search)));
    }
}
