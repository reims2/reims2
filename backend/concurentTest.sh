#!/bin/bash

curl -X POST "http://localhost:9966/pvh/api/glasses" -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"appearance\": \"neutral\",  \"dispensed\": true,  \"glassesSize\": \"large\",  \"glassesType\": \"single\",  \"location\": \"sa\",  \"od\": {    \"add\": 0,    \"axis\": 0,    \"cylinder\": 0,    \"sphere\": 0  },  \"os\": {    \"add\": 0,    \"axis\": 0,    \"cylinder\": 0,    \"sphere\": 0  }}"
sleep 0.0001s
curl -X POST "http://localhost:9966/pvh/api/glasses" -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"appearance\": \"neutral\",  \"dispensed\": true,  \"glassesSize\": \"large\",  \"glassesType\": \"single\",  \"location\": \"sa\",  \"od\": {    \"add\": 0,    \"axis\": 0,    \"cylinder\": 0,    \"sphere\": 0  },  \"os\": {    \"add\": 0,    \"axis\": 0,    \"cylinder\": 0,    \"sphere\": 0  }}"
