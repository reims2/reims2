package org.PVH.repository;

import org.springframework.dao.DataAccessException;
import org.PVH.model.User;

public interface UserRepository {

    void save(User user) throws DataAccessException;
}
