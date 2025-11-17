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

const detailCardStyle = {
  marginTop: '12px',
  padding: '12px',
  backgroundColor: '#f8f9fa',
  borderRadius: '10px',
  border: '1px solid #e0e0e0'
};

function ScoreBreakdown({ 
  formAnalysis, 
  componentScores, 
  calculationResults,
  squatPhases,
  frameCount,
  expandedStates,
  onToggleExpanded 
}) {
  if (!formAnalysis?.final_score) return null;

  const finalScore = formAnalysis.final_score.final_score;
  const grade = formAnalysis.final_score.grade;

  const scoreColor = finalScore >= 90 ? '#28a745' :
                     finalScore >= 75 ? '#ffc107' :
                     finalScore >= 60 ? '#fd7e14' : '#dc3545';

  return (
    <div style={{
      marginTop: '20px',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      border: '3px solid #007bff',
      borderRadius: '8px',
      textAlign: 'center'
    }}>
      <h2 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>
        Overall Form Score
      </h2>
      <div style={{
        fontSize: '48px',
        fontWeight: 'bold',
        color: scoreColor,
        margin: '10px 0'
      }}>
        {finalScore}/100
      </div>
      <p style={{
        margin: '5px 0',
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#666'
      }}>
        {grade}
      </p>
      <div style={{
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#e9ecef',
        borderRadius: '4px',
        fontSize: '12px',
        textAlign: 'left'
      }}>
        <p style={{ margin: '5px 0', fontWeight: 'bold' }}>Score Breakdown:</p>
        
        {/* Torso Angle */}
        <div style={{ margin: '2px 0' }}>
          <span>Torso Angle: {componentScores.torso_angle || 'N/A'}/100</span>
          {formAnalysis.torso_angle && (
            <button
              onClick={() => onToggleExpanded('torso_angle')}
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
              {expandedStates.torso_angle ? '−' : '+'}
            </button>
          )}
        </div>
        {expandedStates.torso_angle && formAnalysis.torso_angle && (
          <div style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
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
                border: '1px solid #ccc',
                borderRadius: '3px',
                backgroundColor: '#fff',
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
          <div style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
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
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                {expandedStates.movement ? '−' : '+'}
              </button>
            </div>
            {expandedStates.movement && formAnalysis.glute_dominance && (
              <div style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                <MovementAnalysis movementAnalysis={formAnalysis.glute_dominance} />
              </div>
            )}
          </>
        )}

        {/* Torso Asymmetry */}
        <div style={{ margin: '2px 0' }}>
          <span>Torso Asymmetry: {componentScores.torso_asymmetry || 'N/A'}/100</span>
          {formAnalysis.torso_asymmetry && (
            <button
              onClick={() => onToggleExpanded('torso_asymmetry')}
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
              {expandedStates.torso_asymmetry ? '−' : '+'}
            </button>
          )}
        </div>
        {expandedStates.torso_asymmetry && formAnalysis.torso_asymmetry && (
          <div style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
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
                />
              </div>
            )}
          </div>
        )}

        {/* Quad Asymmetry */}
        <div style={{ margin: '2px 0' }}>
          <span>Quad Asymmetry: {componentScores.quad_asymmetry || 'N/A'}/100</span>
          {formAnalysis.quad_asymmetry && (
            <button
              onClick={() => onToggleExpanded('quad_asymmetry')}
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
              {expandedStates.quad_asymmetry ? '−' : '+'}
            </button>
          )}
        </div>
        {expandedStates.quad_asymmetry && formAnalysis.quad_asymmetry && (
          <div style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
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
                />
              </div>
            )}
          </div>
        )}

        {/* Ankle Asymmetry */}
        <div style={{ margin: '2px 0' }}>
          <span>Ankle Asymmetry: {componentScores.ankle_asymmetry || 'N/A'}/100</span>
          {formAnalysis.ankle_asymmetry && (
            <button
              onClick={() => onToggleExpanded('ankle_asymmetry')}
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
              {expandedStates.ankle_asymmetry ? '−' : '+'}
            </button>
          )}
        </div>
        {expandedStates.ankle_asymmetry && formAnalysis.ankle_asymmetry && (
          <div style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
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
                />
              </div>
            )}
          </div>
        )}

        {/* Rep Consistency */}
        <div style={{ margin: '2px 0' }}>
          <span>Rep Consistency: {componentScores.rep_consistency || 'N/A'}/100</span>
          {formAnalysis.rep_consistency && (
            <button
              onClick={() => onToggleExpanded('rep_consistency')}
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
              {expandedStates.rep_consistency ? '−' : '+'}
            </button>
          )}
        </div>
        {expandedStates.rep_consistency && formAnalysis.rep_consistency && (
          <div style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
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
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
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
              <div style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                <KneeValgusAnalysis valgusAnalysis={formAnalysis.knee_valgus} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ScoreBreakdown;

