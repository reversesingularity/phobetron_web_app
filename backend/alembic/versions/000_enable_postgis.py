"""000_enable_postgis

Enable PostGIS extension for geographic data types

Revision ID: 000_enable_postgis
Revises: 
Create Date: 2025-11-09 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '000_enable_postgis'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Enable PostGIS extension."""
    # Enable PostGIS extension (required for geography data type)
    op.execute('CREATE EXTENSION IF NOT EXISTS postgis')


def downgrade() -> None:
    """Disable PostGIS extension."""
    # Drop PostGIS extension
    op.execute('DROP EXTENSION IF EXISTS postgis CASCADE')
