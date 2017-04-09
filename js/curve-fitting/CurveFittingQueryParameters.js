// Copyright 2017, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );

  var CurveFittingQueryParameters = window.QueryStringMachine.getAll( {

    snapToGrid: {
      type: 'boolean',
      defaultValue: false
    },

    animatedPoints: {
      type: 'boolean',
      defaultValue: false
    },

    debugLine: {
      type: 'boolean',
      defaultValue: true
    }
  } );

  curveFitting.register( 'CurveFittingQueryParameters', CurveFittingQueryParameters );

  return CurveFittingQueryParameters;
} );