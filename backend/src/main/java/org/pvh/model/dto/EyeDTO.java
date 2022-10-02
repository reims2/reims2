package org.pvh.model.dto;

import javax.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

/**
 * A DTO for the {@link org.pvh.model.entity.Eye} entity
 */
public class EyeDTO implements Serializable {
    @DecimalMin(value = "-30.0")
    @DecimalMax(value = "30.0")
    private BigDecimal sphere;
    @NegativeOrZero(message = "Cylinder must be negative")
    @DecimalMin(value = "-6.0", message = "Cylinder must be greater than -6 D")
    private BigDecimal cylinder;
    @PositiveOrZero(message = "Axis must be positive")
    @Max(value = 180)
    private int axis;
    @PositiveOrZero(message = "Additional must be positive")
    @DecimalMax(value = "8.0")
    private BigDecimal add;

    public EyeDTO(){}
    public EyeDTO(BigDecimal sphere, BigDecimal cylinder, int axis, BigDecimal add) {
        this.sphere = sphere;
        this.cylinder = cylinder;
        this.axis = axis;
        this.add = add;
    }


    public BigDecimal getSphere() {
        return sphere;
    }

    public BigDecimal getCylinder() {
        return cylinder;
    }

    public int getAxis() {
        return axis;
    }

    public BigDecimal getAdd() {
        return add;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        EyeDTO entity = (EyeDTO) o;
        return Objects.equals(this.sphere, entity.sphere) &&
            Objects.equals(this.cylinder, entity.cylinder) &&
            Objects.equals(this.axis, entity.axis) &&
            Objects.equals(this.add, entity.add);
    }

    @Override
    public int hashCode() {
        return Objects.hash(sphere, cylinder, axis, add);
    }

    @Override
    public String toString() {
        return getClass().getSimpleName() + "(" +
            "sphere = " + sphere + ", " +
            "cylinder = " + cylinder + ", " +
            "axis = " + axis + ", " +
            "add = " + add + ")";
    }
}
