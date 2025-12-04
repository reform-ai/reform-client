import React from 'react';

function AnalysisFilterBar({
  exerciseFilter,
  minScore,
  maxScore,
  startDate,
  endDate,
  onExerciseChange,
  onMinScoreChange,
  onMaxScoreChange,
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
  hasActiveFilters
}) {
  return (
    <article className="skeleton-card" style={{ marginBottom: '0' }}>
      <div style={{ padding: '24px' }}>
        <div className="analysis-filters">
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)'
            }}>
              Search & Filters
            </h3>
              
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-end',
              marginBottom: '16px',
              flexWrap: 'wrap'
            }}>
              {/* Exercise Filter */}
              <div style={{ width: 'fit-content' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 500
                }}>
                  Exercise
                </label>
                <select
                  value={exerciseFilter === null ? '' : exerciseFilter}
                  onChange={onExerciseChange}
                  style={{
                    width: 'auto',
                    minWidth: '140px',
                    padding: '8px 12px',
                    fontSize: '0.9rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="">All Exercises</option>
                  <option value="1">Squat</option>
                  <option value="2">Bench</option>
                  <option value="3">Deadlift</option>
                </select>
              </div>

              {/* Score Range and Date Range */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flex: 1 }}>
                <div style={{ flex: '0 0 100px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 500
                  }}>
                    Min Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={minScore}
                    onChange={onMinScoreChange}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.9rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div style={{ flex: '0 0 100px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 500
                  }}>
                    Max Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={maxScore}
                    onChange={onMaxScoreChange}
                    placeholder="100"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.9rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div style={{ flex: '0 0 160px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 500
                  }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={onStartDateChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.9rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div style={{ flex: '0 0 160px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 500
                  }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={onEndDateChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.9rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={onClearFilters}
                    className="btn"
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.9rem',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      marginLeft: 'auto',
                      height: 'fit-content'
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default AnalysisFilterBar;

