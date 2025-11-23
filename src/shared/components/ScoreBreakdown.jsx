// Score Breakdown Component
// Reusable component for displaying overall form score and expandable component breakdowns
// Usable by both upload and livestream modes

import React from 'react';
import AngleAnalysis from './analysis/AngleAnalysis';
import AsymmetryAnalysis from './analysis/AsymmetryAnalysis';
import MovementAnalysis from './analysis/MovementAnalysis';
import RepConsistencyAnalysis from './analysis/RepConsistencyAnalysis';
import KneeValgusAnalysis from './analysis/KneeValgusAnalysis';
import AsymmetryPlot from './charts/AsymmetryPlot';
import PerRepPlot from './charts/PerRepPlot';
import { getVideoMetadata } from '../utils/videoMetadata';

const detailCardStyle = {
  marginTop: '12px',
  padding: '12px',
  backgroundColor: 'var(--card-bg)',
  borderRadius: '10px',
  border: '1px solid var(--border-color)'
};

function ScoreBreakdown({ 
  formAnalysis, 
  componentScores, 
  calculationResults,
  squatPhases,
  frameCount,
  expandedStates,
  onToggleExpanded,
  fps: fpsOverride = null
}) {
  if (!formAnalysis?.final_score) return null;

  const finalScore = formAnalysis.final_score.final_score;
  const grade = formAnalysis.final_score.grade;
  
  // Get video metadata using centralized function
  const { fps } = getVideoMetadata({
    calculationResults,
    formAnalysis,
    squatPhases,
    frameCount,
    fpsOverride
  });

  const scoreColor = finalScore >= 90 ? 'var(--score-excellent)' :
                     finalScore >= 75 ? 'var(--score-good)' :
                     finalScore >= 60 ? 'var(--score-warning)' : 'var(--score-poor)';

  return (
    <div style={{
      marginTop: '20px',
      padding: '16px',
      backgroundColor: 'var(--card-bg)',
      border: `3px solid ${scoreColor}`,
      borderRadius: '8px',
      textAlign: 'center'
    }}>
      <h2 className="overall-score-header" style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'var(--text-primary)', fontWeight: 600 }}>
        Overall Form Score
      </h2>
      <div className="overall-score-display" style={{
        fontSize: '36px',
        fontWeight: 'bold',
        color: scoreColor,
        margin: '8px 0'
      }}>
        {finalScore}/100
      </div>
      <p style={{
        margin: '4px 0',
        fontSize: '16px',
        fontWeight: 'bold',
        color: 'var(--text-secondary)'
      }}>
        {grade}
      </p>
      <div style={{
        marginTop: '12px',
        padding: '10px',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: '4px',
        fontSize: '12px',
        textAlign: 'left'
      }}>
        <p style={{ margin: '5px 0', fontWeight: 'bold', color: 'var(--text-primary)' }}>Score Breakdown:</p>
        
        {/* Torso Angle */}
        <div style={{ margin: '2px 0' }}>
          <span>Torso Angle: {componentScores.torso_angle || 'N/A'}/100</span>
          {formAnalysis.torso_angle && (
            <button
              onClick={() => onToggleExpanded('torso_angle')}
              style={{
                marginLeft: '8px',
                padding: '2px 6px',
                border: '1px solid var(--border-color)',
                borderRadius: '3px',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              {expandedStates.torso_angle ? '−' : '+'}
            </button>
          )}
        </div>
        {expandedStates.torso_angle && formAnalysis.torso_angle && (
          <div style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '10px', padding: '10px', backgroundColor: 'var(--card-bg)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Torso Angle Analysis</h5>
            <AngleAnalysis analysis={formAnalysis.torso_angle} title="Torso Angle Analysis" angleKey="max_angle" />
          </div>
        )}

        {/* Quad Angle */}
        <div style={{ margin: '2px 0' }}>
          <span>Quad Angle: {componentScores.quad_angle || 'N/A'}/100</span>
          {formAnalysis.quad_angle && (
            <button
              onClick={() => onToggleExpanded('quad_angle')}
              style={{
                marginLeft: '8px',
                padding: '2px 6px',
                border: '1px solid var(--border-color)',
                borderRadius: '3px',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              {expandedStates.quad_angle ? '−' : '+'}
            </button>
          )}
        </div>
        {expandedStates.quad_angle && formAnalysis.quad_angle && (
          <div style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '10px', padding: '10px', backgroundColor: 'var(--card-bg)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Quad Angle Analysis</h5>
            <AngleAnalysis analysis={formAnalysis.quad_angle} title="Quad Angle Analysis (Squat Depth)" angleKey="max_angle" />
          </div>
        )}

        {/* Movement (Glute Dominance) */}
        {formAnalysis.glute_dominance && (
          <>
            <div style={{ margin: '2px 0' }}>
              <span>Movement: {componentScores.glute_dominance || 'N/A'}/100</span>
              <button
                onClick={() => onToggleExpanded('movement')}
                style={{
                  marginLeft: '8px',
                  padding: '2px 6px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '3px',
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                {expandedStates.movement ? '−' : '+'}
              </button>
            </div>
            {expandedStates.movement && formAnalysis.glute_dominance && (
              <div style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '10px', padding: '10px', backgroundColor: 'var(--card-bg)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                <MovementAnalysis movementAnalysis={formAnalysis.glute_dominance} />
              </div>
            )}
          </>
        )}

        {/* Asymmetry (Grouped) */}
        {(formAnalysis.torso_asymmetry || formAnalysis.quad_asymmetry || formAnalysis.ankle_asymmetry) && (() => {
          const asymmetryScores = [
            componentScores.torso_asymmetry,
            componentScores.quad_asymmetry,
            componentScores.ankle_asymmetry
          ].filter(score => score !== undefined && score !== null && score !== 'N/A');
          
          const averageScore = asymmetryScores.length > 0
            ? Math.round(asymmetryScores.reduce((sum, score) => sum + (typeof score === 'number' ? score : parseInt(score) || 0), 0) / asymmetryScores.length)
            : 'N/A';
          
          return (
            <>
              <div style={{ margin: '2px 0' }}>
                <span>Asymmetry: {averageScore}/100</span>
                <button
                  onClick={() => onToggleExpanded('asymmetry')}
                  style={{
                    marginLeft: '8px',
                    padding: '2px 6px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '3px',
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {expandedStates.asymmetry ? '−' : '+'}
                </button>
              </div>
              {expandedStates.asymmetry && (
                <div style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '10px' }}>
                  {/* Torso Asymmetry */}
                  {formAnalysis.torso_asymmetry && (
                    <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: 'var(--card-bg)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                      <div style={{ marginBottom: '15px' }}>
                        <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Torso Asymmetry Analysis</h5>
                        <AsymmetryAnalysis asymmetryAnalysis={formAnalysis.torso_asymmetry} title="Torso Asymmetry Analysis" />
                      </div>
                      {calculationResults?.asymmetry_per_frame?.torso_asymmetry && (
                        <div>
                          <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Torso Asymmetry Plot</h5>
                          <AsymmetryPlot 
                            asymmetryData={calculationResults.asymmetry_per_frame.torso_asymmetry}
                            frameCount={frameCount}
                            label="Torso Asymmetry (positive = right leaning, negative = left leaning)"
                            color="rgb(75, 192, 192)"
                            backgroundColor="rgba(75, 192, 192, 0.2)"
                            fps={fps}
                            calculationResults={calculationResults}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quad Asymmetry */}
                  {formAnalysis.quad_asymmetry && (
                    <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: 'var(--card-bg)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                      <div style={{ marginBottom: '15px' }}>
                        <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Quad Asymmetry Analysis</h5>
                        <AsymmetryAnalysis asymmetryAnalysis={formAnalysis.quad_asymmetry} title="Quad Asymmetry Analysis" />
                      </div>
                      {calculationResults?.asymmetry_per_frame?.quad_asymmetry && (
                        <div>
                          <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Quad Asymmetry Plot</h5>
                          <AsymmetryPlot 
                            asymmetryData={calculationResults.asymmetry_per_frame.quad_asymmetry}
                            frameCount={frameCount}
                            label="Quad Asymmetry (positive = right forward, negative = left forward)"
                            color="rgb(255, 99, 132)"
                            backgroundColor="rgba(255, 99, 132, 0.2)"
                            fps={fps}
                            calculationResults={calculationResults}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ankle Asymmetry */}
                  {formAnalysis.ankle_asymmetry && (
                    <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: 'var(--card-bg)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                      <div style={{ marginBottom: '15px' }}>
                        <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Ankle Asymmetry Analysis</h5>
                        <AsymmetryAnalysis asymmetryAnalysis={formAnalysis.ankle_asymmetry} title="Ankle Asymmetry Analysis" />
                      </div>
                      {calculationResults?.asymmetry_per_frame?.ankle_asymmetry && (
                        <div>
                          <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Ankle Asymmetry Plot</h5>
                          <AsymmetryPlot 
                            asymmetryData={calculationResults.asymmetry_per_frame.ankle_asymmetry}
                            frameCount={frameCount}
                            label="Ankle Asymmetry (positive = right forward, negative = left forward)"
                            color="rgb(54, 162, 235)"
                            backgroundColor="rgba(54, 162, 235, 0.2)"
                            fps={fps}
                            calculationResults={calculationResults}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          );
        })()}

        {/* Rep Consistency */}
        <div style={{ margin: '2px 0' }}>
          <span>Rep Consistency: {componentScores.rep_consistency || 'N/A'}/100</span>
          {formAnalysis.rep_consistency && (
            <button
              onClick={() => onToggleExpanded('rep_consistency')}
              style={{
                marginLeft: '8px',
                padding: '2px 6px',
                border: '1px solid var(--border-color)',
                borderRadius: '3px',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              {expandedStates.rep_consistency ? '−' : '+'}
            </button>
          )}
        </div>
        {expandedStates.rep_consistency && formAnalysis.rep_consistency && (
          <div style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '10px', padding: '10px', backgroundColor: 'var(--card-bg)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            <div style={{ marginBottom: '15px' }}>
              <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Rep-to-Rep Consistency Analysis</h5>
              <RepConsistencyAnalysis consistencyAnalysis={formAnalysis.rep_consistency} />
            </div>
            {squatPhases?.reps && calculationResults && (
              <div>
                <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Per-Rep Angle Analysis</h5>
                <details style={{ marginTop: '15px' }}>
                  <summary style={{ 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    padding: '8px',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)'
                  }}>
                    📊 Per-Rep Angle Analysis ({squatPhases.reps.length} {squatPhases.reps.length === 1 ? 'Rep' : 'Reps'})
                  </summary>
                  <div style={{ marginTop: '10px' }}>
                    {squatPhases.reps.map((rep, index) => {
                      const repNum = index + 1;
                      const repFrames = [];
                      for (let i = rep.start_frame; i <= rep.end_frame; i++) {
                        repFrames.push(i);
                      }
                      
                      const torsoAngles = calculationResults.angles_per_frame?.torso_angle || [];
                      const quadAngles = calculationResults.angles_per_frame?.quad_angle || [];
                      const ankleAngles = calculationResults.angles_per_frame?.ankle_angle || [];
                      
                      const repTorsoAngles = repFrames.map(frame => 
                        frame < torsoAngles.length ? torsoAngles[frame] : null
                      );
                      const repQuadAngles = repFrames.map(frame => 
                        frame < quadAngles.length ? quadAngles[frame] : null
                      );
                      const repAnkleAngles = repFrames.map(frame => 
                        frame < ankleAngles.length ? ankleAngles[frame] : null
                      );
                      
                      return (
                        <PerRepPlot
                          key={index}
                          rep={rep}
                          repNum={repNum}
                          torsoAngles={repTorsoAngles}
                          quadAngles={repQuadAngles}
                          ankleAngles={repAnkleAngles}
                          startFrame={rep.start_frame}
                          endFrame={rep.end_frame}
                          fps={fps}
                          calculationResults={calculationResults}
                        />
                      );
                    })}
                  </div>
                </details>
              </div>
            )}
          </div>
        )}

        {/* Knee Valgus (Hidden) */}
        {formAnalysis.knee_valgus && (
          <div style={{ display: 'none' }}>
            <div style={{ margin: '2px 0' }}>
              <span>Knee Valgus</span>
              <button
                onClick={() => onToggleExpanded('knee_valgus')}
                style={{
                  marginLeft: '8px',
                  padding: '2px 6px',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                {expandedStates.knee_valgus ? '−' : '+'}
              </button>
            </div>
            {expandedStates.knee_valgus && formAnalysis.knee_valgus && (
              <div style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '10px', padding: '10px', backgroundColor: 'var(--card-bg)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                <KneeValgusAnalysis valgusAnalysis={formAnalysis.knee_valgus} fps={fps} calculationResults={calculationResults} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ScoreBreakdown;

