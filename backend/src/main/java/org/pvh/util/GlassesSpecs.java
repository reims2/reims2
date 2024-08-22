package org.pvh.util;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.pvh.model.entity.Dispense;
import org.pvh.model.entity.Glasses;
import org.springframework.data.jpa.domain.Specification;

import java.util.Calendar;
import java.util.Date;

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

    public static Specification<Glasses> dispensedInRange(Date startDate, Date endDate) {
        return (root, query, criteriaBuilder) -> {
            Join<Glasses, Dispense> groupJoin = root.join("dispense");
            Calendar c = Calendar.getInstance();
            c.setTime(endDate);
            c.add(Calendar.DATE, 1);
            Date endDatePlus1 = c.getTime();
            return criteriaBuilder.between(groupJoin.get("modifyDate"), startDate, endDatePlus1);
        };
    }

}
