package org.pvh.model.dto;

import jakarta.validation.constraints.*;
import org.pvh.model.entity.Eye;

import java.math.BigDecimal;

public record EyeDTO(
    @NotNull
    @DecimalMin(value = "-30.0")
    @DecimalMax(value = "30.0")
    BigDecimal sphere,
    @NotNull
    @NegativeOrZero(message = "Cylinder must be negative")
    @DecimalMin(value = "-6.0", message = "Cylinder must be greater than -6 D")
    BigDecimal cylinder,
    @NotNull
    @PositiveOrZero(message = "Axis must be positive")
    @Max(value = 180)
    int axis,
    @PositiveOrZero(message = "Additional must be positive")
    @DecimalMax(value = "8.0")
    BigDecimal add) {

    public static EyeDTO from(Eye eye) {
        return eye == null ? null : new EyeDTO(eye.getSphere(), eye.getCylinder(), eye.getAxis(), eye.getAdd());
    }

    public Eye toEye() {
        return applyTo(new Eye());
    }

    public Eye applyTo(Eye eye) {
        eye.setSphere(orZero(sphere));
        eye.setCylinder(orZero(cylinder));
        eye.setAxis(axis);
        eye.setAdd(orZero(add));
        return eye;
    }

    private static BigDecimal orZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
