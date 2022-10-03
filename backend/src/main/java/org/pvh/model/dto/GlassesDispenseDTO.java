package org.pvh.model.dto;

import javax.validation.constraints.Pattern;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link org.pvh.model.entity.Glasses} entity
 */
public class GlassesDispenseDTO implements Serializable {

    private long id;

    public GlassesDispenseDTO() {
    }

    public GlassesDispenseDTO(long id) {

        this.id = id;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }
}
