import os
from supabase import create_client, Client

from sqlalchemy.engine import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
DATABASE_URL="postgresql://postgres.wxejuthasudpujcdrytk:12345oguz12345.@aws-0-eu-north-1.pooler.supabase.com:6543/postgres"
engine= create_engine(DATABASE_URL)
SessionSupabase = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()
