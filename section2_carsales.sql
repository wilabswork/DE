--list of customers and their spending in descending order
select cu.cust_id as "customer id", cu.cust_name as "customer name", sum(c.price) as "spending",
from CarSales as cs 
join Car as c on cs.car_serial_id = c.car_serial_id
join Customer as cu on cs.cust_id = cu.cust_id
group by cu.cust_id, cu.cust_name
order by sum(c.price) desc;


--top 3 manufacturers with sales quantity for the current month
select cm.manufac_model_id, cm.manufac_name as "manufacturer", count(cs.trans_id) as "sales quantity"
from CarSales as cs 
join Car as c on cs.car_serial_id = c.car_serial_id
join ManufacturerCarModel as cm on c.manufac_model_id = cm.manufac_model_id
where date_trunc('month', cs.trans_datetime)= date_trunc('month', CURRENT_DATE);
group by cm.manufac_model_id, cm.manufac_name
order by count(cs.trans_id) desc
limit 3;

