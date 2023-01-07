package org.pvh.repository.RSQL;

import cz.jirutka.rsql.parser.ast.ComparisonOperator;
import org.hibernate.query.criteria.internal.path.PluralAttributePath;
import org.hibernate.query.criteria.internal.path.SingularAttributePath;
import org.pvh.error.PVHException;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;

import javax.persistence.criteria.*;
import javax.persistence.metamodel.*;
import java.util.List;
import java.util.stream.Collectors;

public class GenericRsqlSpecification<T> implements Specification<T> {

    private String property;
    private ComparisonOperator operator;
    private List<String> arguments;

    public GenericRsqlSpecification(String property, ComparisonOperator operator,List<String> arguments){
        this.property = property;
        this.operator = operator;
        this.arguments = arguments;
    }

    @Override
    public Predicate toPredicate(Root<T> root, CriteriaQuery<?> query,
                                 CriteriaBuilder builder) {
        Path<String> propertyExpression = parseProperty(root);
        List<Object> args = castArguments(propertyExpression);
        Object argument = args.get(0);
        switch (RsqlSearchOperation.getSimpleOperator(operator)) {
            case EQUAL:
                if (argument instanceof String)
                    return builder.like(propertyExpression,
                        argument.toString().replace('*', '%'));
                else if (argument == null)
                    return builder.isNull(propertyExpression);
                else return builder.equal(propertyExpression, argument);

            case NOT_EQUAL:
                if (argument instanceof String)
                    return builder.notLike(propertyExpression,
                        argument.toString().replace('*', '%'));
                else if (argument == null)
                    return builder.isNotNull(propertyExpression);
                else return builder.notEqual(propertyExpression, argument);

            case GREATER_THAN:
                return builder.greaterThan(propertyExpression,
                    argument.toString());

            case GREATER_THAN_OR_EQUAL:
                return builder.greaterThanOrEqualTo(propertyExpression,
                    argument.toString());

            case LESS_THAN:
                return builder.lessThan(propertyExpression,
                    argument.toString());

            case LESS_THAN_OR_EQUAL:
                return builder.lessThanOrEqualTo(propertyExpression,
                    argument.toString());
            case IN:
                return propertyExpression.in(args);
            case NOT_IN:
                return builder.not(propertyExpression.in(args));
        }

        return null;
    }

    // This method will help us diving deep into nested property using the dot convention
    // The originial tutorial did not have this, so it can only parse the shallow properties.
    private Path<String> parseProperty(Root<T> root) {
        Path<String> path;
        if (property.contains(".")) {
            // Nested properties
            String[] pathSteps = property.split("\\.");
            String step = pathSteps[0];
            path = root.get(step);
            From lastFrom = root;
            try {
                for (int i = 1; i <= pathSteps.length - 1; i++) {

                    if (path instanceof PluralAttributePath) {
                        PluralAttribute attr = ((PluralAttributePath) path).getAttribute();
                        Join join = getJoin(attr, lastFrom);
                        if(join == null){
                            throw new PVHException("Path parameters are not set correctly...", HttpStatus.INTERNAL_SERVER_ERROR);
                        }
                        path = join.get(pathSteps[i]);
                        lastFrom = join;
                    } else if (path instanceof SingularAttributePath) {
                        SingularAttribute attr = ((SingularAttributePath) path).getAttribute();
                        if (attr.getPersistentAttributeType() != Attribute.PersistentAttributeType.BASIC) {
                            Join join = lastFrom.join(attr, JoinType.LEFT);
                            path = join.get(pathSteps[i]);
                            lastFrom = join;
                        } else {
                            path = path.get(pathSteps[i]);
                        }
                    } else {
                        path = path.get(pathSteps[i]);
                    }
                }
            }catch (Exception e){
                throw new RuntimeException(e);
            }
        } else {
            path = root.get(property);
        }
        return path;
    }

    private Join getJoin(PluralAttribute attr, From from) {
        switch (attr.getCollectionType()){
            case COLLECTION:
                return from.join((CollectionAttribute) attr);
            case SET:
                return from.join((SetAttribute) attr);
            case LIST:
                return from.join((ListAttribute) attr);
            case MAP:
                return from.join((MapAttribute) attr);
            default:
                return null;
        }
    }

    private List<Object> castArguments(Path<?> propertyExpression) {
        Class<?> type = propertyExpression.getJavaType();

        return arguments.stream().map(arg -> {
            if (type.equals(Integer.class)) return Integer.parseInt(arg);
            else if (type.equals(Long.class)) return Long.parseLong(arg);
            else if (type.equals(Byte.class)) return Byte.parseByte(arg);
            else return arg;
        }).collect(Collectors.toList());
    }

}

