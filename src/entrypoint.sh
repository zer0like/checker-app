#!/bin/sh

npx prisma generate && sleep 20 && ls

exec "$@"