
package org.pvh.repository;

import org.pvh.model.entity.Eye;
import org.pvh.model.entity.Glasses;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface EyeRepository extends JpaRepository<Eye, Long>, JpaSpecificationExecutor<Glasses> {

}
