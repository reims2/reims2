package org.pvh.util;

import com.opencsv.CSVWriter;
import org.pvh.model.dto.GlassesResponseDTO;
import org.pvh.model.entity.Eye;
import org.pvh.model.mapper.GlassesMapperImpl;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class WriteCsvToResponse {

    public static void writeGlassesToCsvHttpResponse(HttpServletResponse servletResponse, Collection<GlassesResponseDTO> glasses) {
        servletResponse.setContentType("text/csv");
        servletResponse.addHeader("Content-Disposition", "attachment; filename=\"glasses.csv\"");
        try (CSVWriter csvPrinter = new CSVWriter(servletResponse.getWriter())) {
            writeGlasses(csvPrinter, glasses);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }

    }

    public static void writeGlasses(CSVWriter writer, Collection<GlassesResponseDTO> glasses) {
        writer.writeNext(new String[] { "SKU",
                "Location",
                "Type",
                "Appearance",
                "Size",
                "Added date",
                "Is dispensed?",
                "SKU before dispension",
                "dispension date",
                "OD Sphere", "OD Cylinder", "OD Axis", "OD Add",
                "OS Sphere", "OS Cylinder", "OS Axis", "OS Add" });

        for (GlassesResponseDTO glass : glasses) {
            writeSingleGlasses(writer, glass);
        }

    }

    private static void writeSingleGlasses(CSVWriter writer, GlassesResponseDTO glasses) {

        var glass = GlassesMapperImpl.getInstance().glassesResponseDTOToGlasses(glasses);
        List<String> rowList = new ArrayList<>();
        rowList.add(glass.isDispensed() ? "-" : glass.getSku().toString());
        rowList.add(glass.getLocation());
        rowList.add(glass.getGlassesType().toString());
        rowList.add(glass.getAppearance().toString());
        rowList.add(glass.getGlassesSize().toString());
        rowList.add(glass.getCreationDate().toString());
        rowList.add(glass.isDispensed() ? "true" : "false");
        rowList.add(glass.isDispensed() ? glass.getDispense().getPreviousSku().toString() : "-");
        rowList.add(glass.isDispensed() ? glass.getDispense().getModifyDate().toString() : "-");

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
