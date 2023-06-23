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
stack_file="/srv/$stack_name/docker-compose.yml"

rm -f /tmp/sed-changelog || true
# Replace version in docker-compose file
sed -i -E 's;(image: ).*'"$service_name"'.*$;\1'"$new_tag"';w /tmp/sed-changelog' "$stack_file"
if [ -s /tmp/sed-changelog ]; then
    echo "Image version updated"
else
    echo "Image version not updated file"
fi

# Update stack
docker stack deploy -c "$stack_file" "$stack_name"

# Wait for specific service to be up again
docker run --rm -i -v /var/run/docker.sock:/var/run/docker.sock \
      sudobmitch/docker-stack-wait -n "$service_name" "$stack_name"