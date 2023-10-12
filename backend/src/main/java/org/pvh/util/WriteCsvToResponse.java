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

public class WriteCsvToResponse {

    public static void writeGlassesToCsvHttpResponse(HttpServletResponse servletResponse, Collection<Glasses> glasses) {
        servletResponse.setContentType("text/csv");
        servletResponse.addHeader("Content-Disposition", "attachment; filename=\"glasses.csv\"");
        try (CSVWriter csvPrinter = new CSVWriter(servletResponse.getWriter())) {
            writeGlasses(csvPrinter, glasses);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }

    }

    public static void writeGlasses(CSVWriter writer, Collection<Glasses> glasses) {
        writer.writeNext(new String[] {"SKU",
                "Location",
                "Type",
                "Appearance",
                "Size",
                "Added date (in CST)",
                "Is dispensed?",
                "SKU before dispension",
                "dispension date (in CST)",
                "dispense type",
                "OD Sphere", "OD Cylinder", "OD Axis", "OD Add",
                "OS Sphere", "OS Cylinder", "OS Axis", "OS Add"});

        for (Glasses glass : glasses) {
            writeSingleGlasses(writer, glass);
        }

    }

    private static void writeSingleGlasses(CSVWriter writer, Glasses glass) {
        String pattern = "yyyy-MM-dd HH:mm:ss";
        DateFormat df = new SimpleDateFormat(pattern);
        // TODO come up with an alternative to hardcoding EL Salvador's timezone
        df.setTimeZone(TimeZone.getTimeZone("CST"));

        List<String> rowList = new ArrayList<>();
        rowList.add(glass.isDispensed() ? "-" : glass.getSku().toString());
        rowList.add(glass.getLocation());
        rowList.add(glass.getGlassesType().toString());
        rowList.add(glass.getAppearance().toString());
        rowList.add(glass.getGlassesSize().toString());
        rowList.add(df.format(glass.getCreationDate()));
        rowList.add(glass.isDispensed() ? "true" : "false");
        rowList.add(glass.isDispensed() ? glass.getDispense().getPreviousSku().toString() : "-");
        rowList.add(glass.isDispensed() ? df.format(glass.getDispense().getModifyDate()) : "-");
        if (glass.isDispensed() && glass.getDispense().getDispenseReason() != null)
            rowList.add(glass.getDispense().getDispenseReason().toString());
        else
            rowList.add("-");

        for (Eye eye : new Eye[] {glass.getOd(), glass.getOs()}) {
            rowList.add(eye.getSphere().toString());
            rowList.add(eye.getCylinder().toString());
            rowList.add(Integer.toString(eye.getAxis()));
            rowList.add(eye.getAdd().toString());
        }

        String[] row = rowList.toArray(String[]::new);
        writer.writeNext(row);
    }
}
