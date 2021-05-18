
package org.friendsofasaprosa.repository;

import org.friendsofasaprosa.model.Eye;
import org.friendsofasaprosa.model.Glasses;
import org.springframework.dao.DataAccessException;

import java.util.Collection;


public interface EyeRepository {


    Collection<Eye> findAll() throws DataAccessException;

    Eye findById(int id) throws DataAccessException;

	void save(Eye eye) throws DataAccessException;

	void delete(Eye eye) throws DataAccessException;


}
