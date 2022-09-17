import pandas as pd
import numpy as np
from airflow import DAG
from airflow.operators.python import PythonOperator

def transform_data1(*args, **kargs):
    #read data1 csv file
    names_data1 = pd.read_csv(kwargs['data1_path'],
                            sep=',',
                            header=0)
    #drop rows with null names
    names_data1 = names_data1.dropna(subset=['name'])

    #remove prepended zeros in string price then convert back float
    names_data1['price'].astype(str).str.replace(r'^(0+)', '').fillna('0').astype(float)

    #add column with boolean status on price>100
    names_data1['above_100'] = np.where(names_data1['price'] > 100, True, False)
    
    #extract first & last name using expression in case of middle names
    names_cols1 = names_data1['name'].str.extract(r'(?P<first_name>\w+) (?P<last_name>\w+)', expand=True)

    #join 2 dataframes to combine all needed columns
    names_data1=names_cols1.join(names_data1[['price','above_100']])

def transform_data2(*args, **kargs):
    #read data2 csv file
    names_data2 = pd.read_csv(kwargs['data2_path'],
                            sep=',',
                            header=0)
    #drop rows with null names
    names_data2 = names_data2.dropna(subset=['name'])

    #remove prepended zeros in string price then convert back float
    names_data2['price'].astype(str).str.replace(r'^(0+)', '').fillna('0').astype(float)

    #add column with boolean status on price>100
    names_data2['above_100'] = np.where(names_data2['price'] > 100, True, False)
    
    #extract first & last name using expression in case of middle names
    names_cols2 = names_data2['name'].str.extract(r'(?P<first_name>\w+) (?P<last_name>\w+)', expand=True)

    #join 2 dataframes to combine all needed columns
    names_data2=names_cols2.join(names_data2[['price','above_100']])
    

def append_data(*args, **kargs):
    #append processed data2 to processed data1 to complete the batch processing
    names_data=names_data1.append(names_data2, ignore_index=True)

def save_data(*args, **kargs):
    #save to csv file
    names_data.to_csv(kwargs['output_path'], 
                            sep=',',
                            encoding='utf-8',
                            index=False)

#set arguments
default_args={
    "owner": "airflow",
    "start_date": datetime(2022,9,18),
    "retries":1,
    "retry_delay":timedelta(minutes=10)
}

dag = DAG(
   dag_id="01_daily",
   start_date=dt.datetime(2022, 9, 18),
   schedule_interval="@daily",
   default_args=default_args
)










