package org.pvh.util;

import com.opencsv.CSVWriter;
import org.pvh.model.entity.Eye;
import org.pvh.model.entity.Glasses;

import java.io.IOException;
import java.io.StringWriter;
import java.io.UncheckedIOException;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import org.pvh.model.entity.SearchLog;

public class CsvExport {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
        .withZone(CampaignZone.ZONE);

    private static final String[] header = new String[] { "SKU",
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

    public static String glasses(Collection<Glasses> glasses) {
        StringWriter out = new StringWriter();
        try (CSVWriter writer = new CSVWriter(out)) {
            writer.writeNext(header);
            glasses.forEach(glass -> writeSingleGlasses(writer, glass));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        return out.toString();
    }

    public static String searches(Collection<SearchLog> searches) {
        StringWriter out = new StringWriter();
        try (CSVWriter writer = new CSVWriter(out)) {
            writer.writeNext(header);
            searches.forEach(search -> writeSingleSearch(writer, search));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        return out.toString();
    }

    private static void writeSingleSearch(CSVWriter writer, SearchLog glass) {
        List<String> rowList = new ArrayList<>();
        rowList.add("");
        rowList.add(glass.getLocation().name());
        rowList.add(glass.getGlassesType().toString());
        rowList.add("");
        rowList.add("");
        rowList.add(DATE_FORMAT.format(glass.getSearchDate()));
        rowList.add("");
        rowList.add("");
        rowList.add("");
        rowList.add("");
        // search stuff
        rowList.add(glass.getBalLens().name());
        rowList.add(
                glass.getIncreaseSearchTolerance() != null && glass.getIncreaseSearchTolerance() ? "true" : "false");
        for (Eye eye : new Eye[] { glass.getOd(), glass.getOs() }) {
            rowList.add(eye.getSphere().toString());
            rowList.add(eye.getCylinder().toString());
            rowList.add(Integer.toString(eye.getAxis()));
            rowList.add(eye.getAdd().toString());
        }

        String[] row = rowList.toArray(String[]::new);
        writer.writeNext(row);
    }

    private static void writeSingleGlasses(CSVWriter writer, Glasses glass) {
        List<String> rowList = new ArrayList<>();
        rowList.add(glass.isDispensed() ? "" : glass.getSku().toString());
        rowList.add(glass.getLocation().name());
        rowList.add(glass.getGlassesType().toString());
        rowList.add(glass.getAppearance().toString());
        rowList.add(glass.getGlassesSize().toString());
        rowList.add(DATE_FORMAT.format(glass.getCreationDate()));
        rowList.add(glass.isDispensed() ? "true" : "false");
        rowList.add(glass.isDispensed() ? glass.getDispense().getPreviousSku().toString() : "");
        rowList.add(glass.isDispensed() ? DATE_FORMAT.format(glass.getDispense().getModifyDate()) : "");
        if (glass.isDispensed() && glass.getDispense().getDispenseReason() != null)
            rowList.add(glass.getDispense().getDispenseReason().toString());
        else
            rowList.add("");

        // search stuff
        rowList.add("");
        rowList.add("");

        for (Eye eye : new Eye[] { glass.getOd(), glass.getOs() }) {
            rowList.add(eye.getSphere().toString());
            rowList.add(eye.getCylinder().toString());
            rowList.add(Integer.toString(eye.getAxis()));
            rowList.add(eye.getAdd().toString());
        }

        String[] row = rowList.toArray(String[]::new);
        writer.writeNext(row);
    }
}
