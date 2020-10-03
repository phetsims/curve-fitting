// Copyright 2020, University of Colorado Boulder

/**
 * createPoints is a collection of Point in 'Curve Fitting' simulation.
 *
 * @author Martin Veillette (Berea College)
 * @author Saurabh Totey
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import curveFitting from '../../curveFitting.js';

const createPoints = () => {

  // @public {Points} - Points for plotting curve. This includes points that are outside the bounds of the graph,
  // so be careful to call getRelevantPoints when using points in calculations. Order of the points doesn't matter.
  const points = createObservableArray();

  /**
   * Gets all points that are within the graph bound and are not animated.
   * Only these points are used for curve-fitting calculations
   * @returns {Array.<Point>} all points that should be used for calculating r^2 and X^2 values
   * @public
   */
  points.getRelevantPoints = () => points.filter( point => point.isInsideGraphProperty.value && point.animation === null );

  /**
   * Returns the number of points on graph that have a unique x position.
   * eg. if the x positions are [8,9,9,9,9,10], it would yield 3
   * @returns {number} the amount of points with a unique x position
   * @public
   */
  points.getNumberUniquePositionX = () => _.chain( points.getRelevantPoints() ).map( point => point.positionProperty.value.x ).uniq().value().length;

  return points;
};

curveFitting.register( 'createPoints', createPoints );
export default createPoints;
