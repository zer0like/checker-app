#!/bin/sh

npx prisma generate && sleep 10

exec "$@"