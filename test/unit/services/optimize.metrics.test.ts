import { expect } from 'chai';
import Optimize, { Optimizations } from '../../../src/apps/cli/commands/optimize';

describe('Optimize.collectMetricsData', () => {
  it('sets metrics metadata when selected optimizations are applied', () => {
    // Create Optimize command instance
    const cmd = new (Optimize as any)([], {});
    // Simulate user-selected optimization
    cmd.selectedOptimizations = [
      Optimizations.MOVE_DUPLICATES_TO_COMPONENTS,
    ];

    // Ensure clean metrics state
    (cmd as any).metricsMetadata = {};

    // Fake optimizer report
    const report = {
      moveDuplicatesToComponents: [],
    } as any;

    // Call private method (allowed in tests)
    (cmd as any).collectMetricsData(report);

    // Assertions
    expect((cmd as any).metricsMetadata.optimized).to.equal(true);
    expect(
      (cmd as any).metricsMetadata.optimization_moveDuplicatesToComponents
    ).to.equal(true);
  });

  it('does not set metrics metadata when optimization was not selected', () => {
    const cmd = new (Optimize as any)([], {});
    // Different optimization selected
    cmd.selectedOptimizations = [
      Optimizations.REMOVE_COMPONENTS,
    ];

    (cmd as any).metricsMetadata = {};
    const report = {
      moveDuplicatesToComponents: [],
    } as any;

    (cmd as any).collectMetricsData(report);

    expect((cmd as any).metricsMetadata.optimized).to.not.equal(true);
    expect(
      (cmd as any).metricsMetadata.optimization_moveDuplicatesToComponents
    ).to.equal(undefined);
  });
});
