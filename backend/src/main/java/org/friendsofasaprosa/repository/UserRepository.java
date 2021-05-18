package org.friendsofasaprosa.repository;

import org.springframework.dao.DataAccessException;
import org.friendsofasaprosa.model.User;

public interface UserRepository {

    void save(User user) throws DataAccessException;
}
