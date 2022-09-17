--DDL statements to create tables based on ERD
CREATE TABLE IF NOT EXISTS public."Customer"
(
    cust_id serial PRIMARY KEY,
    cust_name varchar(255) NOT NULL,
    phone_no varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS public."SalesPerson"
(
    sales_per_id serial PRIMARY KEY,
    sales_per_name varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS public."ManufacturerCarModel"
(
    manufac_model_id serial PRIMARY KEY,
    model_name varchar(255) NOT NULL,
    manufac_name varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS public."CarSales"
(
    trans_id serial PRIMARY KEY,
    trans_datetime TIMESTAMP NOT NULL,
    cust_id integer NOT NULL,
    sales_per_id integer NOT NULL,
    CONSTRAINT "trans_cust_FK" FOREIGN KEY ("cust_id")
        REFERENCES public."Customer" ("cust_id"),
    CONSTRAINT "trans_salesper_FK" FOREIGN KEY ("sales_per_id")
        REFERENCES public."SalesPerson" ("sales_per_id")
);

CREATE TABLE IF NOT EXISTS public."Car"
(
    car_serial_id serial PRIMARY KEY,
    car_weight smallint NOT NULL,
    price money NOT NULL,
    manufac_model_id integer NOT NULL,
    trans_id integer NOT NULL,
    CONSTRAINT "car_model_FK" FOREIGN KEY ("manufac_model_id")
        REFERENCES public."ManufacturerCarModel" ("manufac_model_id"),
    CONSTRAINT "car_trans_FK" FOREIGN KEY ("trans_id")
        REFERENCES public."CarSales" ("trans_id")
);

