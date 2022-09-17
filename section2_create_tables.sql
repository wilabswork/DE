CREATE TABLE IF NOT EXISTS "Car"
(
    car_serial_id serial NOT NULL,
    car_weight smallint NOT NULL,
    price money NOT NULL,
    CONSTRAINT "car_serial_PK" PRIMARY KEY car_serial_id,
    CONSTRAINT "car_model_FK" FOREIGN KEY ("manufac_model_id")
        REFERENCES "ManufacturerCarModel" ("manufac_model_id")
);

CREATE TABLE IF NOT EXISTS "ManufacturerCarModel"
(
    manufac_model_id serial PRIMARY KEY,
    model_name varchar(255) NOT NULL,
    manufac_name varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Customer"
(
    cust_id serial PRIMARY KEY,
    cust_name varchar(255) NOT NULL,
    phone_no varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS "SalesPerson"
(
    sales_per_id serial PRIMARY KEY,
    sales_per_name varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS "CarSales"
(
    trans_id serial NOT NULL,
    trans_datetime TIMESTAMP NOT NULL,
    CONSTRAINT "trans_PK" PRIMARY KEY trans_id,
    CONSTRAINT "trans_cust_FK" FOREIGN KEY ("cust_id")
        REFERENCES "Customer" ("cust_id"),
    CONSTRAINT "trans_salesper_FK" FOREIGN KEY ("sales_per_id")
        REFERENCES "SalesPerson" ("sales_per_id"),
    CONSTRAINT "trans_car_serial_FK" FOREIGN KEY ("car_serial_id")
        REFERENCES "CarModel" ("car_serial_id")
);

