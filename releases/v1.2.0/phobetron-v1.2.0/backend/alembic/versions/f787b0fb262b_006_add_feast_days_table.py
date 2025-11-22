"""006_add_feast_days_table

Revision ID: f787b0fb262b
Revises: 7b8c9d0e1f23
Create Date: 2025-11-14 16:35:40

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f787b0fb262b'
down_revision = '7b8c9d0e1f23'
branch_labels = None
depends_on = None


def upgrade():
    # Create feast_days table
    op.create_table(
        'feast_days',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('feast_type', sa.String(length=50), nullable=False, comment='Feast identifier: passover, unleavened_bread, pentecost, trumpets, atonement, tabernacles'),
        sa.Column('name', sa.String(length=255), nullable=False, comment="Full name of the feast (e.g., 'Passover (Pesach)', 'Day of Atonement (Yom Kippur)')"),
        sa.Column('hebrew_date', sa.String(length=100), nullable=False, comment="Hebrew calendar date (e.g., 'Nisan 14', 'Tishrei 1', 'Tishrei 15-21')"),
        sa.Column('gregorian_date', sa.Date(), nullable=False, comment='Gregorian calendar date (or start date for multi-day feasts)'),
        sa.Column('gregorian_year', sa.Integer(), nullable=False, comment='Gregorian year for easy querying'),
        sa.Column('end_date', sa.Date(), nullable=True, comment='End date for multi-day feasts (null for single-day feasts)'),
        sa.Column('is_range', sa.Boolean(), nullable=False, server_default='false', comment='True if feast spans multiple days'),
        sa.Column('significance', sa.Text(), nullable=True, comment='Biblical and theological significance of the feast'),
        sa.Column('data_source', sa.String(length=100), server_default='hebrew_calendar_module', comment="Source of calculation (e.g., 'hebrew_calendar_module', 'manual_entry')"),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('feast_type', 'gregorian_year', name='uq_feast_type_year'),
        sa.CheckConstraint(
            "feast_type IN ('passover', 'unleavened_bread', 'pentecost', 'trumpets', 'atonement', 'tabernacles')",
            name='ck_feast_type'
        ),
        comment='Jewish biblical feast days calculated from Hebrew calendar'
    )
    
    # Create indexes
    op.create_index('idx_feast_type_year', 'feast_days', ['feast_type', 'gregorian_year'])
    op.create_index('idx_feast_date', 'feast_days', ['gregorian_date'])


def downgrade():
    op.drop_index('idx_feast_date', table_name='feast_days')
    op.drop_index('idx_feast_type_year', table_name='feast_days')
    op.drop_table('feast_days')
