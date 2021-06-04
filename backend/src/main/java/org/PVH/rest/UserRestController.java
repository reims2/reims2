//package org.PVH.rest;
//
//import javax.validation.Valid;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpHeaders;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.PVH.model.User;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.validation.BindingResult;
//import org.springframework.web.bind.annotation.CrossOrigin;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestMethod;
//import org.springframework.web.bind.annotation.RestController;
//
//@RestController
//@CrossOrigin(exposedHeaders = "errors, content-type")
//@RequestMapping("api/users")
//public class UserRestController {
//
//    @Autowired
//    private UserService userService;
//
//    @PreAuthorize( "hasRole(@roles.ADMIN)" )
//    @RequestMapping(value = "", method = RequestMethod.POST, produces = "application/json")
//    public ResponseEntity<User> addOwner(@RequestBody @Valid User user,  BindingResult bindingResult) throws Exception {
//        BindingErrorsResponse errors = new BindingErrorsResponse();
//        HttpHeaders headers = new HttpHeaders();
//        if (bindingResult.hasErrors() || (user == null)) {
//            errors.addAllErrors(bindingResult);
//            headers.add("errors", errors.toJSON());
//            return new ResponseEntity<User>(user, headers, HttpStatus.BAD_REQUEST);
//        }
//
//        this.userService.saveUser(user);
//        return new ResponseEntity<User>(user, headers, HttpStatus.CREATED);
//    }
//
//    @PreAuthorize( "hasRole(@roles.ADMIN)" )
//    @RequestMapping(value = "/login", method = RequestMethod.POST, produces = "application/json")
//    public ResponseEntity<Boolean> login(@RequestBody @Valid User user, BindingResult bindingResult) throws Exception {
//        BindingErrorsResponse errors = new BindingErrorsResponse();
//        HttpHeaders headers = new HttpHeaders();
//        if (bindingResult.hasErrors() || (user == null)) {
//            errors.addAllErrors(bindingResult);
//            headers.add("errors", errors.toJSON());
//            return new ResponseEntity<Boolean>(HttpStatus.BAD_REQUEST);
//        }
//
//        return new ResponseEntity<Boolean>(userService.checkUser(user), headers, HttpStatus.OK);
//    }
//}
