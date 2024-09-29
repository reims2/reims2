#!/bin/sh
{{ ansible_managed | comment }}
set -e

new_tag=$SSH_ORIGINAL_COMMAND

docker service update {{ stack_name }}_frontend --image reims2/reims2-frontend:sha-"$new_tag" --force
docker service update {{ stack_name }}_docs --image reims2/reims2-docs:sha-"$new_tag" --force
docker service update {{ stack_name }}_backend --image reims2/reims2-backend:sha-"$new_tag" --force
