
package org.PVH.repository;

import org.PVH.model.Eye;
import org.PVH.model.Glasses;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;


public interface EyeRepository extends JpaRepository<Eye, Long> , JpaSpecificationExecutor<Glasses> {

}
