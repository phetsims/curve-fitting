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
     * Gets all points that are within the graph bounds.
     *
     * @returns {Array.<Point>}
     * @public
     */
    getPointsOnGraph: function() {
      return this.getArray().filter( function( point ) {
        return point.isInsideGraphProperty.value;
      } );
    }
  } );
} );