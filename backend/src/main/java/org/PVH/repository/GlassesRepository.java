/*
 * Copyright 2002-2017 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.PVH.repository;

import org.PVH.model.Glasses;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GlassesRepository  extends JpaRepository<Glasses, Long>, CustomGlassesRepository {



    Page<Glasses> findByGlassesTypeAndLocation(String location, String glassesType, Pageable pageable);

    List<Glasses> findByGlassesTypeContaining(String glassesType, Sort sort);

    Page<Glasses> findAllByLocation(String location, Pageable pageable);

    Optional<Glasses> findAllByIdAndLocation(long id, String location);
}
