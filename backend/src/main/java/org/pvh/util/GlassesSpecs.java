package org.pvh.util;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.pvh.model.entity.Dispense;
import org.pvh.model.entity.Glasses;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;

public class GlassesSpecs {

    public static Specification<Glasses> hasLocation(String location) {
        return (root, query, criteriaBuilder) -> {
            Predicate equalPredicate = criteriaBuilder.equal(root.get("location"), location);
            return equalPredicate;
        };
    }

    public static Specification<Glasses> isDispensed(boolean dispensed) {
        return (root, query, criteriaBuilder) -> {
            Predicate equalPredicate = criteriaBuilder.equal(root.get("dispensed"), dispensed);
            return equalPredicate;
        };
    }

    public static Specification<Glasses> dispensedInRange(Instant from, Instant to) {
        return (root, query, criteriaBuilder) -> {
            Join<Glasses, Dispense> dispense = root.join("dispense");
            return criteriaBuilder.and(
                criteriaBuilder.greaterThanOrEqualTo(dispense.<Instant>get("modifyDate"), from),
                criteriaBuilder.lessThan(dispense.<Instant>get("modifyDate"), to));
        };
    }

}
