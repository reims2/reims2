#!/bin/sh
{{ ansible_managed | comment }}
set -e

if [ "$#" -ne 3 ]; then
    echo "Illegal number of parameters"
    exit 2
fi


stack_name=$1
service_name=$2
new_tag=$3

docker service update "$stack_name"_"$service_name" --image "$new_tag" --force 
