// Copyright 2017-2019, University of Colorado Boulder

/**
 * Points is a collection of Point in 'Curve Fitting' simulation.
 *
 * @author Martin Veillette (Berea College)
 */
define( require => {
  'use strict';

  // modules
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const ObservableArray = require( 'AXON/ObservableArray' );

  class Points extends ObservableArray {

    /**
     * Resets the model
     * @public
     */
    reset() {
      this.clear();
    }

    /**
     * Gets all points that are within the graph bound and are not animated.
     * Only these points are used for curve-fitting calculations
     * @returns {Array.<Point>}
     * @public
     */
    getPointsOnGraph() {
      return this.getArray().filter( point => point.isInsideGraphProperty.value && point.animation === null );
    }

    /**
     * Gets the number of points on the graph area that should be used for curve-fitting calculations
     * @returns {number}
     * @public
     */
    getNumberPointsOnGraph() {
      return this.getPointsOnGraph().length;
    }

    /**
     * Returns the number of points on graph that have a unique x position.
     * eg. if the x positions are [8,9,9,9,9,10], it would yield 3
     * @returns (number)
     * @public
     */
    getNumberUniquePositionX() {
      return _.chain( this.getPointsOnGraph() ).map( point => point.positionProperty.value.x ).uniq().value().length;
    }

  }

  curveFitting.register( 'Points', Points );

  return Points;
} );