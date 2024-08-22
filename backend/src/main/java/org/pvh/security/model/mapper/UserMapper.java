package org.pvh.security.model.mapper;

import org.mapstruct.*;
import org.pvh.security.model.dto.UserDTO;
import org.pvh.security.model.entity.User;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = "spring")
public interface UserMapper {
    User userDTOToUser(UserDTO userDTO);

    UserDTO userToUserDTO(User user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    User updateUserFromUserDTO(UserDTO userDTO, @MappingTarget User user);
}
