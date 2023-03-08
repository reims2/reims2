package org.pvh.model.dto;

import java.io.Serializable;

/**
 * A DTO for the {@link org.pvh.model.entity.Glasses} entity
 */
public class GlassesDispenseDTO implements Serializable {

    private Long id;

    public GlassesDispenseDTO() {}

    public GlassesDispenseDTO(Long id) {

        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
