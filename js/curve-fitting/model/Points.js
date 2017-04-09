// Copyright 2015-2017, University of Colorado Boulder

/**
 * Points is a collection of Point in 'Curve Fitting' simulation.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );

  /**
   * @constructor
   */
  function Points() {
    ObservableArray.call( this );
  }

  curveFitting.register( 'Points', Points );

  return inherit( ObservableArray, Points, {
    /**
     * Resets the model
     * @public
     */
    reset: function() {
      this.clear();
    },

    /**
     * Gets all points that are within the graph bound and are not animated.
     * Only these points are used for curve-fitting calculations
     * @returns {Array.<Point>}
     * @public
     */
    getPointsOnGraph: function() {
      return this.getArray().filter( function( point ) {
        return point.isInsideGraphProperty.value && !point.animated;
      } );
    },

    /**
     * Gets the number of points on the graph area that should be used for curve-fitting calculations
     * @returns {number}
     * @public
     */
    getNumberPointsOnGraph: function() {
      return this.getPointsOnGraph().length;
    },

    /**
     * Returns the number of points on graph that have a unique x position.
     * @returns (number)
     * @public
     */
    getNumberUniquePositionX: function() {
      return _.chain( this.getPointsOnGraph() ).map( function( point ) {
        return point.positionProperty.value.x;
      } ).uniq().value().length;
    }
  } );
} );