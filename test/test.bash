#!/bin/bash

curl -XPOST "http://localhost:9010/2015-03-31/functions/function/invocations" -d '{
  "events": [
    {
      "test": "test"
    }
  ]
}'
