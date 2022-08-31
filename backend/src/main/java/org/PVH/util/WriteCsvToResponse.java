package org.PVH.util;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.PVH.model.Eye;
import org.PVH.model.Glasses;

import com.opencsv.CSVWriter;

public class WriteCsvToResponse {

    public static void writeGlasses(CSVWriter writer, Collection<Glasses> glasses) {
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

        for (Glasses glass : glasses) {
            writeSingleGlasses(writer, glass);
        }

    }

    private static void writeSingleGlasses(CSVWriter writer, Glasses glass) {

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
