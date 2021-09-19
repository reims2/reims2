package org.PVH.rest;

import cz.jirutka.rsql.parser.RSQLParser;
import cz.jirutka.rsql.parser.ast.Node;
import org.PVH.model.ERole;
import org.PVH.model.Glasses;
import org.PVH.model.Role;
import org.PVH.model.User;
import org.PVH.payload.request.LoginRequest;
import org.PVH.payload.request.SignupRequest;
import org.PVH.payload.response.JwtResponse;
import org.PVH.payload.response.MessageResponse;
import org.PVH.repository.RSQL.CustomRsqlVisitor;
import org.PVH.repository.RoleRepository;
import org.PVH.repository.UserRepository;
import org.PVH.security.jwt.JwtUtils;
import org.PVH.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import javax.validation.Valid;

import java.security.Principal;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
@ConditionalOnProperty(name = "pvh.security.enable", havingValue = "true")
public class AuthController {
	@Autowired
	AuthenticationManager authenticationManager;

	@Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

	@Autowired
	PasswordEncoder encoder;

	@Autowired
    JwtUtils jwtUtils;

	@PostMapping("/signin")
	public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

		Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

		SecurityContextHolder.getContext().setAuthentication(authentication);
		String jwt = jwtUtils.generateJwtToken(authentication);

		UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
		List<String> roles = userDetails.getAuthorities().stream()
				.map(item -> item.getAuthority())
				.collect(Collectors.toList());

		return ResponseEntity.ok(new JwtResponse(jwt,
												 userDetails.getId(),
												 userDetails.getUsername(),
												 roles));
	}

    @PreAuthorize("permitAll")
    @RequestMapping(value = "/user", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<?> getCurrentUserInfo(Principal userPrincipal) {
        // todo das hat thomas hier mal eben reingepfuscht, guck mal ob das so richtig ist
        Optional<User> user = userRepository.findByUsername(userPrincipal.getName());
        if (user.isEmpty()) {
            return new ResponseEntity<String>("User was not found.", HttpStatus.NOT_FOUND);
        }
        HashMap<String, Object> map = new HashMap<>();
        map.put("username", user.get().getUsername());
        map.put("roles", user.get().getRoles().stream().map(item -> item.getName()).collect(Collectors.toList()));
        return new ResponseEntity(map, HttpStatus.OK);
    }

    @PostMapping("/signup")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> registerUser(@Valid @RequestBody User signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                .badRequest()
                .body(new MessageResponse("Error: Username is already taken!"));
        }

        // Create new user's account
        User user = new User(signUpRequest.getUsername(),
            encoder.encode(signUpRequest.getPassword()));

        Set<Role> strRoles = signUpRequest.getRoles();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null) {
            Role userRole = roleRepository.findByName(ERole.ROLE_USER.name())
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role.getName()) {
                    case ROLE_ADMIN:
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN.name())
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(adminRole);

                        break;
                    default:
                        Role userRole = roleRepository.findByName(ERole.ROLE_USER.name())
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(userRole);
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getAllUsersPage(@RequestParam(value = "search", required = false) String search,
                                                               @RequestParam(defaultValue = "0") int page,
                                                               @RequestParam(defaultValue = "3") int size,
                                                               @RequestParam(defaultValue = "username,desc") String[] sort) {

        List<Sort.Order> orders = new ArrayList<Sort.Order>();

        if (sort[0].contains(",")) {
            // will sort more than 2 fields
            // sortOrder="field, direction"
            for (String sortOrder : sort) {
                String[] _sort = sortOrder.split(",");
                orders.add(new Sort.Order(getSortDirection(_sort[1]), _sort[0]));
            }
        } else {
            // sort=[SKU, desc]
            orders.add(new Sort.Order(getSortDirection(sort[1]), sort[0]));
        }
        Collection<User> users = new ArrayList<User>();
        Pageable pagingSort = PageRequest.of(page, size, Sort.by(orders));
//        Specification<Glasses> spec = builder.build();
        Page<User> pageUser;
        if(search==null){
            pageUser = userRepository.findAll(pagingSort);
        }else {
            Node rootNode = new RSQLParser().parse(search);
            Specification<User> spec = rootNode.accept(new CustomRsqlVisitor<User>());
            pageUser = userRepository.findAll(spec, pagingSort);
        }

        users = pageUser.getContent();

        Map<String, Object> response = new HashMap<>();
        response.put("glasses", users);
        response.put("currentPage", pageUser.getNumber());
        response.put("totalItems", pageUser.getTotalElements());
        response.put("totalPages", pageUser.getTotalPages());

        if (users.isEmpty()){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE, produces = "application/json")
    @Transactional
    public ResponseEntity<String> deleteGlasses(@PathVariable("id") Long id){
        Optional<User> user = userRepository.findById(id);
        if(user.isEmpty()){
            return new ResponseEntity<String>("User was not found.",HttpStatus.NOT_FOUND);
        }
        userRepository.delete(user.get());
        return new ResponseEntity<String>("User Deleted",HttpStatus.NO_CONTENT);
    }

    private Sort.Direction getSortDirection(String direction) {
        if (direction.equals("asc")) {
            return Sort.Direction.ASC;
        } else if (direction.equals("desc")) {
            return Sort.Direction.DESC;
        }

        return Sort.Direction.ASC;
    }
}
