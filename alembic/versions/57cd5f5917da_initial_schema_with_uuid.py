"""Initial schema with UUID

Revision ID: 57cd5f5917da
Revises: 
Create Date: 2025-06-09 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '57cd5f5917da'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # uuid extension'ı ekle
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')

    # Eski tabloları sil (varsa)
    op.execute('DROP TABLE IF EXISTS predictions CASCADE;')
    op.execute('DROP TABLE IF EXISTS users CASCADE;')

    # users tablosunu uuid primary key ile oluştur
    op.create_table(
        'users',
        sa.Column('id', sa.UUID(), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('username', sa.String(), unique=True, index=True),
        sa.Column('email', sa.String(), unique=True, index=True),
        sa.Column('hashed_password', sa.String()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True))
    )

    # predictions tablosunu uuid foreign key ile oluştur
    op.create_table(
        'predictions',
        sa.Column('id', sa.UUID(), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', sa.UUID(), sa.ForeignKey('users.id')),
        sa.Column('model_name', sa.String()),
        sa.Column('input_data', sa.Text()),
        sa.Column('output_data', sa.Text()),
        sa.Column('created_at', sa.DateTime())
    )

def downgrade():
    op.drop_table('predictions')
    op.drop_table('users')
