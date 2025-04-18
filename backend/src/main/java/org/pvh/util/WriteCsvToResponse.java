package org.pvh.util;

import com.opencsv.CSVWriter;
import jakarta.servlet.http.HttpServletResponse;
import org.pvh.model.entity.Eye;
import org.pvh.model.entity.Glasses;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.TimeZone;
import org.pvh.model.entity.UnsuccessfulSearch;

public class WriteCsvToResponse {

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

    public static void writeGlassesToCsvHttpResponse(HttpServletResponse servletResponse, Collection<Glasses> glasses) {
        try (CSVWriter writer = new CSVWriter(servletResponse.getWriter())) {
            writer.writeNext(header);

            for (Glasses glass : glasses) {
                writeSingleGlasses(writer, glass);
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
        servletResponse.addHeader("Content-Disposition", "attachment; filename=\"glasses.csv\"");
        servletResponse.setContentType("text/csv");
    }

    public static void writeSearchesToCsvHttpResponse(HttpServletResponse servletResponse,
            Collection<UnsuccessfulSearch> glasses) {
        // TODO here and above: we shouldn't use getWriter() before business logic is
        // done, since it's impossible to send an error after writing has started
        try (CSVWriter writer = new CSVWriter(servletResponse.getWriter())) {
            writer.writeNext(header);
            for (UnsuccessfulSearch glass : glasses) {
                writeSingleSearch(writer, glass);
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
        servletResponse.addHeader("Content-Disposition", "attachment; filename=\"unsuccessful_searches.csv\"");
        servletResponse.setContentType("text/csv");
    }

    private static void writeSingleSearch(CSVWriter writer, UnsuccessfulSearch glass) {
        DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        // come up with an alternative to hardcoding EL Salvador's timezone
        df.setTimeZone(TimeZone.getTimeZone("CST"));

        List<String> rowList = new ArrayList<>();
        rowList.add("");
        rowList.add(glass.getLocation());
        rowList.add(glass.getGlassesType().toString());
        rowList.add("");
        rowList.add("");
        rowList.add(df.format(glass.getSearchDate()));
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
        DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        // come up with an alternative to hardcoding EL Salvador's timezone
        df.setTimeZone(TimeZone.getTimeZone("CST"));

        List<String> rowList = new ArrayList<>();
        rowList.add(glass.isDispensed() ? "" : glass.getSku().toString());
        rowList.add(glass.getLocation());
        rowList.add(glass.getGlassesType().toString());
        rowList.add(glass.getAppearance().toString());
        rowList.add(glass.getGlassesSize().toString());
        rowList.add(df.format(glass.getCreationDate()));
        rowList.add(glass.isDispensed() ? "true" : "false");
        rowList.add(glass.isDispensed() ? glass.getDispense().getPreviousSku().toString() : "");
        rowList.add(glass.isDispensed() ? df.format(glass.getDispense().getModifyDate()) : "");
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
