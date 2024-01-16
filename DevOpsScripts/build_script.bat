@echo off

set build_number=%1
docker build --tag vuejs:%build_number%