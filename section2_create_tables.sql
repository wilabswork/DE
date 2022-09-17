CREATE TABLE IF NOT EXISTS "CarModel"
(
    car_serial_id serial PRIMARY KEY,
    model_name varchar(255) NOT NULL,
    manufac_name varchar(255) NOT NULL,
    car_weight smallint,
    price money NOT NULL
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

user_id serial PRIMARY KEY,
	username VARCHAR ( 50 ) UNIQUE NOT NULL,
	password VARCHAR ( 50 ) NOT NULL,
	email VARCHAR ( 255 ) UNIQUE NOT NULL,
	created_on TIMESTAMP NOT NULL,
        last_login TIMESTAMP 


        CREATE TABLE account_roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  grant_date TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (role_id)
      REFERENCES roles (role_id),
  FOREIGN KEY (user_id)
      REFERENCES accounts (user_id)
);