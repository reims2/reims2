package org.pvh.repository;

import org.pvh.model.entity.Glasses;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface GlassesRepository extends JpaRepository<Glasses, Long>, CustomGlassesRepository, JpaSpecificationExecutor<Glasses> {

    Page<Glasses> findByDispensedAndGlassesTypeAndLocation(boolean dispensed, String location, String glassesType, Pageable pageable);

    List<Glasses> findByGlassesTypeContaining(String glassesType, Sort sort);

    Optional<Glasses> findAllByIdAndLocation(long id, String location);

    Optional<Glasses> findAllBySkuAndLocation(int sku, String location);


}
