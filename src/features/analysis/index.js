/**
 * Analysis Feature - Main Export
 * 
 * This module provides a centralized export point for all analysis
 * related components and pages.
 * 
 * Usage:
 *   import { AngleAnalysis, AnalysisHistoryPage } from '../features/analysis';
 */

// Analysis Components
export { default as AnalysisFilterBar } from './components/AnalysisFilterBar';
export { default as AnalysisSectionHeader } from './components/AnalysisSectionHeader';
export { default as AnalysisUploader } from './components/AnalysisUploader';
export { default as AngleAnalysis } from './components/AngleAnalysis';
export { default as AsymmetryAnalysis } from './components/AsymmetryAnalysis';
export { default as KneeValgusAnalysis } from './components/KneeValgusAnalysis';
export { default as MovementAnalysis } from './components/MovementAnalysis';
export { default as RepConsistencyAnalysis } from './components/RepConsistencyAnalysis';

// Chart Components
export { default as AnglePlot } from './components/AnglePlot';
export { default as AsymmetryPlot } from './components/AsymmetryPlot';
export { default as FPPAPlot } from './components/FPPAPlot';
export { default as PerRepPlot } from './components/PerRepPlot';

// Pages
export { default as AnalysisHistoryPage } from './pages/AnalysisHistoryPage';
export { default as AnalysisDetailPage } from './pages/AnalysisDetailPage';

