// Indicadores del dashboard: abiertos, cerrados, críticos y distribución por categoría y por técnico.
function createDashboardService(db) {
  async function summary() {
    const { rows: statusRows } = await db.query('SELECT status, COUNT(*) AS total FROM incidents GROUP BY status');
    const { rows: criticalRows } = await db.query(
      `SELECT COUNT(*) AS total FROM incidents WHERE priority = 'CRITICA' AND status <> 'CERRADO'`,
    );
    const { rows: categoryRows } = await db.query(
      'SELECT category, COUNT(*) AS total FROM incidents GROUP BY category ORDER BY category',
    );
    const { rows: technicianRows } = await db.query(
      `SELECT t.id AS technician_id, t.name AS technician, COUNT(i.id) AS total
       FROM technicians t LEFT JOIN incidents i ON i.technician_id = t.id AND i.status <> 'CERRADO'
       GROUP BY t.id, t.name
       ORDER BY t.name`,
    );
    const { rows: unassignedRows } = await db.query(
      `SELECT COUNT(*) AS total FROM incidents WHERE technician_id IS NULL AND status <> 'CERRADO'`,
    );

    const byStatus = Object.fromEntries(statusRows.map((row) => [row.status, Number(row.total)]));
    const total = Object.values(byStatus).reduce((sum, n) => sum + n, 0);
    const closed = byStatus.CERRADO || 0;

    return {
      total,
      open: total - closed,
      closed,
      critical: Number(criticalRows[0].total),
      byStatus,
      byCategory: categoryRows.map((row) => ({ category: row.category, total: Number(row.total) })),
      byTechnician: [
        ...technicianRows.map((row) => ({
          technicianId: row.technician_id,
          technician: row.technician,
          total: Number(row.total),
        })),
        { technicianId: null, technician: 'Sin asignar', total: Number(unassignedRows[0].total) },
      ],
    };
  }

  return { summary };
}

module.exports = { createDashboardService };
