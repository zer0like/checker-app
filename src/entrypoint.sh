#!/bin/sh

npx prisma generate && sleep 20

exec "$@"