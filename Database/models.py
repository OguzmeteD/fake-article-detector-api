from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from Database.connection import Base
from datetime import datetime
from sqlalchemy.sql import func



class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
class Prediction(Base):
    __tablename__ = 'predictions'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    model_name = Column(String)
    input_data = Column(Text)
    output_data = Column(Text)
    created_at = Column(DateTime)
    
    user = relationship("User", back_populates="predictions")
User.predictions = relationship("Prediction", order_by=Prediction.id, back_populates="user")