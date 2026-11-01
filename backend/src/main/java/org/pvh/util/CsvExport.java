package org.pvh.util;

import com.opencsv.CSVWriter;
import org.pvh.model.entity.Dispense;
import org.pvh.model.entity.Eye;
import org.pvh.model.entity.Glasses;
import org.pvh.model.entity.SearchLog;

import java.io.IOException;
import java.io.StringWriter;
import java.io.UncheckedIOException;
import java.time.format.DateTimeFormatter;
import java.util.Collection;
import java.util.Objects;
import java.util.stream.Stream;

public final class CsvExport {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
        .withZone(CampaignZone.ZONE);

    private static final String[] HEADER = { "SKU",
            "Location",
            "Type",
            "Appearance",
            "Size",
            "Added date (in CST)",
            "Is dispensed?",
            "SKU before dispension",
            "dispension date (in CST)",
            "dispense type",
            "isBal",
            "highTolerance",
            "OD Sphere", "OD Cylinder", "OD Axis", "OD Add",
            "OS Sphere", "OS Cylinder", "OS Axis", "OS Add" };

    private CsvExport() {
    }

    public static String glasses(Collection<Glasses> glasses) {
        return write(glasses.stream().map(CsvExport::row));
    }

    public static String searches(Collection<SearchLog> searches) {
        return write(searches.stream().map(CsvExport::row));
    }

    private static String write(Stream<String[]> rows) {
        StringWriter out = new StringWriter();
        try (CSVWriter writer = new CSVWriter(out)) {
            writer.writeNext(HEADER);
            rows.forEach(writer::writeNext);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        return out.toString();
    }

    private static String[] row(Glasses glasses) {
        boolean dispensed = glasses.isDispensed();
        Dispense dispense = glasses.getDispense();
        return withEyes(glasses.getOd(), glasses.getOs(),
            dispensed ? "" : glasses.getSku().toString(),
            glasses.getLocation().name(),
            glasses.getGlassesType().toString(),
            glasses.getAppearance().toString(),
            glasses.getGlassesSize().toString(),
            DATE_FORMAT.format(glasses.getCreationDate()),
            String.valueOf(dispensed),
            dispensed ? dispense.getPreviousSku().toString() : "",
            dispensed ? DATE_FORMAT.format(dispense.getModifyDate()) : "",
            dispensed ? Objects.toString(dispense.getDispenseReason(), "") : "",
            "", "");
    }

    private static String[] row(SearchLog search) {
        return withEyes(search.getOd(), search.getOs(),
            "",
            search.getLocation().name(),
            search.getGlassesType().toString(),
            "", "",
            DATE_FORMAT.format(search.getSearchDate()),
            "", "", "", "",
            search.getBalLens().name(),
            String.valueOf(Boolean.TRUE.equals(search.getIncreaseSearchTolerance())));
    }

    private static String[] withEyes(Eye od, Eye os, String... columns) {
        return Stream.of(Stream.of(columns), eyeColumns(od), eyeColumns(os)).flatMap(s -> s).toArray(String[]::new);
    }

    private static Stream<String> eyeColumns(Eye eye) {
        return Stream.of(eye.getSphere().toString(), eye.getCylinder().toString(), Integer.toString(eye.getAxis()),
            eye.getAdd().toString());
    }
}
