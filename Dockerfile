FROM postgres
ENV POSTGRES_PASSWORD docker
ENV POSTGRES_DB carsales

#For sql file(s) to execute inside docker image
ADD section2_create_tables.sql /docker-entrypoint-initdb.d/
