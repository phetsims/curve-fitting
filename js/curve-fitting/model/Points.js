// Copyright 2015-2017, University of Colorado Boulder

/**
 * Point model in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
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
     * @public Resets the model
     */
    reset: function() {
      this.clear();
    },

    /**
     * Gets all points that are within the graph bounds.
     *
     * @returns {Array.<Point>}
     * @public
     */
    getPointsOnGraph: function() {
      return this.getArray().filter( function( point ) {
        return point.isInsideGraph;
      } );
    },

    /**
     * Gets the number of points inside the graph bounds.
     * @returns {number}
     * @public (read-only)
     */
    getNumberOfPointsOnGraph: function() {
      return this.getPointsOnGraph().length;
    }
  } );
} );