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
package org.friendsofasaprosa.service.clinicService;

import static org.assertj.core.api.Assertions.assertThat;

import org.springframework.beans.factory.annotation.Autowired;
import org.friendsofasaprosa.service.MainService;
import org.springframework.test.context.ContextConfiguration;

/**
 * <p> Base class for {@link MainService} integration tests. </p> <p> Subclasses should specify Spring context
 * configuration using {@link ContextConfiguration @ContextConfiguration} annotation </p> <p>
 * AbstractclinicServiceTests and its subclasses benefit from the following services provided by the Spring
 * TestContext Framework: </p> <ul> <li><strong>Spring IoC container caching</strong> which spares us unnecessary set up
 * time between test execution.</li> <li><strong>Dependency Injection</strong> of test fixture instances, meaning that
 * we don't need to perform application context lookups. See the use of {@link Autowired @Autowired} on the <code>{@link
 * AbstractClinicServiceTests#mainService clinicService}</code> instance variable, which uses autowiring <em>by
 * type</em>. <li><strong>Transaction management</strong>, meaning each test method is executed in its own transaction,
 * which is automatically rolled back by default. Thus, even if tests insert or otherwise change database state, there
 * is no need for a teardown or cleanup script. <li> An {@link org.springframework.context.ApplicationContext
 * ApplicationContext} is also inherited and can be used for explicit bean lookup if necessary. </li> </ul>
 *
 * @author Ken Krebs
 * @author Rod Johnson
 * @author Juergen Hoeller
 * @author Sam Brannen
 * @author Michael Isvy
 * @author Vitaliy Fedoriv
 */
public abstract class AbstractClinicServiceTests {

    @Autowired
    protected MainService mainService;

//    @Test
//    public void shouldFindVetDyId(){
//    	Vet vet = this.clinicService.findVetById(1);
//    	assertThat(vet.getFirstName()).isEqualTo("James");
//    	assertThat(vet.getLastName()).isEqualTo("Carter");
//    }
//
//    @Test
//    @Transactional
//    public void shouldInsertVet() {
//        Collection<Vet> vets = this.clinicService.findAllVets();
//        int found = vets.size();
//
//        Vet vet = new Vet();
//        vet.setFirstName("John");
//        vet.setLastName("Dow");
//
//        this.clinicService.saveVet(vet);
//        assertThat(vet.getId().longValue()).isNotEqualTo(0);
//
//        vets = this.clinicService.findAllVets();
//        assertThat(vets.size()).isEqualTo(found + 1);
//    }
//
//    @Test
//    @Transactional
//    public void shouldUpdateVet(){
//    	Vet vet = this.clinicService.findVetById(1);
//    	String oldLastName = vet.getLastName();
//        String newLastName = oldLastName + "X";
//        vet.setLastName(newLastName);
//        this.clinicService.saveVet(vet);
//        vet = this.clinicService.findVetById(1);
//        assertThat(vet.getLastName()).isEqualTo(newLastName);
//    }
//
//    @Test
//    @Transactional
//    public void shouldDeleteVet(){
//    	Vet vet = this.clinicService.findVetById(1);
//        this.clinicService.deleteVet(vet);
//        try {
//        	vet = this.clinicService.findVetById(1);
//		} catch (Exception e) {
//			vet = null;
//		}
//        assertThat(vet).isNull();
//    }
//
//    @Test
//    public void shouldFindSpecialtyById(){
//    	Specialty specialty = this.clinicService.findSpecialtyById(1);
//    	assertThat(specialty.getName()).isEqualTo("radiology");
//    }
//
//    @Test
//    public void shouldFindAllSpecialtys(){
//        Collection<Specialty> specialties = this.clinicService.findAllSpecialties();
//        Specialty specialty1 = EntityUtils.getById(specialties, Specialty.class, 1);
//        assertThat(specialty1.getName()).isEqualTo("radiology");
//        Specialty specialty3 = EntityUtils.getById(specialties, Specialty.class, 3);
//        assertThat(specialty3.getName()).isEqualTo("dentistry");
//    }
//
//    @Test
//    @Transactional
//    public void shouldInsertSpecialty() {
//        Collection<Specialty> specialties = this.clinicService.findAllSpecialties();
//        int found = specialties.size();
//
//        Specialty specialty = new Specialty();
//        specialty.setName("dermatologist");
//
//        this.clinicService.saveSpecialty(specialty);
//        assertThat(specialty.getId().longValue()).isNotEqualTo(0);
//
//        specialties = this.clinicService.findAllSpecialties();
//        assertThat(specialties.size()).isEqualTo(found + 1);
//    }
//
//    @Test
//    @Transactional
//    public void shouldUpdateSpecialty(){
//    	Specialty specialty = this.clinicService.findSpecialtyById(1);
//    	String oldLastName = specialty.getName();
//        String newLastName = oldLastName + "X";
//        specialty.setName(newLastName);
//        this.clinicService.saveSpecialty(specialty);
//        specialty = this.clinicService.findSpecialtyById(1);
//        assertThat(specialty.getName()).isEqualTo(newLastName);
//    }
//
//    @Test
//    @Transactional
//    public void shouldDeleteSpecialty(){
//        Specialty specialty = new Specialty();
//        specialty.setName("test");
//        this.clinicService.saveSpecialty(specialty);
//        Integer specialtyId = specialty.getId();
//        assertThat(specialtyId).isNotNull();
//    	specialty = this.clinicService.findSpecialtyById(specialtyId);
//        assertThat(specialty).isNotNull();
//        this.clinicService.deleteSpecialty(specialty);
//        try {
//        	specialty = this.clinicService.findSpecialtyById(specialtyId);
//		} catch (Exception e) {
//			specialty = null;
//		}
//        assertThat(specialty).isNull();
//    }


}
