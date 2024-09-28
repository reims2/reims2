#!/bin/sh
{{ ansible_managed | comment }}
set -e

if [ "$#" -ne 1 ]; then
  echo "Illegal number of parameters"
  exit 2
fi

new_tag=$1

docker service update {{ stack_name }}_frontend --image "$new_tag" --force
docker service update {{ stack_name }}_docs --image "$new_tag" --force
docker service update {{ stack_name }}_backend --image "$new_tag" --force
