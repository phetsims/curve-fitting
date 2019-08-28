// Copyright 2017-2019, University of Colorado Boulder

/**
 * Points is a collection of Point in 'Curve Fitting' simulation.
 *
 * @author Martin Veillette (Berea College)
 * @author Saurabh Totey
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
     * @returns {Array.<Point>} all points that should be used for calculating r^2 and X^2 values
     * @public
     */
    getRelevantPoints() {
      return this.getArray().filter( point => point.isInsideGraphProperty.value && point.animation === null );
    }

    get relevantPoints() { return this.getRelevantPoints(); }

    /**
     * Returns the number of points on graph that have a unique x position.
     * eg. if the x positions are [8,9,9,9,9,10], it would yield 3
     * @returns {number} the amount of points with a unique x position
     * @public
     */
    getNumberUniquePositionX() {
      return _.chain( this.relevantPoints ).map( point => point.positionProperty.value.x ).uniq().value().length;
    }

  }

  return curveFitting.register( 'Points', Points );
} );
