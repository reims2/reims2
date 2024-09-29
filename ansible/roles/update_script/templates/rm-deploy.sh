#!/bin/sh
{{ ansible_managed | comment }}
set -e

stack_name=$SSH_ORIGINAL_COMMAND

docker stack rm $stack_name
